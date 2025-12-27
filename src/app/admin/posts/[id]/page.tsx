"use client";
import { PostForm } from "../_components/PostForm";
import { useEffect, useState } from "react";
import styles from "./_styles/Posts_[id].module.css";
import { Category, Post } from "../../../_types/Post";
import { useRouter, useParams } from "next/navigation";

export default function AdminEditPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;  
  const postId = typeof idParam === "string" ? Number(idParam) : NaN;  // 1) idがstringのときだけ数値化
  const isValidPostId = Number.isFinite(postId) && postId > 0; // 2) 有効判定（NaNじゃない、かつ 1以上）
  if (!isValidPostId) {
    return (
      <div className={styles.container}>
        <p>URLのIDが不正です（id: {String(idParam)}）</p>
      </div>
    );
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // 二重送信ガード
    setIsSubmitting(true); // 送信開始
    if (selectedCategoryIds.length === 0) {
      alert("カテゴリーを1つ以上選択してください");
      return;
    }

    try {
      const body = {
        title,
        content,
        thumbnailUrl,
        categories: selectedCategoryIds.map((id) => ({ id })), 
      };

      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`エラーが発生しました: ${data.status ?? "不明なエラー"}`);
        return;
      }

      const data = await res.json();
      alert(`記事を更新しました！（id: ${data.id}）`);

    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    } finally {
    setIsSubmitting(false); // 送信終了（成功でも失敗でも）
    }
  };

  const handleDelete = async () => {
    const ok = confirm("本当に削除しますか？");
    if (!ok) return;

    const res = await fetch(`/api/admin/posts/${postId}`, {
      method: "DELETE",
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
    (async () => {
      const res = await fetch(`/api/admin/posts/${postId}`);
    if (!res.ok) {
      alert("記事の取得に失敗しました");
      return;
    }
    
    const json = await res.json(); // { status: "OK", post: {...} }
    const data = json.post as Post; // ← ここが重要（postを取り出す）

      setTitle(data.title ?? "");
      setContent(data.content ?? "");
      setThumbnailUrl(data.thumbnailUrl ?? "");
      setSelectedCategoryIds((data.postCategories ?? []).map((c) => c.category.id));
    })();
  }, [isValidPostId,postId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCategories(data.categories);
      } catch (e) {
        console.error(e);
        alert("カテゴリーの取得に失敗しました");
      }
    })();
  }, []);


  return (
      <div className={styles.container}>
        <h2 className={styles.topLetter}>記事編集</h2>

    <PostForm
      title={title}
      content={content}
      thumbnailUrl={thumbnailUrl}
      categories={categories}
      selectedCategoryIds={selectedCategoryIds}
      isOpen={isOpen}
      setTitle={setTitle}
      setContent={setContent}
      setThumbnailUrl={setThumbnailUrl}
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
