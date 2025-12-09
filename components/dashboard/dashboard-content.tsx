"use client"

import * as React from "react"
import { Transaction } from "@/lib/googleSheets"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { AssetGrowthChart } from "@/components/dashboard/asset-growth-chart"
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart"
import { TransactionTable } from "@/components/dashboard/transaction-table"

interface DashboardContentProps {
    transactions: Transaction[]
    totalIncome: number
    totalExpenses: number
    netBalance: number
}

export function DashboardContent({
    transactions,
    totalIncome,
    totalExpenses,
    netBalance,
}: DashboardContentProps) {
    // Extract unique years from transactions
    const years = React.useMemo(() => {
        const uniqueYears = Array.from(new Set(transactions.map((t) => {
            const date = new Date(t.date)
            return isNaN(date.getFullYear()) ? null : date.getFullYear().toString()
        }))).filter(Boolean) as string[]
        return uniqueYears.sort((a, b) => b.localeCompare(a)) // Sort descending
    }, [transactions])

    const currentYear = new Date().getFullYear().toString()
    const [selectedYear, setSelectedYear] = React.useState<string>(
        years.includes(currentYear) ? currentYear : years[0] || currentYear
    )

    // Filter transactions based on selected year
    const filteredTransactions = React.useMemo(() => {
        return transactions.filter((t) => {
            const date = new Date(t.date)
            return date.getFullYear().toString() === selectedYear
        })
    }, [transactions, selectedYear])

    return (
        <div className="space-y-6">
            <KPICards
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                netBalance={netBalance}
            />

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Analytics & Transactions</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filter by Year:</span>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <AssetGrowthChart transactions={filteredTransactions} />
                <ExpensePieChart transactions={filteredTransactions} />
                <div className="col-span-7">
                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 pt-0">
                            <h3 className="text-lg font-semibold py-4">Recent Transactions</h3>
                            <TransactionTable transactions={filteredTransactions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
