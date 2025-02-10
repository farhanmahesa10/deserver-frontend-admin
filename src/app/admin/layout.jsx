import Layout2 from "./layout2";

export default function RootLayout({ children }) {
  return (
    <div className="flex container">
      <Layout2 />
      {children}
    </div>
  );
}
