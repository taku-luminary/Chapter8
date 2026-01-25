'use client'

import Link from 'next/link'
import React from 'react'
import { useSupabaseSession } from '../_hooks/useSupabaseSession'
import { supabase } from '@/utils/supabase'

export const Header: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const { session, sessionLoading } = useSupabaseSession()

  return (
    <header className="bg-gray-800 text-white p-6 font-bold flex justify-between items-center">
      <Link href="/" className="header-link">
        Blog
      </Link>
      {!sessionLoading && (
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/admin/posts" className="header-link">
                管理画面
              </Link>
              <button onClick={handleLogout}>ログアウト</button>
            </>
          ) : (
            <>
              <Link href="/contact" className="header-link">
                お問い合わせ
              </Link>
              <Link href="/signup" className="header-link">
                サインアップ
              </Link>
              <Link href="/login" className="header-link">
                ログイン
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header