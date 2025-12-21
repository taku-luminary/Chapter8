
import styles from "./_styles_admin/Admin.module.css";
import Link from "next/link";

export default function AdminLayout({children,}: {children: React.ReactNode;}) {
  return (
    <div className={styles.container}>
      {/* 左側のバー（共通） */}
      <aside className={styles.sidebar}>
        <Link href ="/admin/posts" className={styles.sidebarLetter}>記事一覧</Link>
        <Link href ="/admin/categories" className={styles.sidebarLetter}>カテゴリー一覧</Link>
      </aside>

      {/* 右側は中身だけ差し替える */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}