"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Category,PostFormInputs } from "../../../_types/Post";
import styles from "./_styles/PostForm.module.css";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";
import { SubmitHandler, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";

type Props = {
  handleImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  selectedCategoryIds: number[];
  isOpen: boolean;
  isSubmitting: boolean; 
  setIsOpen: (v: boolean) => void;
  toggleCategory: (categoryId: number) => void;
  submitLabel: string;
  onDelete?: () => void; // 編集ページだけ渡す
  deleteLabel?: string;
  register: UseFormRegister<PostFormInputs>;
  onSubmit: SubmitHandler<PostFormInputs>;
  handleSubmit: UseFormHandleSubmit<PostFormInputs>
};

export function PostForm({
  handleImageChange,
  selectedCategoryIds,
  isSubmitting,
  isOpen,
  setIsOpen,
  toggleCategory,
  onSubmit,
  onDelete,
  submitLabel,
  deleteLabel = "削除",
  register,
  handleSubmit,
}: Props) {

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const { token, sessionLoading } = useSupabaseSession()  
  

useEffect(() => {
      if (!token) return
  (async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/categories",{
      headers: {Authorization: token }});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAllCategories(data.categories ?? []);
    } catch (e) {
      console.error(e);
      alert("カテゴリーの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  })();
}, [token, sessionLoading]);

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {/*
      【この1行の意味】
      - レンダリング時： handleSubmit(onSubmit) が実行され、「submitHandler（submitイベント用の関数）」が作られる
      - form が submit された時：その submitHandler が実行される

      【submitHandler の中で起きること（概念）】
      1. event.preventDefault()（ページ遷移を止める）
      2. isSubmitting を true にする（送信中状態）
      3. register / setValue により管理されている値を、RHFの内部ストアから集めて data オブジェクトを作る
      4. （設定があれば）バリデーションを行う
      5. 問題がなければ、ユーザーが定義した onSubmit(data) を実行する
      6. 処理終了後、isSubmitting を false に戻す

      【handleSubmit(onSubmit)のイメージ（擬似コード）】
        handleSubmit(onSubmit) === async function submitHandler(event) {
          event.preventDefault() // ① ブラウザのデフォルト送信を止める
          const data = {  // ② RHF内部ストアから全フィールドの値を集める
            title: formValues.title,
            content: formValues.content,
            thumbnailImageKey: formValues.thumbnailImageKey,
            categories: formValues.categories,
          }
          formState.isSubmitting = true // ③ isSubmitting = true
          try { 
            await onSubmit(data) // ④ ユーザー定義の onSubmit を呼ぶ
          } finally {
            formState.isSubmitting = false // ⑤ isSubmitting = false}
        }
      */}


      {/* タイトル */}
      <div className={styles.row}>
        <label htmlFor="title" className={styles.label}>タイトル</label>
        {/*下の行のregister("title") の意味
          - この input を「title」というキーでRHFに登録し、RHFとつなぐ“配線”を付ける
          - 付く配線（主に）：name / onChange / onBlur / ref
          - useFormで作られたRHFの内部ストア（formStore）と、inputがregisterによって接続され、入力時にタイトルなどの値が内部ストアに保存される

          【registerのイメージ】
          register("title") === {
            name: "title",
            onChange: (event) => {
              const value = event.target.value // input に入力された値を取得
              formValues.title = value // RHFの内部ストアを書き換える
            },
            onBlur: () => { // touched フラグなどを更新},
            ref: (element) => {// input DOM を RHF が把握するための参照}
          }

          そのため、入力すると自動でRHFの内部ストアが更新される。
          submit時は、その内部ストアから値を集めて data が作られ、OKなら onSubmit(data) が呼ばれる。*/}
        <input
         {...register("title")}
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      {/* 内容 */}
      <div className={styles.row}>
        <label htmlFor="content" className={styles.label}>内容</label>
        <textarea
         {...register("content")}
          rows={2}
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      {/* サムネイル画像 */}
      <div className={styles.row}>
        <label htmlFor="thumbnailImageKey" className={styles.label}>サムネイル画像</label>
        <input
          id="thumbnailImageKey"
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          className={styles.input}
          disabled={isSubmitting}
        />
      </div>

      {/* カテゴリー */}
      <div className={styles.row}>
        <label className={styles.label}>カテゴリー</label>

        <div
          className={styles.selectBox}
          onClick={() =>{ if (isSubmitting || isLoading) return;
           setIsOpen(!isOpen)}}  
        >
          <div className={styles.chips}>
            {selectedCategoryIds.length === 0 && (
              <span className={styles.placeholder}>カテゴリーを選択</span>
            )}

            {selectedCategoryIds.map((id) => {
              const category = allCategories.find((c) => c.id === id);
              if (!category) return null;
              return (
                <span key={id} className={styles.chip}>
                  {category.name}
                </span>
              );
            })}
          </div>

          <span className={styles.arrow}>▼</span>
        </div>

        {isOpen && !isLoading && (
          <div className={styles.dropdown}>
            {allCategories.map((category) => {
              const selected = selectedCategoryIds.includes(category.id);
              return (
                <div
                  key={category.id}
                  className={`${styles.option} ${selected ? styles.optionSelected : ""}`}
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.name}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ボタン（編集ページだけ削除も出す） */}
      {onDelete ? (
        <div className={styles.updateDelete}>
          <div className={styles.row}>
            <button type="submit" className={styles.updataButton}disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : submitLabel}
            </button>
          </div>
          <div className={styles.row}>
            <button type="button" onClick={onDelete} className={styles.deleteButton} disabled={isSubmitting}>
              {deleteLabel}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.row}>
          <button type="submit" className={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "送信中..." : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}
