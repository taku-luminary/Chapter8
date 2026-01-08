"use client";

import styles from "./_styles/Categories.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Category } from "../../_types/Post";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";


export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]); 
  const { token, sessionLoading } = useSupabaseSession()  


  useEffect(() => {
  if (sessionLoading) return
  if (!token) return
    (async () => {
      try {
        const res = await fetch('/api/admin/categories',  {headers: { Authorization: token },});
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const {categories} = (await res.json()) as {status: string; categories: Category[];};
        setCategories(categories);
      } catch (e) {
        console.error(e)
        alert("カテゴリーの取得に失敗しました")
      }
    })();
  }, [sessionLoading, token]);

if (sessionLoading) return <p>読み込み中...</p>
if (!token) return <p>ログインが必要です</p>

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
