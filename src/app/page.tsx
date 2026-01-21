"use client";

import styles from "./_styles/App.module.css";
import Link from "next/link";
import { Post } from "./_types/Post";
import useSWR from "swr";

type PostsResponse = { posts: Post[] };

// ① fetcherを用意（SWRが呼ぶ）
const fetcher = async (url: string): Promise<PostsResponse> => {
  const res = await fetch(url);

  // 2xx以外はエラー扱い（今のuseEffect内と同じ思想）
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

  //・function内に書くと「親コンポーネントが再レンダリングされるたびに、その関数は“作り直される”」
  //・function外に書くと「アプリ起動時に1回だけ定義され、その後は同じ関数がずっと使われる」

function Articles() {

  const formatDate = (iso : string ) =>
   new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });

  // ② useEffect + useState を、useSWRに置き換える
  const { data, error, isLoading, mutate, isValidating } = useSWR("/api/posts",fetcher,
    { // 必要なら挙動を調整（まずはデフォルトでもOK）
      // revalidateOnFocus: true, // タブ復帰で再取得（デフォルトtrue）
      // dedupingInterval: 2000,  // 同一keyの連続リクエストをまとめる（デフォルトあり）
    }
  );

  // SWRのdataが来るまで posts は undefined なので安全に
   const posts = data?.posts ?? [];
  //data?.posts の意味（オプショナルチェーン）: dataが無ければ、エラーにせず undefined を返す
  // ?? [] の意味（Null合体演算子）:左側が null または undefined のときだけ、右側を使う


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
            {(post.postCategories ?? []).map((pc) => (
              <div key={pc.category.id}>
                {pc.category.name}
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