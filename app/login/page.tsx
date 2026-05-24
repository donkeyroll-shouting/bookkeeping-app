import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Lock, User, KeyRound } from "lucide-react"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams
    const isError = error === "CredentialsSignin" || !!error
    const showDemoCredentials = process.env.NODE_ENV !== "production"
    const demoUsername = process.env.USERNAME || "admin"
    const demoPassword = process.env.PASSWORD || "admin"

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 px-4 dark:bg-zinc-950">
            <Card className="mx-auto w-full max-w-md shadow-lg border-gray-200/80 dark:border-zinc-800">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <KeyRound className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Sign in to access your Bookkeeping Dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isError && (
                        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold">Invalid credentials</span>
                                <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-0.5">
                                    Please enter the correct username and password.
                                </p>
                            </div>
                        </div>
                    )}

                    <form
                        action={async (formData) => {
                            "use server"
                            await signIn("credentials", {
                                ...Object.fromEntries(formData),
                                redirectTo: "/dashboard",
                            })
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                                    <User className="h-4 w-4" />
                                </span>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    required
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                                    <Lock className="h-4 w-4" />
                                </span>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Button className="w-full font-medium" type="submit">
                            Sign In
                        </Button>
                    </form>

                    {showDemoCredentials && (
                        <div className="rounded-lg border border-zinc-200/80 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-350 mt-4">
                            <p className="font-semibold text-xs uppercase tracking-wider text-zinc-500 mb-1">
                                Local Development Credentials
                            </p>
                            <div className="flex justify-between text-xs font-mono">
                                <span>Username: <strong className="text-zinc-900 dark:text-zinc-100">{demoUsername}</strong></span>
                                <span>Password: <strong className="text-zinc-900 dark:text-zinc-100">{demoPassword}</strong></span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
