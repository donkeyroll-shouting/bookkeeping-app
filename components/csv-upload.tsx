"use client"

import { useState, useRef } from "react"
import Papa from "papaparse"
import { Upload, Trash2, Check, AlertCircle, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { importBatchTransactions } from "@/app/actions"

interface TransactionDraft {
    id: string // temporary ID for UI key
    date: string
    type: "Income" | "Expense"
    amount: number
    category: string
    description: string
}

interface CsvUploadProps {
    onSuccess: () => void
}

export function CsvUpload({ onSuccess }: CsvUploadProps) {
    const [data, setData] = useState<TransactionDraft[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedData: TransactionDraft[] = []
                let hasError = false

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                results.data.forEach((row: any, index) => {
                    if (hasError) return

                    // Basic validation
                    if (!row.date || !row.type || !row.amount || !row.category) {
                        // Skip empty or malformed rows, or handle error
                        // For now, let's just skip and maybe warn?
                        // Or better, set error and stop.
                        // Let's try to parse what we can.
                    }

                    const amount = parseFloat(row.amount)
                    if (isNaN(amount)) {
                        // Skip invalid amounts
                        return
                    }

                    parsedData.push({
                        id: crypto.randomUUID(),
                        date: row.date,
                        type: row.type === "Income" ? "Income" : "Expense", // Default to Expense if not Income? Or strict?
                        amount: amount,
                        category: row.category || "Uncategorized",
                        description: row.description || "",
                    })
                })

                if (parsedData.length === 0) {
                    setError("No valid transactions found in CSV.")
                } else {
                    setData(parsedData)
                    setError(null)
                }
            },
            error: (err) => {
                setError("Error parsing CSV: " + err.message)
            }
        })
    }

    const handleDelete = (id: string) => {
        setData((prev) => prev.filter((t) => t.id !== id))
    }

    const handleUpdate = (id: string, field: keyof TransactionDraft, value: string | number) => {
        setData((prev) =>
            prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
        )
    }

    const handleImport = async () => {
        setIsUploading(true)
        try {
            // Remove temporary ID before sending to server
            const transactionsToImport = data.map(({ id, ...rest }) => rest)
            await importBatchTransactions(transactionsToImport)
            onSuccess()
            setData([])
        } catch (err) {
            setError("Failed to import transactions. Please try again.")
            console.error(err)
        } finally {
            setIsUploading(false)
        }
    }

    if (data.length > 0) {
        const totalAmount = data.reduce((sum, t) => sum + (t.type === "Income" ? t.amount : -t.amount), 0)

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">Review Transactions</h3>
                        <p className="text-sm text-muted-foreground">
                            {data.length} transactions found. Net impact: ${totalAmount.toFixed(2)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setData([])}>
                            Cancel
                        </Button>
                        <Button onClick={handleImport} disabled={isUploading}>
                            {isUploading ? "Importing..." : "Confirm Import"}
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="border rounded-md max-h-[400px] overflow-y-auto overflow-x-auto bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <Input
                                            type="date"
                                            value={row.date}
                                            onChange={(e) => handleUpdate(row.id, "date", e.target.value)}
                                            className="h-8 w-[130px]"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={row.type}
                                            onValueChange={(val) => handleUpdate(row.id, "type", val)}
                                        >
                                            <SelectTrigger className="h-8 w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Income">Income</SelectItem>
                                                <SelectItem value="Expense">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={row.amount}
                                            onChange={(e) => handleUpdate(row.id, "amount", parseFloat(e.target.value))}
                                            className="h-8 w-[100px]"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={row.category}
                                            onChange={(e) => handleUpdate(row.id, "category", e.target.value)}
                                            className="h-8 w-[150px]"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={row.description}
                                            onChange={(e) => handleUpdate(row.id, "description", e.target.value)}
                                            className="h-8 min-w-[200px]"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(row.id)}
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
                <FileUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload CSV</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Drag and drop your CSV file here, or click to browse.
                <br />
                <span className="text-xs">Required columns: date, type, amount, category, description</span>
            </p>
            <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
            />
            <Button onClick={() => fileInputRef.current?.click()}>
                Select File
            </Button>
            {error && (
                <div className="mt-4 text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}
        </div>
    )
}
