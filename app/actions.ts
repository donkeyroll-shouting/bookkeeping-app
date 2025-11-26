"use server"

import { googleSheetsService } from "@/lib/googleSheets"
import { revalidatePath } from "next/cache"

export async function addTransaction(formData: FormData) {
    const date = formData.get("date") as string
    const type = formData.get("type") as "Income" | "Expense"
    const amount = parseFloat(formData.get("amount") as string)
    const category = formData.get("category") as string
    const description = formData.get("description") as string

    if (!date || !type || isNaN(amount) || !category) {
        throw new Error("Invalid form data")
    }

    await googleSheetsService.addTransaction({
        date,
        type,
        amount,
        category,
        description,
    })

    revalidatePath("/dashboard")
}
