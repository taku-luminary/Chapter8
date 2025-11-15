export type Category = {
  id: number;
  name: string;
};

// ▼ UIで使う“フラット化後”の型（一覧/詳細でそのまま使いやすい）
export type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string;          // ← microCMSの thumbnail.url ではなく単独プロパティ
  categories: Category[];        // ← フラット化して {id,name}[]
  postCategories: { category: { id: number; name: string } }[]
};
