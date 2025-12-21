"use client";

import { useEffect, useState } from "react";
import styles from "../../_styles_admin/New.module.css";
import { Category } from "../../../_types/Post";

export default function AdminPostsNewPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      <form method="post" className={styles.form} onSubmit={handleSubmit}>
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
          />
        </div>

        {/* サムネイルURL */}
        <div className={styles.row}>
          <label htmlFor="thumbnailUrl" className={styles.label}>サムネイルURL</label>
          <input
            id="thumbnailUrl"
            name="thumbnailUrl"
            type="text"
            className={styles.input}
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>

        {/* カテゴリー（画像風：枠の中にチップ＋クリックでON/OFF） */}
        <div className={styles.row}>
          <label className={styles.label}>カテゴリー</label>

          <div
            className={styles.selectBox}
            onClick={() => setIsOpen((prev) => !prev)}
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
              {categories.map((category) => { //DBからカテゴリを取り出す
                const selected = selectedCategoryIds.includes(category.id); //選択しているカテゴリの中にDBのカテゴidがあるか真偽

                return (
                  <div
                    key={category.id}
                    className={`${styles.option} ${selected ? styles.optionSelected : ""}`}//選択されているものがDBにもあればstyles.optionSelected を実行
                    onClick={(e) => {
                      //e.stopPropagation(); // カテゴリの選択だけ反映させて、枠の開閉クリックを防ぐ
                      toggleCategory(category.id); // クリックでON/OFF
                    }}
                  >
                    {category.name}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className={styles.row}>
          <button type="submit" className={styles.button}>作成</button>
        </div>
      </form>
    </div>
  );
}
