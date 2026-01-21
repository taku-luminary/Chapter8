"use client";
import { PostForm } from "../_components/PostForm";
import { ChangeEvent, useEffect, useState } from "react";
import styles from "./_styles/Posts_[id].module.css";
import { Post, PostFormInputs } from "../../../_types/Post";
import { useRouter, useParams } from "next/navigation";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { supabase } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'  // 固有IDを生成するライブラリ
import { SubmitHandler, useForm } from "react-hook-form";
import useSWR from "swr";

type GetPostResponse = { status: string; post: Post };

const fetcherWithToken = async ([url, token]: [string, string]) => {
  const res = await fetch(url, { headers: { Authorization: token } });
  const json = (await res.json()) as GetPostResponse;

  if (!res.ok) {
    // ここはAPIの返し方に合わせて調整
    throw new Error(json?.status ?? "記事の取得に失敗しました");
  }
  return json;
};

export default function AdminEditPage() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const { token, sessionLoading } = useSupabaseSession()  
  const postId = typeof idParam === "string" ? Number(idParam) : NaN;  // 1) idがstringのときだけ数値化
  const isValidPostId = Number.isFinite(postId) && postId > 0; // 2) 有効判定（NaNじゃない、かつ 1以上）

  const { register,handleSubmit, watch,formState: { errors , isSubmitting},setValue,reset} = useForm<PostFormInputs>({
    defaultValues: {title:"",content:"",thumbnailImageKey:"",categories:[]}
  })
  const selectedCategoryIds = watch("categories")

    //  token と postId が揃ったらだけ取得
  const swrKey = !sessionLoading && token && isValidPostId
    ? [`/api/admin/posts/${postId}`, token] as const
    : null;

const { data: swrData, error: swrError, isLoading, mutate } = useSWR(swrKey, fetcherWithToken);

    //  取得できたらフォームに一括反映（setValue連打より安全）
  useEffect(() => {
    const post = swrData?.post;
    if (!post) return;

    reset({
      title: post.title ?? "",
      content: post.content ?? "",
      thumbnailImageKey: post.thumbnailImageKey ?? "",
      categories: (post.postCategories ?? []).map((c) => c.category.id),
    });
  }, [swrData, reset]);


  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    if (!event.target.files || event.target.files.length == 0) {
      // 画像が選択されていないのでreturn
      return
    }

    const file = event.target.files[0] // 選択された画像を取得

    const filePath = `private/${uuidv4()}` // ファイルパスを指定

    // Supabaseに画像をアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post_thumbnail')// ここでバケット名を指定
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    // アップロードに失敗したらエラーを表示して終了
    if (uploadError) {
      alert(uploadError.message)
      return
    }

    // data.pathに、画像固有のkeyが入っているので、thumbnailImageKeyに格納する
    setValue("thumbnailImageKey", uploadData.path)
  }

  //・onSubmit は、RHF によって集められた data を受け取るためにユーザーが定義した関数である。
  //・data を集める処理自体は、この関数の中には存在しない。
  //PostForm.tsxの<form onSubmit={handleSubmit(onSubmit)}>
  //・ここで使われている handleSubmit は react-hook-form が提供する関数。
  //・RHF の handleSubmit は、以下のような submit 用の関数を内部で生成する。
  // const submitHandler = async (event) => {
  // event.preventDefault();
  // const data = getValuesFromRHFStore();  内部ストアから値を集めて data を生成する
  // await onSubmit(data);};  handleSubmit(onSubmit) と書いた通り、引数として渡された onSubmit に data を渡して実行する
  //・つまり、data を集めているのは RHF の handleSubmit
  //・onSubmit は、集められた data を受け取るだけの関数
  const onSubmit: SubmitHandler<PostFormInputs> = async (data) => {
    if (isSubmitting) return; // 二重送信ガード
    if (!token) return
    if (data.categories.length === 0) {
      alert("カテゴリーを1つ以上選択してください");
      return;
    }
    
    try {
      const body = {
        title:data.title,
        content:data.content,
        thumbnailImageKey:data.thumbnailImageKey,
        categories: data.categories.map((id) => ({ id })), 
      };

      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",Authorization: token },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(`エラーが発生しました: ${json.status ?? "不明なエラー"}`);
        return;
      }

      alert(`記事を更新しました！（id: ${json.post.id}）`);

      //  更新後に最新を再取得
      mutate();
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    } 
  };

  const handleDelete = async () => {
    if (!token) return
    const ok = confirm("本当に削除しますか？");
    if (!ok) return;

    const res = await fetch(`/api/admin/posts/${postId}`, {
      method: "DELETE",
      headers: {Authorization: token },
    });

    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }

    alert("削除しました！");
    router.push("/admin/posts");
  };

  const toggleCategory = (categoryId: number) => {
    if (selectedCategoryIds.includes(categoryId)) {
      setValue(
        "categories",
        selectedCategoryIds.filter((id) => id !== categoryId)
      );
    } else {
      setValue(
        "categories",
        [...selectedCategoryIds, categoryId]
      );
    }
  };


  //  SWRのローディング/エラー
  if (sessionLoading) return <p>読み込み中...</p>
  if (!token) {
    return <p>ログインが必要です</p> // or router.replace('/login')
  }

  if (!isValidPostId) {
    return (
      <div className={styles.container}>
        <p>URLのIDが不正です（id: {String(idParam)}）</p>
      </div>
    );
  }

  // SWRの状態チェック
  if (isLoading) return <p>記事を読み込み中...</p>;
  if (swrError) {
    return <p>記事の取得に失敗しました: {swrError instanceof Error ? swrError.message : String(swrError)}</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.topLetter}>記事編集</h2>

      <PostForm
        handleImageChange={handleImageChange}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        toggleCategory={toggleCategory}
        onSubmit={onSubmit}
        submitLabel="更新"
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
        register={register}
        handleSubmit={handleSubmit}
        selectedCategoryIds={selectedCategoryIds}
      />
    </div>
  );
}
