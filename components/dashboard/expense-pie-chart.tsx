"use client"

import { useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Transaction } from "@/lib/googleSheets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ExpensePieChartProps {
    transactions: Transaction[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57', '#83a6ed'];

export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
    // 1. Aggregate expenses by category
    const rawData = transactions
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

    // 2. Sort by value descending
    rawData.sort((a, b) => b.value - a.value)

    // 3. Group into Top 10 + Other
    let finalData = rawData
    let otherCategories: { name: string; value: number }[] = []

    if (rawData.length > 10) {
        const top10 = rawData.slice(0, 10)
        otherCategories = rawData.slice(10)
        const otherTotal = otherCategories.reduce((sum, curr) => sum + curr.value, 0)

        finalData = [...top10, { name: "Other", value: otherTotal }]
    }

    const total = finalData.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* Chart Section */}
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={finalData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {finalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `$${value.toLocaleString()}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Ranking List Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Top Expenses</h4>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {finalData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="font-medium truncate max-w-[120px]" title={entry.name}>
                                            {entry.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-muted-foreground">
                                        <span>${entry.value.toLocaleString()}</span>
                                        <div className="flex items-center justify-end w-16 gap-2">
                                            <span>
                                                {((entry.value / total) * 100).toFixed(1)}%
                                            </span>
                                            {entry.name === "Other" && otherCategories.length > 0 && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full p-0">
                                                            <span className="sr-only">View details</span>
                                                            <span className="text-xs">ⓘ</span>
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Other Expenses</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                                                            {otherCategories.map((cat, i) => (
                                                                <div key={i} className="flex justify-between text-sm">
                                                                    <span>{cat.name}</span>
                                                                    <span className="font-mono">${cat.value.toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
