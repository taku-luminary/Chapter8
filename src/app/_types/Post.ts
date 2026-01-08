export type Category = {
  id: number;
  name: string;
  createdAt: string;
};

// ▼ UIで使う“フラット化後”の型（一覧/詳細でそのまま使いやすい）
export type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  thumbnailImageKey: string;          // ← microCMSの thumbnail.url ではなく単独プロパティ
  categories: Category[];
  postCategories: { category: { id: number; name: string } }[]
};
