"use client";

import "./globals.css";
import Header from "./_components/Header";

export default function RootLayout({children}:{children: React.ReactNode}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
        <footer />
      </body>
    </html>
  );
}


// ■理解（以下のコード意味）
//  ①Next.jsでは{children}というpropsで、page.tsxなどの各ファイルで実行されたものを受け取る
//  例：Next.js は内部では、以下のように呼び出す
//   const pageJSX = <HomePage />; 
//  たとえば app/page.tsx の内容
//  RootLayout({ children: pageJSX }); 
// ②オブジェクトの型定義は{プロパティ：型}と書けない、代わりに{プロパティ}：{プロパティ：型}と書く
//  従って{ children, }: { children: React.ReactNode; } と書いている
//  
//  { children }→引数として受け取ったオブジェクトから children を分割代入で取り出す（値の取り出し）
//  : { children: React.ReactNode }→「この引数（props）の形は { children: React.ReactNode  型ですよ」という型注釈（説明書）
//
// ■コード
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="ja">
//       <body>
//         <Header />
//         <main>{children}</main>
//         <footer />
//       </body>
//     </html>
//   );
// }