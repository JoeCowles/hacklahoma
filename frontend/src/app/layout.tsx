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
    <html lang="en" className="light">
      <body className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-gray-100 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}