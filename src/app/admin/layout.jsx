import Layout2 from "../component/layout/layout2";

export default function RootLayout({ children }) {
  return (
    <div className="flex">
      <Layout2 />
      {children}
    </div>
  );
}
