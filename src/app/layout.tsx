import type { Metadata } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "NovaMind AI";

export const metadata: Metadata = {
  title: siteName,
  description:
    "مساعدك الذكي للبرمجة، الدراسة، تحليل الصور والملفات، والكتابة والإجابة عن جميع أسئلتك",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('novamind-theme');
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
