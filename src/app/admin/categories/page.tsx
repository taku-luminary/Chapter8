"use client";

import styles from "./_styles/Categories.module.css";
import Link from "next/link";
import { Category } from "../../_types/Post";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import useSWR from "swr";

type CategoriesResponse = { status: string; categories: Category[] };

const fetcher = async ([url, token]: [string, string]) => {
  const res = await fetch(url, { headers: { Authorization: token } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as CategoriesResponse;
};


export default function AdminCategoriesPage() {
  const { token, sessionLoading } = useSupabaseSession();

  const key =
    sessionLoading || !token ? null : (["/api/admin/categories", token] as const);

  const { data, error, isLoading } = useSWR(key, fetcher);

  if (sessionLoading) return <p>読み込み中...</p>;
  if (!token) return <p>ログインが必要です</p>;
  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p>カテゴリーの取得に失敗しました</p>;

  const categories = data?.categories ?? [];
  return(
  <>
    <main className={styles.main}>
      <div className={styles.mainHeader}>
        <h2 className={styles.topLetter}>カテゴリー一覧 </h2>
        <Link href ="/admin/categories/new" className={styles.newButton}>新規作成</Link>
      </div>
        <div className={styles.articleBox}>
          {categories.map((c) => (
          <div key={c.id}>
            <Link href={`/admin/categories/${c.id}`}  className={styles.article}>{c.name}</Link>
            <div className={styles.border}></div>
          </div>
          ))}
        </div>
    </main>
  </>
  )
};
