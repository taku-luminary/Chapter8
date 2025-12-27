"use client";
import { PostForm } from "../_components/PostForm";
import { useEffect, useState } from "react";
import styles from "./_styles/Posts_New.module.css";
import { Category } from "../../../_types/Post";

export default function AdminPostsNewPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
        categories: selectedCategoryIds.map((id) => ({ id })), // ★idはnumberなのでNumber不要
      };

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setThumbnailUrl("");
      setSelectedCategoryIds([]); // ★追加
      setIsOpen(false);          // ★追加
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    } finally {
    setIsSubmitting(false); // 送信終了（成功でも失敗でも）
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const { categories } = (await res.json()) as {
          status: string;
          categories: Category[];
        };

        setCategories(categories);
      } catch (error) {
        console.error(error);
        alert("カテゴリーの取得に失敗しました");
      }
    })();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId); // 解除
      }
      return [...prev, categoryId]; // 追加
    });
  };


  return (
      <div className={styles.container}>
        <h2 className={styles.topLetter}>記事作成</h2>

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
          submitLabel="作成"
          isSubmitting={isSubmitting}
        />
      </div>
  );
}
