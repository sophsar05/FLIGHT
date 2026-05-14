import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div className="view">{children}</div>
      </main>
    </div>
  )
}
