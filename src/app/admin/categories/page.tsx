"use client";

import styles from "./_styles/Categories.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Category } from "../../_types/Post";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]); 

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const {categories} = (await res.json()) as {status: string; categories: Category[];};
        setCategories(categories);
      } catch (e) {
      }
    })();
  }, []);

  return(
  <>
    <main className={styles.main}>
      <div className={styles.mainHeader}>
        <h2 className={styles.topLetter}>カテゴリー一覧 </h2>
        <Link href ="/admin/categories/new" className={styles.newButton}>新規作成</Link>
      </div>
        <div className={styles.articleBox}>
          {categories.map((c) => (
          <>
            <Link href={`/admin/categories/${c.id}`} key={c.id} className={styles.article}>{c.name}</Link>
            <div className={styles.border}></div>
          </>
          ))}
        </div>
    </main>
  </>
  )
};