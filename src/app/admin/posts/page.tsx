"use client";

import styles from "./_styles/Posts.module.css";
import Link from "next/link";
import { useAuthedFetch } from "@/app/_hooks/useAuthedFetch";

type AdminPost = { id: number; title?: string; createdAt: string };
type PostsApiResponse = { data: AdminPost[] };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

export default function AdminPostsPage() {
  const { data, error, isLoading,sessionLoading } = useAuthedFetch<PostsApiResponse>(
    "/api/admin/posts"
  );

  // ① 読み込み中
if (sessionLoading || isLoading) {
  return <p className={styles.loading}>読み込み中...</p>
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

  const safePosts = data?.data ?? [];

  return ( 
  <>
    {/* 右側のメイン */}
    <main className={styles.main}>
      <div className={styles.mainHeader}>
        <h2 className={styles.topLetter}>記事一覧 </h2>
        <Link href="/admin/posts/new" className={styles.newButton}>新規作成</Link>
      </div>  
      {safePosts.length === 0 ? (
        <p>記事がありません。</p>
      ) : (
        safePosts.map((p) => (
          <Link
            href={`/admin/posts/${p.id}`}
            className={styles.articleBox}
            key={p.id}
          >
            <div className={styles.article}>{p.title}</div>
            <div className={styles.articleDate}>{formatDate(p.createdAt)}</div>
            <div className={styles.border}></div>
          </Link>
        ))
      )}
    </main>
  </>
  );
}
