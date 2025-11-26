import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Sign in to access your Bookkeeping Dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        action={async () => {
                            "use server"
                            await signIn("google", { redirectTo: "/dashboard" })
                        }}
                    >
                        <Button className="w-full" type="submit">
                            Sign in with Google
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
