"use client";

import styles from "./_styles/Posts.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import useSWR from "swr";

type AdminPost = { id: number; title?: string; createdAt: string };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });


const fetcher = async ([url, token]: [string, string]) => {
  const res = await fetch(url, {
    headers: {
     Authorization: token
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // APIが返す message/status があるならそれを優先
    throw new Error(json?.status ?? `HTTP ${res.status}`);
  }

  // APIの形が { data: [...] } 前提
  return (json?.data ?? []) as AdminPost[];
};


export default function AdminPostsPage() {

   const { token, sessionLoading } = useSupabaseSession()

  //  token が無い / sessionLoading 中は “取得しない”
  // key が null だと SWR は fetcher を呼ばない
  const swrKey = !sessionLoading && token ? (["/api/admin/posts", token] as const) : null;

  const {
    data: posts,
    error,
    isLoading,
    mutate, // 手動リトライで使う
  } = useSWR(swrKey, fetcher);



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

  const safePosts = posts ?? [];

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
