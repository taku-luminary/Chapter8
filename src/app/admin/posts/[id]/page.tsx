"use client";
import { PostForm } from "../_components/PostForm";
import { ChangeEvent, useEffect, useState } from "react";
import styles from "./_styles/Posts_[id].module.css";
import { Post } from "../../../_types/Post";
import { useRouter, useParams } from "next/navigation";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { supabase } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'  // 固有IDを生成するライブラリ

export default function AdminEditPage() {
  const [thumbnailImageKey, setThumbnailImageKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const { token, sessionLoading } = useSupabaseSession()  
  const postId = typeof idParam === "string" ? Number(idParam) : NaN;  // 1) idがstringのときだけ数値化
  const isValidPostId = Number.isFinite(postId) && postId > 0; // 2) 有効判定（NaNじゃない、かつ 1以上）
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
    setThumbnailImageKey(data.path)
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // 二重送信ガード
    if (!token) return
    if (selectedCategoryIds.length === 0) {
      alert("カテゴリーを1つ以上選択してください");
      return;
    }

    setIsSubmitting(true); // 送信開始
    
    try {
      const body = {
        title,
        content,
        thumbnailImageKey,
        categories: selectedCategoryIds.map((id) => ({ id })), 
      };

      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",Authorization: token },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`エラーが発生しました: ${data.status ?? "不明なエラー"}`);
        return;
      }

      const data = await res.json();
      alert(`記事を更新しました！（id: ${data.post.id}）`);

    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    } finally {
    setIsSubmitting(false); // 送信終了（成功でも失敗でも）
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
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId); // 解除
      }
      return [...prev, categoryId]; // 追加
    });
  };

  useEffect(() => {
  if (sessionLoading) return
  if (!token) return
  if (!isValidPostId) return 
    (async () => {
      const res = await fetch(`/api/admin/posts/${postId}`,{
      headers: {Authorization: token },
    });
    if (!res.ok) {
      alert("記事の取得に失敗しました");
      return;
  }
  
  const json = await res.json(); // { status: "OK", post: {...} }
  const data = json.post as Post; // ← ここが重要（postを取り出す）

    setTitle(data.title ?? "");
    setContent(data.content ?? "");
    setThumbnailImageKey(data.thumbnailImageKey ?? "");
    setSelectedCategoryIds((data.postCategories ?? []).map((c) => c.category.id));
  })();
}, [sessionLoading, isValidPostId, postId, token]);

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

return (
  <div className={styles.container}>
    <h2 className={styles.topLetter}>記事編集</h2>

    <PostForm
      handleImageChange={handleImageChange}
      title={title}
      content={content}
      selectedCategoryIds={selectedCategoryIds}
      isOpen={isOpen}
      setTitle={setTitle}
      setContent={setContent}
      setIsOpen={setIsOpen}
      toggleCategory={toggleCategory}
      onSubmit={handleSubmit}
      submitLabel="更新"
      onDelete={handleDelete}
      isSubmitting={isSubmitting}
    />
  </div>
);
}
