
"use client";

import Link from "next/link";
import styles from "../_styles/App.module.css";

export default function Header() {
  return (
      <header>
        <div className={styles.container}>
          <div className={styles.blog}>
            <Link href ="/" className={styles.contact}>Blog</Link>
          </div>
          <Link href ="contact" className={styles.contact}>お問い合わせ</Link>
        </div>
      </header>
  );
}