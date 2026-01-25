import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/_libs/prisma'
import { supabase } from '@/utils/supabase'

export const GET = async (request: NextRequest,
  { params }: { params: { id: string } },
  //①全体の意味
  // Next.js の Route Handler では、第2引数に「URL 由来の情報（context）」が入り、その中の params を分割代入で取り出し、型注釈で id が string であることを TypeScript に教えている
  //②{ params }の意味
  // (request: NextRequest, { params }: { params: { id: string } })において、第2引数は APIで通信で受け取る/api/admin/posts/${postId}など“コンテキスト” であり、その中に params が入っている。この2つ目の引数の中にある params オブジェクト（プロパティ）だけ抽出
  //③: { params: { id: string } }の意味
  // これは{params}の型注釈。paramsはオブジェクトの中に入っており、さららにその中オブジェクトがあり、そこにはstring型を持つidキーがあると定義
) => {
    const token = request.headers.get('Authorization') ?? ''
  
    // supabaseに対してtokenを送る
    const { error } = await supabase.auth.getUser(token)
  
    // 送ったtokenが正しくない場合、errorが返却されるので、クライアントにもエラーを返す
    if (error)
      return NextResponse.json({ status: error.message }, { status: 401 })
  
    // tokenが正しい場合、以降が実行される
    
  const { id } = params

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        postCategories: {
          include: {
            category: {select: {id: true,name: true,},},
          },
        },
      },
    })

    return NextResponse.json({ status: 'OK', post: post }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ status: error.message }, { status: 400 })
  }
}



// 記事の更新時に送られてくるリクエストのbodyの型
interface UpdatePostRequestBody {
  title: string
  content: string
  categories: { id: number }[]
  thumbnailImageKey: string
}

// PUTという命名にすることで、PUTリクエストの時にこの関数が呼ばれる
export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }, // ここでリクエストパラメータを受け取る
) => {
  // paramsの中にidが入っているので、それを取り出す

    const token = request.headers.get('Authorization') ?? ''

	// supabaseに対してtokenを送る
  const { error } = await supabase.auth.getUser(token)

  // 送ったtokenが正しくない場合、errorが返却されるので、クライアントにもエラーを返す
  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  // tokenが正しい場合、以降が実行される

  const { id } = params

  // リクエストのbodyを取得
  const { title, content, categories, thumbnailImageKey }: UpdatePostRequestBody = await request.json()

  try {
    // idを指定して、Postを更新
    const post = await prisma.post.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        content,
        thumbnailImageKey,
      },
    })

    // 一旦、記事とカテゴリーの中間テーブルのレコードを全て削除
    await prisma.postCategory.deleteMany({
      where: {
        postId: parseInt(id),
      },
    })

    // 記事とカテゴリーの中間テーブルのレコードをDBに生成
    // 本来複数同時生成には、createManyというメソッドがあるが、sqliteではcreateManyが使えないので、for文1つずつ実施
    for (const category of categories) {
      await prisma.postCategory.create({
        data: {
          postId: post.id,
          categoryId: category.id,
        },
      })
    }

    // レスポンスを返す
    return NextResponse.json({ status: 'OK', post: post }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ status: error.message }, { status: 400 })
  }
}

// DELETEという命名にすることで、DELETEリクエストの時にこの関数が呼ばれる
export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string } }, // ここでリクエストパラメータを受け取る
) => {
  // paramsの中にidが入っているので、それを取り出す

    const token = request.headers.get('Authorization') ?? ''

	// supabaseに対してtokenを送る
  const { error } = await supabase.auth.getUser(token)

  // 送ったtokenが正しくない場合、errorが返却されるので、クライアントにもエラーを返す
  if (error)
    return NextResponse.json({ status: error.message }, { status: 401 })

  // tokenが正しい場合、以降が実行される
  const { id } = params

  try {
    // idを指定して、Postを削除
    await prisma.post.delete({
      where: {
        id: parseInt(id),
      },
    })

    // レスポンスを返す
    return NextResponse.json({ status: 'OK' }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ status: error.message }, { status: 400 })
  }
}