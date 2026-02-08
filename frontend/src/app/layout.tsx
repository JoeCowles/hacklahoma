import "./globals.css";

export const metadata = {
  title: 'Lecture Assistant Dashboard',
  description: 'Lecture Assistant Dashboard for Quantum Physics 101',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-primary/30 selection:text-white">
        {children}
      </body>
    </html>
  )
}