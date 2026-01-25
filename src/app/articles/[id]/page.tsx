"use client";

import { useParams } from "next/navigation";
import styles from "./_styles/ArticleDetail.module.css";
import { Post } from "../../_types/Post";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import useSWR from "swr";

type PostResponse = { post: Post };

// 404は「記事なし(null)」として返すfetcher
const postFetcher = async (url: string): Promise<Post | null> => {
  const res = await fetch(url);

  if (res.status === 404) {
    return null; // 見つからない：エラーではなく「0件」という扱いにする
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
 
  const data = (await res.json()) as PostResponse;
  return data.post;
};

//  thumbnailImageKey から public URL を作るfetcher
const thumbnailUrlFetcher = async (thumbnailImageKey: string): Promise<string> => {
  const { data } = supabase.storage
    .from("post_thumbnail")
    .getPublicUrl(thumbnailImageKey);

  // data.publicUrl は基本常にある想定だけど、念のため
  if (!data?.publicUrl) {
    throw new Error("サムネイルURLの取得に失敗しました");
  }
  return data.publicUrl;
};

export default function ArticleDetails() {
 
  const { id } = useParams<{ id: string }>();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

  //  id があるときだけSWRを動かす（なければnullで停止）
  const {
    data: post,
    error: postError,
    isLoading: postLoading,
    mutate: retryPost,
  } = useSWR(id ? `/api/posts/${id}` : null, postFetcher);

    // postが取れて、thumbnailImageKeyがある時だけサムネURL取得を動かす
  const thumbnailKey = post?.thumbnailImageKey ?? null;

  const {
    data: thumbnailImageUrl,
    error: thumbnailError,
    isLoading: thumbnailLoading,
    mutate: retryThumbnail,
  } = useSWR(thumbnailKey, thumbnailUrlFetcher);

  // ① 記事読み込み中
  if (postLoading) {
    return <p>読み込み中...</p>;
  }

  // ② 通信・サーバーエラー
  if (postError) {
    return <p>エラーが発生しました（{postError.message}）</p>;
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