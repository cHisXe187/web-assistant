export const metadata = { title: "Web Assistant" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{margin:0}}>{children}</body>
    </html>
  );
}
