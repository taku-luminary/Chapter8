"use client";
import styles from "../../_styles_admin/New.module.css";
import { useState } from "react";  

export default function AdminCategoriesNewPage() {
  const [name, setName] = useState("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
    const body = {name};
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(`エラーが発生しました: ${data.status ?? "不明なエラー"}`);
      return;
    }
    const data = await res.json();
    alert(`カテゴリーを作成しました！（id: ${data.id}）`);
    setName("");
  }
  catch (error) {
  console.error(error);
  alert("通信エラーが発生しました");
  }
};

  return(
  <>
    <form method="post" className={styles.form} onSubmit={handleSubmit}>
      {/* タイトル */}
      <div className={styles.row}>
        <label htmlFor="title" className={styles.label}>カテゴリー名</label>
        <input      
          id="title"
          name="title"
          type="text"
          value={name}   
          onChange={(e) => setName(e.target.value)}
          className={styles.input}/>
      </div>
      <div className={styles.row}>
        <button type="submit" className={styles.button}>作成</button>
        </div>
    </form>
  </>
  )
};