"use client";
import styles from "./_styles/Categories_New.module.css";
import { useState } from "react";  
import { CategoryForm } from "../../_components/CategoryForm";

export default function AdminCategoriesNewPage() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (isSubmitting) return; // 二重送信ガード
  setIsSubmitting(true); 
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
  finally {
    setIsSubmitting(false); // 送信終了（成功でも失敗でも）
  }
};

  return(
    <div className={styles.container}>
      <h2 className={styles.topLetter}>カテゴリー作成</h2>
      <CategoryForm
        name={name}
        onChangeName={setName}
        onSubmit={handleSubmit}
        submitLabel="作成"
        isSubmitting={isSubmitting}
      />
    </div>
  )
};