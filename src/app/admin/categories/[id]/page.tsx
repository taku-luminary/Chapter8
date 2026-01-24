"use client";

import { useEffect, useState } from "react";
import styles from "./_styles/Categories_[id].module.css";
import { Category} from "../../../_types/Post";
import { useRouter, useParams } from "next/navigation";
import { CategoryForm } from "../../_components/CategoryForm";
import { UpdateCategoryRequestBody,CategoryApiResponse } from '@/app/_types/Category'
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import useSWR from "swr";

type CategoryGetResponse = { status: string; category: Category };

const fetcher = async ([url, token]: [string, string]) => {
  const res = await fetch(url, 
    { headers: 
      { Authorization: token } 
    }
  );
  const json = (await res.json()) as CategoryGetResponse;
  if (!res.ok) throw new Error(json?.status ?? `HTTP ${res.status}`);
  return json;
};


export default function AdminEditCategory() {
  const { token, sessionLoading } = useSupabaseSession()  
  const [name, setName] = useState("");
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;  
  const categoryId = typeof idParam === "string" ? Number(idParam) : NaN;  // 1) idがstringのときだけ数値化
  const isValidCategoryId = Number.isFinite(categoryId) && categoryId > 0; // 2) 有効判定（NaNじゃない、かつ 1以上）
  const [isSubmitting, setIsSubmitting] = useState(false);

  const swrKey =
    !sessionLoading && token && isValidCategoryId
      ? [`/api/admin/categories/${categoryId}`, token]
      : null;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher);

  // 「最初の1回だけ」SWRの取得結果をフォームに流し込む
  useEffect(() => {
    if (!data?.category) return;
    setName((prev) => (prev === "" ? data.category.name ?? "" : prev));
  }, [data]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    if (isSubmitting) return; // 二重送信ガード
    if (sessionLoading) return
    if (!token) return
    if (!isValidCategoryId) return;

    setIsSubmitting(true); // 送信開

    try {
      const body:UpdateCategoryRequestBody = {
        name, 
      };

      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" ,Authorization: token ,},
        body: JSON.stringify(body),
      });

        const data:CategoryApiResponse  = await res.json();

      if (!res.ok) {
        alert(`エラーが発生しました: ${data.status ?? "不明なエラー"}`);
        return;
      }

      alert(`カテゴリを更新しました！（id: ${data.category.id}）`);
      await mutate(); 
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました");

    } finally {
    setIsSubmitting(false); // 送信終了（成功でも失敗でも）
    }
  };

  const handleDelete = async () => {
    if (isSubmitting) return; // 二重送信ガード
    if (sessionLoading) return
    if (!token) return
    if (!isValidCategoryId) return;
    try {
      const ok = confirm("本当に削除しますか？");
      if (!ok) return;
      setIsSubmitting(true)
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: {Authorization: token },
      });

      if (!res.ok) {
        alert("削除に失敗しました");
        return;
      }

      alert("削除しました！");
      router.push("/admin/categories");
      
      } catch (error) {
        console.error(error);
        alert("通信エラーが発生しました");
      } finally { setIsSubmitting(false) }
    };

  if (!isValidCategoryId) {
    return (
      <div className={styles.container}>
        <p>URLのIDが不正です（id: {String(idParam)}）</p>
      </div>
    );
  }
  if (sessionLoading) return <p>読み込み中...</p>
  if (!token) return <p>ログインが必要です</p>
  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p>取得エラーが発生しました</p>;

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