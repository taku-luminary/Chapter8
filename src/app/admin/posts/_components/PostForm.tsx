"use client";

import { useEffect, useState } from "react";
import { Category } from "../../../_types/Post";
import styles from "./_styles/PostForm.module.css";


type Props = {
  title: string;
  content: string;
  thumbnailUrl: string;
  selectedCategoryIds: number[];
  isOpen: boolean;
  isSubmitting?: boolean; // ← 追加


  setTitle: (v: string) => void;
  setContent: (v: string) => void;
  setThumbnailUrl: (v: string) => void;
  setIsOpen: (v: boolean) => void;
  toggleCategory: (categoryId: number) => void;

  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;

  onDelete?: () => void; // 編集ページだけ渡す
  deleteLabel?: string;
};

export function PostForm({
  title,
  content,
  thumbnailUrl,
  selectedCategoryIds,
  isOpen,
  setTitle,
  setContent,
  setThumbnailUrl,
  setIsOpen,
  toggleCategory,
  onSubmit,
  submitLabel,
  onDelete,
  deleteLabel = "削除",
}: Props) {

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCategories(data.categories ?? []);
      } catch (e) {
        console.error(e);
        alert("カテゴリーの取得に失敗しました");
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, []);

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

      {/* サムネイルURL */}
      <div className={styles.row}>
        <label htmlFor="thumbnailUrl" className={styles.label}>サムネイルURL</label>
        <input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="text"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      {/* カテゴリー */}
      <div className={styles.row}>
        <label className={styles.label}>カテゴリー</label>

        <div
          className={styles.selectBox}
          onClick={() =>{    if (isSubmitting) return; setIsOpen(!isOpen)}}  
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

        {isOpen && (
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
