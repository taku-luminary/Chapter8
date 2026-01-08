"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Category } from "../../../_types/Post";
import styles from "./_styles/PostForm.module.css";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

type Props = {
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  title: string;
  content: string;
  selectedCategoryIds: number[];
  isOpen: boolean;
  isSubmitting: boolean; 
  setTitle: (v: string) => void;
  setContent: (v: string) => void;
  setIsOpen: (v: boolean) => void;
  toggleCategory: (categoryId: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  onDelete?: () => void; // 編集ページだけ渡す
  deleteLabel?: string;
};

export function PostForm({
  handleImageChange,
  title,
  content,
  selectedCategoryIds,
  isSubmitting,
  isOpen,
  setTitle,
  setContent,
  setIsOpen,
  toggleCategory,
  onSubmit,
  onDelete,
  submitLabel,
  deleteLabel = "削除",
}: Props) {

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const { token, sessionLoading } = useSupabaseSession()  
  

useEffect(() => {
      if (!token) return
  (async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/categories",{
      headers: {Authorization: token }});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch (e) {
      console.error(e);
      alert("カテゴリーの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  })();
}, [token, sessionLoading]);

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {/* タイトル */}
      <div className={styles.row}>
        <label htmlFor="title" className={styles.label}>タイトル</label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      {/* 内容 */}
      <div className={styles.row}>
        <label htmlFor="content" className={styles.label}>内容</label>
        <textarea
          id="content"
          name="content"
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      {/* サムネイル画像 */}
      <div className={styles.row}>
        <label htmlFor="thumbnailImageKey" className={styles.label}>サムネイル画像</label>
        <input
          id="thumbnailImageKey"
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      {/* カテゴリー */}
      <div className={styles.row}>
        <label className={styles.label}>カテゴリー</label>

        <div
          className={styles.selectBox}
          onClick={() =>{ if (isSubmitting || isLoading) return;
           setIsOpen(!isOpen)}}  
        >
          <div className={styles.chips}>
            {selectedCategoryIds.length === 0 && (
              <span className={styles.placeholder}>カテゴリーを選択</span>
            )}

            {selectedCategoryIds.map((id) => {
              const category = categories.find((c) => c.id === id);
              if (!category) return null;
              return (
                <span key={id} className={styles.chip}>
                  {category.name}
                </span>
              );
            })}
          </div>

          <span className={styles.arrow}>▼</span>
        </div>

        {isOpen && !isLoading && (
          <div className={styles.dropdown}>
            {categories.map((category) => {
              const selected = selectedCategoryIds.includes(category.id);
              return (
                <div
                  key={category.id}
                  className={`${styles.option} ${selected ? styles.optionSelected : ""}`}
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.name}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ボタン（編集ページだけ削除も出す） */}
      {onDelete ? (
        <div className={styles.updateDelete}>
          <div className={styles.row}>
            <button type="submit" className={styles.updataButton}disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : submitLabel}
            </button>
          </div>
          <div className={styles.row}>
            <button type="button" onClick={onDelete} className={styles.deleteButton} disabled={isSubmitting}>
              {deleteLabel}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.row}>
          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "送信中..." : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
