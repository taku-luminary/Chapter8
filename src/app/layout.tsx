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


// ＝＝＝上記に関する理解＝＝＝
// function RootLayout({ children }) は「props という箱の中から children という中身だけを名前で取り出して使う」書き方。

// ■propsが受け取るもの
// ・Next.jsではlayout.tsx内でexport default function関数名（props）とすると、子の画面（page.tsx など）を React 要素としてまとめたものを children という名前で受け取る
// ・つまり引数（propsの中身）は{ children: <React が作った子の要素ツリー> } という形のオブジェクトを受け取る
// ・{children}の意味は、Next.js が props に { children: <Page /> } を渡してくるので、その props の中から children というキーを直接取り出して変数として使っているということ

// ■分割代入
//  ・export default function RootLayout(props:{children: React.ReactNode}) と書くと、page.tsxのJSXの内容をlayout.tsxで使う場合、props.変数名となってしまうため通常分割代入を用いる 
// ・分割代入をするとexport default function RootLayout({children}:{children: React.ReactNode})となる。
// ・これは{children}はconst {children} = propsを省略した形
// ・基本的に引数に {children} と見えたら、props から children だけ取り出していると思えばいい 

// ■型について
// ・{children: React.ReactNode}は:の左側の中身にはオブジェクトの中にchildrenがありその型はReact.ReactNodeという意味
// ・ReactNode は文字列・数値・React 要素・配列・null など画面に描画できるもの全般を受け取れる“広い型”

// // ＝＝＝対象コード＝＝＝
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