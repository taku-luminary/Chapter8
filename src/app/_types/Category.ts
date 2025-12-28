// リクエストボディ
export interface UpdateCategoryRequestBody {
  name: string
}

// GET / PUT のレスポンスで使う Category
export interface CategoryResponse {
  id: number
  name: string
}

// 共通レスポンス
export interface CategoryApiResponse {
  status: 'OK'
  category: CategoryResponse
}