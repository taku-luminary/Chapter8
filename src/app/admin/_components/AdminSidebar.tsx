"use client";
import Link from "next/link";
import styles from "../_styles_admin/Admin.module.css";

export default function AdminSidebar(){
  return (
    <nav className={styles.nav}>
      <div className={styles.navTitle}>Blog</div>
      <ul className={styles.navList}>
        <li><Link href="/admin/posts" className={styles.navItemActive}>記事一覧</Link></li>
        <li><Link href="/admin/categories" className={styles.navItem}>カテゴリー一覧</Link></li>
      </ul>
    </nav>
  );
}