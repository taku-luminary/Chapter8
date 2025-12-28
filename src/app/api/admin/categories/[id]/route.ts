import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { UpdateCategoryRequestBody } from '@/app/_types/Category'

const prisma = new PrismaClient()

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } },
  //①全体の意味
  // 第2引数として渡ってくるオブジェクトから、params だけを取り出して、その形（型）を TypeScript に教えている
  //②{ params }の意味
  // (request: NextRequest, { params }: { params: { id: string } })において、第2引数は APIで通信で受け取る/api/admin/posts/${postId}など“コンテキスト” であり、その中に params が入っている。この2つ目の引数の中にある params オブジェクト（プロパティ）だけ抽出
  //③: { params: { id: string } }の意味
  // これは{params}の型注釈。{params}の中にオブジェクトがあり、そこにはstring型を持つidキーがあると定義
) => {
  const { id } = params

  try {
    const category = await prisma.category.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    return NextResponse.json({ status: 'OK', category : category }, { status: 200 })
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ status: error.message }, { status: 400 })
  }
}

// PUTという命名にすることで、PUTリクエストの時にこの関数が呼ばれる
export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }, // ここでリクエストパラメータを受け取る
) => {
  // paramsの中にidが入っているので、それを取り出す
  const { id } = params

  // リクエストのbodyを取得
  const { name }: UpdateCategoryRequestBody = await request.json()

  try {
    // idを指定して、Categoryを更新
    const category = await prisma.category.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    })

    // レスポンスを返す
    return NextResponse.json({ status: 'OK', category : category }, { status: 200 })
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
  const { id } = params

  try {
    // idを指定して、Postを削除
    await prisma.category.delete({
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