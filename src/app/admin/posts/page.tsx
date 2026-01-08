"use client";

import styles from "./_styles/Posts.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

type AdminPost = { id: number; title?: string; createdAt: string };


export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]); 
  const [isLoading, setIsLoading] = useState(false);   
  const [error, setError] = useState<string|null>(null);  


    // 日付整形の小関数（ファイル上部に追記）
  const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" });

const { token, sessionLoading } = useSupabaseSession()

useEffect(() => {
  // Supabaseのセッション取得が終わるまで待つ
  if (sessionLoading) return

  // 未ログインなら（ここは好みで）ログインへ飛ばす or エラー表示
  if (!token) {
    setIsLoading(false)
    setError("ログインが必要です")
    return
  }

  ;(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch("/api/admin/posts", {
        headers: {
          Authorization: token,
        },
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        // APIが返したメッセージ（getUserのerror.message）も拾う
        throw new Error(json?.status ?? `HTTP ${res.status}`)
      }
      setPosts(json.data ?? [])
    } catch (e) {
      setPosts([])
      setError(e instanceof Error ? e.message : "一覧の取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  })()
}, [token, sessionLoading])


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

  return ( 
  <>
    {/* 右側のメイン */}
    <main className={styles.main}>
      <div className={styles.mainHeader}>
        <h2 className={styles.topLetter}>記事一覧 </h2>
        <Link href="/admin/posts/new" className={styles.newButton}>新規作成</Link>
      </div>  
      {posts.length === 0 ? (
        <p>記事がありません。</p>
      ) : (
        posts.map((p) => (
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
