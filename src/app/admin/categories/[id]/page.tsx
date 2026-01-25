"use client";

import { useEffect, useState } from "react";
import styles from "./_styles/Categories_[id].module.css";
import { Category} from "../../../_types/Post";
import { useRouter, useParams } from "next/navigation";
import { CategoryForm } from "../../_components/CategoryForm";
import { UpdateCategoryRequestBody,CategoryApiResponse } from '@/app/_types/Category'
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { useAuthedFetch } from "@/app/_hooks/useAuthedFetch";


type CategoryGetResponse = { status: string; category: Category };


export default function AdminEditCategory() {
  const { token, sessionLoading } = useSupabaseSession()  
  const [name, setName] = useState("");
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;  
  const categoryId = typeof idParam === "string" ? Number(idParam) : NaN;  // 1) 実際にAPIに渡すID（値）：idがstringのときだけ数値化
  const isValidCategoryId = Number.isFinite(categoryId) && categoryId > 0; // 2) そのIDが正しいかの判定（条件）：NaNじゃない、かつ 1以上
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, error, isLoading, mutate } =
  useAuthedFetch<CategoryGetResponse>(
    isValidCategoryId
      ? `/api/admin/categories/${categoryId}`
      : null
  );


  // 「最初の1回だけ」SWRの取得結果をフォームに流し込む
  useEffect(() => {
    if (!data?.category) return;
    setName((prev) => (prev === "" ? data.category.name ?? "" : prev));
  }, [data]);
  //prev === "" ? data.category.name ?? "" : prev のコードについて
    //■ prevが""→API から取得したdata.category.name を見る 
      // ・結果、data.category.nameに値がある→その値をセット 
      // ・結果、null または undefined →""をセット 
    // ■prevにすでに何か値が入っている→prevを使う（上書きしない）

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