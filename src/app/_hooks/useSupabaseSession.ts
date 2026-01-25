import { supabase } from '@/utils/supabase'
import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export const useSupabaseSession = () => {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // 1) 最初の状態を取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setToken(session?.access_token ?? null)//ログインしていればアクセストークン（文字列）を保存する。ログインしていなければ null を保存する。
      //・session?.access_token部分
        //session が存在する（nullじゃない）なら → session.access_token
        //session が null/undefined なら → エラーにせず undefined を返す

      //・access_token ?? null部分
        //上の式（session?.access_token）の結果が
          //null または undefined のときだけ → 右側（null）を使う
          //文字列なら → そのまま文字列

    })

    // 2) 以後のログイン/ログアウト変化を購読
    //以下コードでは、useEffect がマウント時に一度だけ実行され、その中で supabase.auth.onAuthStateChange によって Supabase Auth の認証状態変化（ログイン・ログアウトなど）を監視するリスナーを登録している。
    //supabase.auth.signInWithPassword でログインになるなど認証状態が変わるたびに、Supabase から最新の session がコールバックに渡され、setSession と setToken が実行される。
    //onAuthStateChange は監視を開始する関数で、戻り値として { data: { subscription } } の形を返す。この data.subscription.unsubscribe() を実行すると監視がオフになる。
    //useEffect の cleanup 関数で unsubscribe を呼ぶことで、コンポーネントがアンマウントされる際に監視を停止している。

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setToken(session?.access_token ?? null)
    })

   //このコンポーネントが画面から消えるときに、supabase.auth.onAuthStateChangeの“ログイン状態監視”をやめさせる
    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  return { session, sessionLoading: session === undefined, token }
}
