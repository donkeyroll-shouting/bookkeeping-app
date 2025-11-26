import { googleSheetsService } from "@/lib/googleSheets"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { AddTransactionModal } from "@/components/dashboard/add-transaction-modal"
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart"
import { AssetGrowthChart } from "@/components/dashboard/asset-growth-chart"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const transactions = await googleSheetsService.getTransactions()

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
                <AddTransactionModal />
            </div>

            <KPICards
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                netBalance={netBalance}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <AssetGrowthChart transactions={transactions} />
                <ExpensePieChart transactions={transactions} />
                <div className="col-span-7">
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 pt-0">
                            <h3 className="text-lg font-semibold py-4">Recent Transactions</h3>
                            <TransactionTable transactions={transactions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
