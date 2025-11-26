import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b px-6">
            <h1 className="text-lg font-semibold">Bookkeeping App</h1>
            <form
                action={async () => {
                    "use server"
                    await signOut({ redirectTo: "/login" })
                }}
            >
                <Button variant="outline" size="sm">
                    Sign Out
                </Button>
            </form>
        </header>
    )
}
