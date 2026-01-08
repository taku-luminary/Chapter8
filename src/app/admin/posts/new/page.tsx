"use client";
import { PostForm } from "../_components/PostForm";
import { ChangeEvent, useState } from "react";
import styles from "./_styles/Posts_New.module.css";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { supabase } from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid'  // 固有IDを生成するライブラリ

export default function AdminPostsNewPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { token, sessionLoading } = useSupabaseSession()
  const [thumbnailImageKey, setThumbnailImageKey] = useState('')

  if (sessionLoading) {
    return <p>セッション確認中...</p>
  }
  if (!token) {
    return <p>ログインが必要です</p> // or router.replace('/login')
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // 二重送信ガード

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
        categories: selectedCategoryIds.map((id) => ({ id })), // ★idはnumberなのでNumber不要
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

      const data = await res.json();
      alert(`記事を作成しました！（id: ${data.id}）`);

      // フォームをリセット
      setTitle("");
      setContent("");
      setSelectedCategoryIds([]); // ★追加
      setIsOpen(false);          // ★追加
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    } finally {
    setIsSubmitting(false); // 送信終了（成功でも失敗でも）
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId); // 解除
      }
      return [...prev, categoryId]; // 追加
    });
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
    setThumbnailImageKey(data.path)
  }


  return (
      <div className={styles.container}>
        <h2 className={styles.topLetter}>記事作成</h2>

        <PostForm
          title={title}
          content={content}
          selectedCategoryIds={selectedCategoryIds}
          isOpen={isOpen}
          setTitle={setTitle}
          setContent={setContent}
          setIsOpen={setIsOpen}
          toggleCategory={toggleCategory}
          onSubmit={handleSubmit}
          handleImageChange={handleImageChange}
          submitLabel="作成"
          isSubmitting={isSubmitting}
        />
      </div>
  );
}
