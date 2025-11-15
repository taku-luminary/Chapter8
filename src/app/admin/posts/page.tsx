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
        const {posts} = (await res.json()) as { posts: Post[] };
        setPosts(posts);
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
  <div className={styles.container}>

    {/* 左側のバー */}
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLetter}>記事一覧</div>
      <div className={styles.sidebarLetter}>カテゴリー一覧</div>
    </aside>

    {/* 右側のメイン */}
    <main className={styles.main}>
      <h2 className={styles.topLetter}>記事一覧 </h2>
      <input type="submit" value="新規作成" className={styles.newButton}/>
        {posts.map((p) => (
          <div className={styles.articleBox} key={p.id}>
            <div className={styles.article}>{p.title}</div>
            <div className={styles.articleDate}>{formatDate(p.createdAt)}</div>
            <div className={styles.border}></div>
          </div>
        ))}
    </main>
  </div>
  </>
  );
}
