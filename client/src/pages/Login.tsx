import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Login error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + error.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ ยังไม่ได้ตั้งค่า Supabase</CardTitle>
            <CardDescription>
              กรุณาตั้งค่า Environment Variables ต่อไปนี้:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <code className="block bg-muted p-2 rounded text-sm">
              VITE_SUPABASE_URL=your-supabase-url
            </code>
            <code className="block bg-muted p-2 rounded text-sm">
              VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
            </code>
            <p className="text-sm text-muted-foreground mt-4">
              อ่านคู่มือการติดตั้งใน <code>DEPLOYMENT.md</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              เข้าสู่ระบบเพื่อเล่นเกม Scrabble ภาษาไทย
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleLogin} 
              className="w-full"
              size="lg"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              เข้าสู่ระบบด้วย Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">หรือ</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation("/")}
            >
              ทดลองเล่นฟรี (ไม่ต้องเข้าสู่ระบบ)
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
