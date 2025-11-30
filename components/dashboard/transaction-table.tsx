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
import { ArrowUpDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { deleteBatchTransactionsAction } from "@/app/actions"

interface TransactionTableProps {
    transactions: Transaction[];
}

export function TransactionTable({ transactions: initialTransactions }: TransactionTableProps) {
    const [transactions, setTransactions] = useState(initialTransactions)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    // Update local state when props change (e.g. after revalidation)
    // Actually, better to use useEffect or just rely on key/router refresh. 
    // But since we have local sort state, we might need to sync.
    // For now, let's assume the parent triggers a refresh which remounts or we use a key.
    // Or we can use `useEffect` to sync if `initialTransactions` changes.
    // Let's stick to simple prop usage for now, but `useState(initial)` only sets it once.
    // If we want to support updates from server actions without full page reload clearing state, we should use useEffect.
    // However, the server action calls revalidatePath, which re-runs the RSC. 
    // The client component will receive new props. We should sync them.

    // Simple sync for now:
    if (initialTransactions !== transactions && initialTransactions.length !== transactions.length) {
        // This is a bit risky for infinite loops if not careful. 
        // Better to use useEffect.
    }

    // Better approach: derive sorted transactions from props + local sort state?
    // But we want to sort locally.
    // Let's use a useEffect to update local state when props change.
    const [prevInitialTransactions, setPrevInitialTransactions] = useState(initialTransactions)
    if (initialTransactions !== prevInitialTransactions) {
        setTransactions(initialTransactions)
        setPrevInitialTransactions(initialTransactions)
        setSelectedIds(new Set()) // Clear selection on update
    }

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

    const toggleSelectAll = () => {
        if (selectedIds.size === transactions.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(transactions.map(t => t.id)))
        }
    }

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteBatchTransactionsAction(Array.from(selectedIds))
            setShowDeleteDialog(false)
            setSelectedIds(new Set())
        } catch (error) {
            console.error("Failed to delete transactions", error)
            alert("Failed to delete transactions")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md border">
                    <span className="text-sm font-medium px-2">
                        {selectedIds.size} selected
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                    </Button>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={transactions.length > 0 && selectedIds.size === transactions.length}
                                    onChange={toggleSelectAll}
                                />
                            </TableHead>
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
                            <TableRow key={t.id} data-state={selectedIds.has(t.id) ? "selected" : undefined}>
                                <TableCell>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedIds.has(t.id)}
                                        onChange={() => toggleSelect(t.id)}
                                    />
                                </TableCell>
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

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Transactions</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedIds.size} transactions? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
