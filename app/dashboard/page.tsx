import { csvService } from "@/lib/csvStore"
import { ImportTransactionModal } from "@/components/dashboard/import-transaction-modal"
import { ExportTransactionModal } from "@/components/dashboard/export-transaction-modal"
import { AddTransactionModal } from "@/components/dashboard/add-transaction-modal"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const transactions = await csvService.getTransactions()

    const totalIncome = transactions
        .filter((t) => t.type === "Income")
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + t.amount, 0)

    const netBalance = totalIncome - totalExpenses

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex gap-2">
                    <ExportTransactionModal />
                    <ImportTransactionModal />
                    <AddTransactionModal />
                </div>
            </div>

            <DashboardContent
                transactions={transactions}
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                netBalance={netBalance}
            />
        </div>
    )
}
