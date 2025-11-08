import AdminSidebar from "./_components/AdminSidebar";
import styles from "./_styles_admin/Admin.module.css";

export default function AdminLayout({children}:{children:React.ReactNode}) {
  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}><AdminSidebar/></aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}