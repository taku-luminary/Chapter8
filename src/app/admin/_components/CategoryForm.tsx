"use client";

import styles from "../_styles_admin/CategoryForm.module.css";

type Props = {
  name: string;
  onChangeName: (v: string) => void;//引数は 文字列（string）,返り値は使わない／返さない関数、主に 副作用（useState 更新など）を起こすための関数という型定義
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void; // 新規作成ページでは削除ボタン不要なので optional
  submitLabel?: string;  // "作成" / "更新" を切り替えたい時用（省略可）
  isSubmitting?: boolean; // ← 追加
};

export function CategoryForm({
  name,
  onChangeName,
  onSubmit,
  onDelete,
  submitLabel,
  isSubmitting
}: Props) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.row}>
        <label htmlFor="name" className={styles.label}>
          カテゴリー
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.updateDelete}>
        <div className={styles.row}>
          <button type="submit" className={styles.updataButton} disabled={isSubmitting}>
            {isSubmitting ? "送信中..." : submitLabel}
          </button>
        </div>

        {onDelete && (
          <div className={styles.row}>
            <button type="button" onClick={onDelete} className={styles.deleteButton} disabled={isSubmitting}>
              削除
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
