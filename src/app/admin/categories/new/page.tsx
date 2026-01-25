"use client";
import styles from "./_styles/Categories_New.module.css";
import { useState } from "react";  
import { CategoryForm } from "../../_components/CategoryForm";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

export default function AdminCategoriesNewPage() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, sessionLoading } = useSupabaseSession()    
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (isSubmitting) return; // 二重送信ガード
  if (!token) return
  if (sessionLoading) return

  setIsSubmitting(true); 
  try {
    const body = {name};
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: token ,
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

  if (sessionLoading) return <p>読み込み中...</p>
  if (!token) return <p>ログインが必要です</p>

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