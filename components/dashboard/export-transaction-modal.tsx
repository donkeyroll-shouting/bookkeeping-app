"use client"

import { useState } from "react"
import { Download, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { exportTransactionsAction } from "@/app/actions"

export function ExportTransactionModal() {
    const [open, setOpen] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string; files?: string[] } | null>(null)

    const handleExport = async () => {
        setIsExporting(true)
        setResult(null)
        try {
            const res = await exportTransactionsAction()
            setResult(res)
        } catch (error) {
            console.error("Export failed", error)
            setResult({ success: false, message: "An unexpected error occurred during export." })
        } finally {
            setIsExporting(false)
        }
    }

    const handleClose = () => {
        setOpen(false)
        // Reset state after dialog is fully closed
        setTimeout(() => setResult(null), 300)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-dashed">
                    <Download className="h-4 w-4" />
                    Export All
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Export Bookkeeping Data</DialogTitle>
                    <DialogDescription>
                        Generate and save CSV files partitioned by year directly to your local file system.
                    </DialogDescription>
                </DialogHeader>

                {result ? (
                    <div className="space-y-4 py-4">
                        {result.success ? (
                            <div className="flex flex-col items-center text-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg">
                                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                                <span className="font-semibold text-green-900 dark:text-green-300">Export Complete!</span>
                                <p className="text-xs text-green-750/90 dark:text-green-400/90 mt-1">
                                    {result.message}
                                </p>
                                {result.files && result.files.length > 0 && (
                                    <div className="w-full text-left mt-3 bg-white dark:bg-zinc-900 p-2.5 rounded border border-green-150 dark:border-green-900/35 max-h-[150px] overflow-y-auto">
                                        <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Created files:</p>
                                        <ul className="text-xs font-mono text-zinc-700 dark:text-zinc-300 space-y-1">
                                            {result.files.map((file, index) => (
                                                <li key={index} className="truncate">✓ {file}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-800 dark:text-red-400">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold">Export Failed</span>
                                    <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-1">
                                        {result.message}
                                    </p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">Done</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            This action will read all transaction records, sort them chronologically, group them by year, and save them as individual CSV files under the <code className="font-mono bg-zinc-100 dark:bg-zinc-900 px-1 rounded text-zinc-900 dark:text-zinc-200">exports/</code> directory in your local workspace.
                        </p>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={handleClose} disabled={isExporting}>
                                Cancel
                            </Button>
                            <Button onClick={handleExport} disabled={isExporting} className="gap-2">
                                {isExporting ? "Exporting..." : "Confirm Export"}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
