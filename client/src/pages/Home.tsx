import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, Trophy, History, ShoppingBag } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const stats = trpc.stats.get.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-card">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
              <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>เข้าสู่ระบบ</a>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold text-foreground">
                เกม Scrabble ภาษาไทย
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                ท้าทายสมองกับเกมต่อคำภาษาไทย พร้อมระบบ AI คู่ต่อสู้ระดับ ม.5
                เรียนรู้คำศัพท์ใหม่ๆ และพัฒนาทักษะการคิดวิเคราะห์
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    เล่นกับ AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ท้าทายกับ AI ที่ฉลาดและเล่นได้หลากหลายระดับความยาก
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-secondary" />
                    คะแนนและอันดับ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ติดตามสถิติการเล่นและพัฒนาทักษะของคุณ
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-accent" />
                    ประวัติการเล่น
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    ย้อนดูเกมที่ผ่านมาและเรียนรู้จากการเล่นของคุณ
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="pt-4">
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>เริ่มเล่นเลย</a>
              </Button>
            </div>
          </div>
        </main>

        <footer className="border-t py-6">
          <div className="container text-center text-sm text-muted-foreground">
            <p>เกม Scrabble ภาษาไทย - เรียนรู้และสนุกไปพร้อมกัน</p>
          </div>
        </footer>
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              สวัสดี, {user?.name || 'ผู้เล่น'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">ยินดีต้อนรับสู่เกม Scrabble ภาษาไทย</h2>
            <p className="text-muted-foreground">เลือกเมนูด้านล่างเพื่อเริ่มเล่น</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Play className="h-6 w-6 text-primary" />
                  เริ่มเกมใหม่
                </CardTitle>
                <CardDescription>
                  ท้าทายกับ AI ในเกมต่อคำภาษาไทย
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/game/new">เริ่มเล่น</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <History className="h-6 w-6 text-accent" />
                  ประวัติการเล่น
                </CardTitle>
                <CardDescription>
                  ดูเกมที่ผ่านมาและสถิติของคุณ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/history">ดูประวัติ</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <ShoppingBag className="h-6 w-6 text-secondary" />
                  ร้านค้า
                </CardTitle>
                <CardDescription>
                  ซื้อธีมกระดานและสนับสนุนผู้พัฒนา
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link href="/shop">ไปร้านค้า</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {stats.data && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-secondary" />
                  สถิติของคุณ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {stats.data.gamesPlayed}
                    </div>
                    <div className="text-sm text-muted-foreground">เกมที่เล่น</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.data.gamesWon}
                    </div>
                    <div className="text-sm text-muted-foreground">ชนะ</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-red-600">
                      {stats.data.gamesLost}
                    </div>
                    <div className="text-sm text-muted-foreground">แพ้</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-secondary">
                      {stats.data.highestScore}
                    </div>
                    <div className="text-sm text-muted-foreground">คะแนนสูงสุด</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>เกม Scrabble ภาษาไทย - เรียนรู้และสนุกไปพร้อมกัน</p>
        </div>
      </footer>
    </div>
  );
}
