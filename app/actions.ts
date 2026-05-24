"use server"

import { csvService } from "@/lib/csvStore"
import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"
import Papa from "papaparse"

export async function addTransaction(formData: FormData) {
    const date = formData.get("date") as string
    const type = formData.get("type") as "Income" | "Expense"
    const amount = parseFloat(formData.get("amount") as string)
    const category = formData.get("category") as string
    const description = formData.get("description") as string

    if (!date || !type || isNaN(amount) || !category) {
        throw new Error("Invalid form data")
    }

    await csvService.addTransaction({
        date,
        type,
        amount,
        category,
        description,
    })

    revalidatePath("/dashboard")
}

export async function importBatchTransactions(transactions: {
    id?: string;
    date: string;
    type: "Income" | "Expense";
    amount: number;
    category: string;
    description: string;
}[]) {
    await csvService.addBatchTransactions(transactions)
    revalidatePath("/dashboard")
}

export async function deleteBatchTransactionsAction(ids: string[]) {
    await csvService.deleteBatchTransactions(ids)
    revalidatePath("/dashboard")
}

export async function exportTransactionsAction() {
    const transactions = await csvService.getTransactions()
    if (transactions.length === 0) {
        return { success: false, message: "No data available to export." }
    }

    // Group transactions by year
    const grouped: Record<string, typeof transactions> = {}
    for (const t of transactions) {
        const year = t.date ? t.date.split("-")[0] : "Unknown"
        if (!grouped[year]) {
            grouped[year] = []
        }
        grouped[year].push(t)
    }

    const EXPORTS_DIR = path.join(process.cwd(), "exports")
    if (!fs.existsSync(EXPORTS_DIR)) {
        fs.mkdirSync(EXPORTS_DIR, { recursive: true })
    }

    const exportedFiles: string[] = []
    for (const [year, list] of Object.entries(grouped)) {
        // Sort chronologically ascending
        const sortedList = [...list].sort((a, b) => a.date.localeCompare(b.date))
        
        // Map to exact column structure for standard CSV export
        const exportData = sortedList.map(t => ({
            id: t.id,
            date: t.date,
            type: t.type,
            amount: t.amount,
            category: t.category,
            description: t.description || ""
        }))

        const csvContent = Papa.unparse(exportData)
        const filePath = path.join(EXPORTS_DIR, `${year}.csv`)
        fs.writeFileSync(filePath, csvContent, "utf-8")
        exportedFiles.push(`exports/${year}.csv`)
    }

    return {
        success: true,
        message: `Saved CSV files partitioned by year into the exports/ directory.`,
        files: exportedFiles
    }
}
