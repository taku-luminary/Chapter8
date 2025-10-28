"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./_styles/ArticleDetail.module.css";
import { Post } from "../../_types/Post";
import Image from "next/image";

export default function ArticleDetails() {
  const [isLoading, setIsLoading] = useState(true); 
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");

  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    // id が変わるたびに再取得するので、再び読み込み中に戻す
    setIsLoading(true);
    setError("");
    setPost(null);

    const fetcher = async () => {
      try {
        const res = await fetch(
          `https://buh411onxf.microcms.io/api/v1/posts/${id}`,// microCMSのエンドポイント
          {
            headers: {
              'X-MICROCMS-API-KEY': process.env.NEXT_PUBLIC_MICROCMS_API_KEY as string,
            },
          },
        );

        // 404（存在しない）と、それ以外のエラーを分けて扱う例
        if (res.status === 404) {
          // 見つからない：エラーではなく「0件」という扱いにする
          setPost(null);
          return; // finally で isLoading を false にする
        }
        console.log(res);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as Post;
        setPost(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('取得に失敗しました');;
        }
        setPost(null);
      } finally {
        // 成功でも失敗でも、最後に必ず読み込み完了へ
        setIsLoading(false);
      }
    };

    fetcher();
  }, [id]);

  const formatDate = (iso : string) =>
    new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });

  // ① 読み込み中
  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  // ② 通信・サーバーエラー
  if (error) {
    return <p>エラーが発生しました({error})</p>;
  }

  // ③ 読み込みは終わったが記事が無い（404/空データ）
  if (!post) {
    return <p>記事が見つかりませんでした。</p>;
  }

  return (
    <div className={styles.article}>
    {post.thumbnail && ( <Image className={styles.picture} src={post.thumbnail.url} alt="" width={800} height={400} /> ) }
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
      <div className={styles.detailContent}>
        <p className={styles.title}>{post.title}</p>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  );
}