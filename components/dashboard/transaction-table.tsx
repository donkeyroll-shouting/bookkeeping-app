"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Transaction } from "@/lib/googleSheets"
import { useState } from "react"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionTableProps {
    transactions: Transaction[];
}

export function TransactionTable({ transactions: initialTransactions }: TransactionTableProps) {
    const [transactions, setTransactions] = useState(initialTransactions)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const toggleSort = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
        setSortOrder(newOrder)
        const sorted = [...transactions].sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            return newOrder === 'asc' ? dateA - dateB : dateB - dateA
        })
        setTransactions(sorted)
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                            <Button variant="ghost" onClick={toggleSort}>
                                Date
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell>{t.date}</TableCell>
                            <TableCell className={t.type === 'Income' ? 'text-green-600' : 'text-red-600'}>
                                {t.type}
                            </TableCell>
                            <TableCell>{t.category}</TableCell>
                            <TableCell>{t.description}</TableCell>
                            <TableCell className="text-right">
                                ${t.amount.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
