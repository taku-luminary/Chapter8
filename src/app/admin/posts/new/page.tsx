"use client";
import { PostForm } from "../_components/PostForm";
import { ChangeEvent, useState } from "react";
import styles from "./_styles/Posts_New.module.css";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { supabase } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'  // 固有IDを生成するライブラリ
import { SubmitHandler, useForm } from "react-hook-form";
import { PostFormInputs } from "../../../_types/Post";

export default function AdminPostsNewPage() {
  const { register,handleSubmit, watch,formState: { errors , isSubmitting},setValue} = useForm<PostFormInputs>({
  defaultValues: {title:"",content:"",thumbnailImageKey:"",categories:[]}
})
  const selectedCategoryIds = watch("categories")
  //watch("categories") は RHF内部ストアの categories を購読して、常に最新値を返す
  //categories が変わると その watch を使っているコンポーネントは再レンダリングされる（useStateっぽい）
  //setValue は 更新（書き込み）担当、watch は 読み取り＋監視担当
  const [isOpen, setIsOpen] = useState(false);
  const { token, sessionLoading } = useSupabaseSession()

  if (sessionLoading) {
    return <p>セッション確認中...</p>
  }
  if (!token) {
    return <p>ログインが必要です</p> // or router.replace('/login')
  }
  const onSubmit: SubmitHandler<PostFormInputs>  = async (data) => {
    // registerされた全フィールドの値をdataにオブジェクトに入れて集める
    if (isSubmitting) return; // 二重送信ガード
    if (selectedCategoryIds.length === 0) {
      alert("カテゴリーを1つ以上選択してください");
      return;
    }

    try {
      const body = {
        title:data.title,
        content:data.content,
        thumbnailImageKey:data.thumbnailImageKey,
        categories: data.categories.map((id) => ({ id })), // ★idはnumberなのでNumber不要
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" ,Authorization: token,},
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`エラーが発生しました: ${data.status ?? "不明なエラー"}`);
        return;
      }

      const result = await res.json();
      alert(`記事を作成しました！（id: ${result.id}）`);

      // フォームをリセット
      setIsOpen(false);      
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    } 
  };

  const toggleCategory = (categoryId: number) => {
    if(selectedCategoryIds.includes(categoryId)){
    setValue("categories",selectedCategoryIds.filter((id) => id !== categoryId))// 解除
    return
    }
    setValue("categories",[...selectedCategoryIds, categoryId])
  };

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
    const { data, error } = await supabase.storage
      .from('post_thumbnail')// ここでバケット名を指定
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    // アップロードに失敗したらエラーを表示して終了
    if (error) {
      alert(error.message)
      return
    }

    // data.pathに、画像固有のkeyが入っているので、thumbnailImageKeyに格納する
    setValue("thumbnailImageKey", data.path)
    // setValue("thumbnailImageKey", data.path) は
    // RHFのフォーム状態（内部ストア）に
    // 「thumbnailImageKey: data.path」という形で値を書き込んでいる。
    // data.path は Supabase Storage にアップロード後に確定した「保存先キー（path）」。

    // {...register("content")} は
    // textarea のユーザー入力値（文字列）を onChange などで自動取得し、
    // RHFが「content: 入力文字列」として内部ストアに保存できるので便利。

    // 一方 file input は、ユーザー入力の結果が「文字列」ではなく File（event.target.files）であり、
    // さらに今回フォーム/DBに持たせたいのは「画像そのもの」ではなく
    // アップロード後に得られる保存先キー（data.path）という文字列。
    // そのため file input は register せず、アップロード成功後に setValue で値を入れている。

    // キー名（thumbnailImageKey）は、フォーム型・API・DBモデルと揃えると変換が不要になり事故りにくい（推奨）。

  }


  return (
      <div className={styles.container}>
        <h2 className={styles.topLetter}>記事作成</h2>

        <PostForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          toggleCategory={toggleCategory}
          onSubmit={onSubmit}
          handleImageChange={handleImageChange}
          submitLabel="作成"
          isSubmitting={isSubmitting}
          register={register}
          handleSubmit={handleSubmit}
          selectedCategoryIds={selectedCategoryIds}
        />
      </div>
  );
}
