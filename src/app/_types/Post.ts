export type Category = {
  id: number;
  name: string;
  createdAt: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  thumbnailImageKey: string;          
  categories: Category[];
  postCategories: { category: { id: number; name: string } }[]
};

export type PostFormInputs = {
  title: string
  content: string
  thumbnailImageKey: string
  categories:number[]
}