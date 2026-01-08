"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./_styles/ArticleDetail.module.css";
import { Post } from "../../_types/Post";
import Image from "next/image";
import { supabase } from "@/utils/supabase";

export default function ArticleDetails() {
  const [isLoading, setIsLoading] = useState(true); 
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<null | string>(null,)  

  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (!id) return;

    // id が変わるたびに再取得するので、再び読み込み中に戻す
    setIsLoading(true);
    setError("");
    setPost(null);

    const fetcher = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        console.log(res);
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
        const {post} = (await res.json()) as  { post: Post };
        setPost(post);
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


  useEffect(() => {
    if (!post?.thumbnailImageKey) return

// アップロード時に取得した、thumbnailImageKeyを用いて画像のURLを取得
    const fetcher = async () => {
      const {
        data: { publicUrl },
      } = await supabase.storage
        .from('post_thumbnail')
        .getPublicUrl(post?.thumbnailImageKey)

      setThumbnailImageUrl(publicUrl)
    }

    fetcher()
  }, [post?.thumbnailImageKey])
  
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
// 画像の表示
  return (
    <div className={styles.article}>
      {thumbnailImageUrl && (
        <div className="mt-2">
        <Image src={thumbnailImageUrl}
          alt="thumbnail"
          width={400}
          height={400}
        />
        </div>
      )}

      <div className={styles.dayCategory}>
        <span>{formatDate(post.createdAt)}</span>
        <div className={styles.categories}>
          {(post.postCategories ?? []).map((pc) => (
            <div key={pc.category.id} className={styles.category}>
              {pc.category.name}
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