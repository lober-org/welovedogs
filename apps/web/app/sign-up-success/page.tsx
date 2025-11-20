import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Heart } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 paw-pattern-bg">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold">
              <span className="text-purple-600">WE</span>
              <Heart className="h-8 w-8 fill-red-500 text-red-500" />
              <span className="text-purple-600">DOGS</span>
            </Link>
          </div>

          <Card className="border-2 border-purple-200 shadow-xl">
            <CardHeader className="space-y-1 bg-gradient-to-br from-purple-100 via-purple-50 to-white text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
              <CardDescription>We've sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email inbox and click the confirmation link to activate your
                account. Once confirmed, you'll be able to sign in and complete your profile.
              </p>

              <div className="pt-4">
                <Button
                  asChild
                  className="w-full h-11 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold hover:from-yellow-500 hover:to-yellow-600"
                >
                  <Link href="/sign-in">Back to Sign In</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground pt-4">
                Didn't receive the email? Check your spam folder or{" "}
                <Link href="/sign-up" className="text-purple-600 hover:underline">
                  try again
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
