"use client";

import { useEffect, useState } from "react";
import styles from "./_styles/Categories_[id].module.css";
import { Category} from "../../../_types/Post";
import { useRouter, useParams } from "next/navigation";
import { CategoryForm } from "../../_components/CategoryForm";
import { UpdateCategoryRequestBody,CategoryApiResponse } from '@/app/_types/Category'


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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return; // 二重送信ガード
    setIsSubmitting(true); // 送信開

    try {
      const body:UpdateCategoryRequestBody = {
        name, 
      };

      const res = await fetch(`/api/admin/categories/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data:CategoryApiResponse  = await res.json();
        alert(`エラーが発生しました: ${data.status ?? "不明なエラー"}`);
        return;
      }

      const data = await res.json();
      alert(`記事を更新しました！（id: ${data.category.id}）`);

    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");

    } finally {
    setIsSubmitting(false); // 送信終了（成功でも失敗でも）
    }
  };

  const handleDelete = async () => {
    try {
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
      
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    }
  };

  useEffect(() => {
    try {
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
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");
    }
  }, [isValidPostId,postId]);

return (
  <div className={styles.container}>
    <h2 className={styles.topLetter}>カテゴリー編集</h2>

    <CategoryForm
      name={name}
      onChangeName={setName}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      submitLabel="更新"
      isSubmitting={isSubmitting}
    />
  </div>
);
}