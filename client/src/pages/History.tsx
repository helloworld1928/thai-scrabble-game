import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Home, Trophy, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { toast } from "sonner";

export default function History() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: games, isLoading } = trpc.game.list.useQuery(undefined, { enabled: isAuthenticated });
  const stats = trpc.stats.get.useQuery(undefined, { enabled: isAuthenticated });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนดูประวัติ");
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ประวัติการเล่น</h1>
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <Home className="h-4 w-4 mr-2" />
            หน้าหลัก
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {stats.data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-secondary" />
                สถิติโดยรวม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">
                    {stats.data.gamesPlayed}
                  </div>
                  <div className="text-sm text-muted-foreground">เกมทั้งหมด</div>
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
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-accent">
                    {stats.data.averageScore}
                  </div>
                  <div className="text-sm text-muted-foreground">คะแนนเฉลี่ย</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            เกมที่ผ่านมา
          </h2>

          {!games || games.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>ยังไม่มีประวัติการเล่น</p>
                <Button className="mt-4" onClick={() => setLocation("/game/new")}>
                  เริ่มเล่นเกมแรก
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    game.winner === 'player'
                      ? 'border-green-500'
                      : game.winner === 'ai'
                      ? 'border-red-500'
                      : 'border-yellow-500'
                  }`}
                  onClick={() => setLocation(`/game/${game.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          {game.winner === 'player' && (
                            <div className="text-2xl">🏆</div>
                          )}
                          {game.winner === 'ai' && (
                            <div className="text-2xl">😔</div>
                          )}
                          {game.winner === 'draw' && (
                            <div className="text-2xl">🤝</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {game.status === 'playing' ? 'กำลังเล่น' : 'จบแล้ว'}
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold">
                            {game.winner === 'player' && 'คุณชนะ!'}
                            {game.winner === 'ai' && 'AI ชนะ'}
                            {game.winner === 'draw' && 'เสมอ'}
                            {game.status === 'playing' && 'เกมยังไม่จบ'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(game.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {game.playerScore}
                          </div>
                          <div className="text-xs text-muted-foreground">คุณ</div>
                        </div>
                        <div className="text-muted-foreground">vs</div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-destructive">
                            {game.aiScore}
                          </div>
                          <div className="text-xs text-muted-foreground">AI</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
