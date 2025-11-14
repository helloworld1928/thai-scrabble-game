import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Home, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Tile {
  letter: string;
  score: number;
}

interface BoardCell {
  letter: string | null;
  multiplier: {
    type: 'letter' | 'word' | null;
    value: number;
  };
}

interface Position {
  row: number;
  col: number;
  letter: string;
}

export default function Game() {
  const [, params] = useRoute("/game/:id");
  const [, setLocation] = useLocation();
  const gameId = params?.id === "new" ? null : Number(params?.id);

  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [placedPositions, setPlacedPositions] = useState<Position[]>([]);
  const [isPlacing, setIsPlacing] = useState(false);

  const createGame = trpc.game.create.useMutation({
    onSuccess: (game) => {
      if (game) {
        setLocation(`/game/${game.id}`);
      }
    },
    onError: (error) => {
      toast.error("ไม่สามารถสร้างเกมได้: " + error.message);
    },
  });

  const { data: game, isLoading, refetch } = trpc.game.get.useQuery(
    { gameId: gameId! },
    { enabled: gameId !== null, refetchInterval: false }
  );

  const placeWord = trpc.game.placeWord.useMutation({
    onSuccess: (result) => {
      toast.success(`วางคำสำเร็จ! ได้ ${result.score} คะแนน`);
      setSelectedTiles([]);
      setPlacedPositions([]);
      setIsPlacing(false);
      refetch();
    },
    onError: (error) => {
      toast.error("ไม่สามารถวางคำได้: " + error.message);
    },
  });

  const aiTurn = trpc.game.aiTurn.useMutation({
    onSuccess: (result) => {
      if (result.action === 'place') {
        toast.info(`AI วางคำ "${result.word}" ได้ ${result.score} คะแนน`);
      } else {
        toast.info("AI ข้ามเทิร์น");
      }
      
      if (result.gameOver) {
        if (result.winner === 'player') {
          toast.success("🎉 คุณชนะ!");
        } else if (result.winner === 'ai') {
          toast.error("AI ชนะ");
        } else {
          toast.info("เสมอ!");
        }
      }
      
      refetch();
    },
    onError: (error) => {
      toast.error("AI เล่นไม่สำเร็จ: " + error.message);
    },
  });

  const passTurn = trpc.game.pass.useMutation({
    onSuccess: () => {
      toast.info("ข้ามเทิร์น");
      refetch();
    },
  });

  useEffect(() => {
    if (gameId === null) {
      createGame.mutate();
    }
  }, [gameId]);

  useEffect(() => {
    if (game && game.currentTurn === 'ai' && game.status === 'playing') {
      const timer = setTimeout(() => {
        aiTurn.mutate({ gameId: game.id });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [game?.currentTurn, game?.status]);

  const handleCellClick = (row: number, col: number) => {
    if (!game || game.status !== 'playing' || game.currentTurn !== 'player') return;
    if (game.boardState[row][col].letter !== null) return;
    if (selectedTiles.length === 0) return;

    const tileIndex = selectedTiles[0];
    const tile = game.playerTiles[tileIndex];

    setPlacedPositions([...placedPositions, { row, col, letter: tile.letter }]);
    setSelectedTiles(selectedTiles.slice(1));
  };

  const handleTileClick = (index: number) => {
    if (!game || game.status !== 'playing' || game.currentTurn !== 'player') return;
    
    if (selectedTiles.includes(index)) {
      setSelectedTiles(selectedTiles.filter(i => i !== index));
    } else {
      setSelectedTiles([...selectedTiles, index]);
    }
  };

  const handlePlaceWord = () => {
    if (!game || placedPositions.length === 0) return;

    placeWord.mutate({
      gameId: game.id,
      positions: placedPositions,
    });
  };

  const handleClear = () => {
    setSelectedTiles([]);
    setPlacedPositions([]);
  };

  const handlePass = () => {
    if (!game) return;
    passTurn.mutate({ gameId: game.id });
  };

  const getCellClass = (cell: BoardCell, row: number, col: number) => {
    const classes = ['scrabble-cell'];
    
    if (cell.letter) {
      classes.push('has-letter');
    } else {
      if (row === 7 && col === 7) {
        classes.push('center');
      } else if (cell.multiplier.type === 'word' && cell.multiplier.value === 3) {
        classes.push('multiplier-word-3');
      } else if (cell.multiplier.type === 'word' && cell.multiplier.value === 2) {
        classes.push('multiplier-word-2');
      } else if (cell.multiplier.type === 'letter' && cell.multiplier.value === 3) {
        classes.push('multiplier-letter-3');
      } else if (cell.multiplier.type === 'letter' && cell.multiplier.value === 2) {
        classes.push('multiplier-letter-2');
      }
    }

    return classes.join(' ');
  };

  const getCellContent = (cell: BoardCell, row: number, col: number) => {
    // ตรวจสอบว่ามีตัวอักษรที่วางชั่วคราวหรือไม่
    const placed = placedPositions.find(p => p.row === row && p.col === col);
    if (placed) {
      return <span className="text-primary font-bold">{placed.letter}</span>;
    }

    if (cell.letter) {
      return <span>{cell.letter}</span>;
    }

    if (row === 7 && col === 7) {
      return <span className="text-xs">★</span>;
    }

    if (cell.multiplier.type === 'word') {
      return <span className="text-xs">{cell.multiplier.value}W</span>;
    }

    if (cell.multiplier.type === 'letter') {
      return <span className="text-xs">{cell.multiplier.value}L</span>;
    }

    return null;
  };

  if (isLoading || createGame.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>ไม่พบเกม</p>
            <Button className="mt-4" onClick={() => setLocation("/")}>
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <Home className="h-4 w-4 mr-2" />
            หน้าหลัก
          </Button>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">คุณ:</span>
              <span className="text-2xl font-bold text-primary">{game.playerScore}</span>
            </div>
            <div className="text-muted-foreground">vs</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">AI:</span>
              <span className="text-2xl font-bold text-destructive">{game.aiScore}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            ตัวอักษรเหลือ: {game.tileBag.length}
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {game.status === 'finished' && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {game.winner === 'player' && '🎉 คุณชนะ!'}
                {game.winner === 'ai' && '😔 AI ชนะ'}
                {game.winner === 'draw' && '🤝 เสมอ!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                คะแนนสุดท้าย: คุณ {game.playerScore} - AI {game.aiScore}
              </p>
              <Button onClick={() => setLocation("/game/new")}>
                เล่นอีกครั้ง
              </Button>
            </CardContent>
          </Card>
        )}

        {game.status === 'playing' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-lg border">
              {game.currentTurn === 'player' ? (
                <>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-semibold">เทิร์นของคุณ</span>
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-semibold">AI กำลังคิด...</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <div className="scrabble-board max-w-2xl w-full">
            {game.boardState.map((row: BoardCell[], rowIndex: number) =>
              row.map((cell: BoardCell, colIndex: number) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClass(cell, rowIndex, colIndex)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {getCellContent(cell, rowIndex, colIndex)}
                </div>
              ))
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">ตัวอักษรของคุณ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tile-rack">
              {game.playerTiles.map((tile: Tile, index: number) => (
                <div
                  key={index}
                  className={`scrabble-tile ${
                    selectedTiles.includes(index) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleTileClick(index)}
                >
                  <span className="tile-letter">{tile.letter}</span>
                  <span className="tile-score">{tile.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {game.status === 'playing' && game.currentTurn === 'player' && (
          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              onClick={handlePlaceWord}
              disabled={placedPositions.length === 0 || placeWord.isPending}
            >
              {placeWord.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              วางคำ ({placedPositions.length} ตัว)
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleClear}
              disabled={placedPositions.length === 0 && selectedTiles.length === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              ล้าง
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={handlePass}
              disabled={passTurn.isPending}
            >
              ข้ามเทิร์น
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
