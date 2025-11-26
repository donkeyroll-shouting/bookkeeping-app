"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Transaction } from "@/lib/googleSheets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpensePieChartProps {
    transactions: Transaction[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
    const data = transactions
        .filter((t) => t.type === "Expense")
        .reduce((acc, t) => {
            const existing = acc.find((item) => item.name === t.category)
            if (existing) {
                existing.value += t.amount
            } else {
                acc.push({ name: t.category, value: t.amount })
            }
            return acc
        }, [] as { name: string; value: number }[])

    return (
        <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
