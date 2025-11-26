import { Header } from "@/components/header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <Header />
            <main className="p-6">
                {children}
            </main>
        </div>
    )
}
