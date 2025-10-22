export type Post = {
  id: string;
  title: string;
  content: string;      
  createdAt: string;   
  thumbnailUrl?: string | null; 
  categories: string[];
};

export type PostResponse = {
  post: Post;
};

export type ApiListResponse = {
  posts: Post[];
};
