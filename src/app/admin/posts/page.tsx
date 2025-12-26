"use client";

import styles from "../_styles_admin/Admin.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Post } from "../../_types/Post";

type AdminPost = { id: number; title?: string; createdAt: string };


export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]); 
  const [isLoading, setIsLoading] = useState(false);   
  const [error, setError] = useState<string|null>(null);  


    // 日付整形の小関数（ファイル上部に追記）
  const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" });


  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/admin/posts');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const {data} = (await res.json()) as { data: Post[] };
        setPosts(data);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
          } else {
            setError("一覧の取得に失敗しました");
          }
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ① 読み込み中
  if (isLoading) {
    return <p className={styles.loading}>読み込み中...</p>;
  }

  // ② エラー
  if (error) {
    return (
      <div className={styles.errorBox}>
        <p>エラーが発生しました（{error}）</p>
        {/* 簡易リトライ */}
        <button onClick={() => window.location.reload()}>再読み込み</button>
      </div>
    );
  }

  // ③ 空（0件）
  if (posts.length === 0) {
    return <p>記事がありません。</p>;
  }

  return ( 
  <>
    {/* 右側のメイン */}
    <main className={styles.main}>
      <div className={styles.mainHeader}>
        <h2 className={styles.topLetter}>記事一覧 </h2>
        <Link href ="/admin/posts/new" className={styles.newButton}>新規作成</Link>
      </div>
        {posts.map((p) => (
          <Link href ={`/admin/posts//${p.id}`} className={styles.articleBox} key={p.id}>
            <div className={styles.article}>{p.title}</div>
            <div className={styles.articleDate}>{formatDate(p.createdAt)}</div>
            <div className={styles.border}></div>
          </Link>
        ))}
    </main>
  </>
  );
}
