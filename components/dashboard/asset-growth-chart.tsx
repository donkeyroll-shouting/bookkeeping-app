"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Transaction } from "@/lib/googleSheets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"

interface AssetGrowthChartProps {
    transactions: Transaction[]
}

export function AssetGrowthChart({ transactions }: AssetGrowthChartProps) {
    const data = useMemo(() => {
        // 1. Sort by date ascending
        const sorted = [...transactions].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        // 2. Calculate Cumulative Sum
        let runningTotal = 0
        const chartData: { date: string; value: number }[] = []

        // Group by date to handle multiple transactions on same day? 
        // Or just plot every transaction?
        // Better to group by date for cleaner chart.

        const groupedByDate = new Map<string, number>()

        sorted.forEach(t => {
            const netAmount = t.type === 'Income' ? t.amount : -t.amount
            const current = groupedByDate.get(t.date) || 0
            groupedByDate.set(t.date, current + netAmount)
        })

        // Convert map to array and calculate running total
        // We need to sort keys again because Map iteration order is insertion order (usually), but let's be safe.
        const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) =>
            new Date(a).getTime() - new Date(b).getTime()
        )

        sortedDates.forEach(date => {
            const dailyNet = groupedByDate.get(date)!
            runningTotal += dailyNet
            chartData.push({
                date,
                value: runningTotal
            })
        })

        return chartData
    }, [transactions])

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Asset Growth</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Total Asset Value"]} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
