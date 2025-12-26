"use client";

import { useEffect, useState } from "react";
import styles from "../../_styles_admin/New.module.css";
import { Category} from "../../../_types/Post";
import { useRouter, useParams } from "next/navigation";

export default function AdminEditCategory() {
  const [name, setName] = useState("");
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

    try {
      const body = {
        name, 
      };

      const res = await fetch(`/api/admin/categories/${postId}`, {
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
      alert(`記事を更新しました！（id: ${data.category.id}）`);

    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    }
  };

  const handleDelete = async () => {
    const ok = confirm("本当に削除しますか？");
    if (!ok) return;

    const res = await fetch(`/api/admin/categories/${postId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("削除に失敗しました");
      return;
    }

    alert("削除しました！");
    router.push("/admin/posts");
  };

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/categories/${postId}`);
    if (!res.ok) {
      alert("カテゴリーの取得に失敗しました");
      return;
    }
    
    const json = await res.json(); 
    const data = json.category as Category; 
      setName((data.name ?? ""));
    })();
  }, [isValidPostId,postId]);

  return (
    <div className={styles.container}>
      <h2 className={styles.topLetter}>カテゴリー編集</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <label htmlFor="content" className={styles.label}>カテゴリー</label>
          <textarea
            id="content"
            name="content"
            rows={1}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.updateDelete}>
          {/* 更新ボタン */}
          <div className={styles.row}>
            <button type="submit" className={styles.updataButton}>更新</button>
          </div>

          {/* 削除ボタン */}
          <div className={styles.row}>
            <button onClick={handleDelete} type="button" className={styles.deleteButton}>削除</button>
          </div>
        </div>
      </form>
    </div>
  );
}
