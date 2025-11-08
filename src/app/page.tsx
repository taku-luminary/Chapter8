"use client";

import styles from "./_styles/App.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Post} from "./_types/Post";

function Articles() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);   // 読み込み中
  const [error, setError] = useState<string|null>(null);           // エラー文言保持

  const formatDate = (iso : string ) =>
   new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });

  // APIでpostsを取得する処理をuseEffectで実行します。
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/posts');
        if (!res.ok) {
          // 一覧APIなら404はレアですが、念のため全ての非2xxをエラー扱い
          throw new Error(`HTTP ${res.status}`);
        }
        const {posts} = (await res.json()) as { posts: Post[] };
        // APIの形に合わせて安全に取り出す（data.postsが無い場合もnull合体で空配列に）
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
      {posts.map((post) => {
        return (
        <Link href={`/articles/${post.id}`} key={post.id} className={styles.card}>
          <div className={styles.dayCategory}>
            <span>{formatDate(post.createdAt)}</span>

            <div className={styles.categories}>
              {post.categories.map((category, index) => (

                <div  key={index} className={styles.category}>
                  {category.name}
                </div>
              ))}   
            </div> 
          </div> 
          <p className={styles.title}>{post.title}
          </p>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </Link>
            );
        })}
    </>


  );
}

export default Articles;