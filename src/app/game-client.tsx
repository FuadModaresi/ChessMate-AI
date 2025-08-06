"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Chess, type Square, type Move } from 'chess.js';
import { aiOpponentMove } from '@/ai/flows/ai-opponent-move-generation';
import { adjustAiDifficulty } from '@/ai/flows/ai-difficulty-adjustment';

import { Chessboard } from '@/components/game/chessboard';
import { GameControls } from '@/components/game/game-controls';
import { MoveHistory } from '@/components/game/move-history';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Swords, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export default function GameClient() {
    const [game, setGame] = useState(new Chess());
    const [history, setHistory] = useState<Move[]>([]);
    
    const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
    const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
    const [gameOver, setGameOver] = useState<{isGameOver: boolean; reason: string}>({isGameOver: false, reason: ""});
    const [isFocusMode, setIsFocusMode] = useState(false);
    
    const isPlayerTurn = useMemo(() => game.turn() === playerColor, [game, playerColor]);
    const isAITurn = useMemo(() => !isPlayerTurn && !gameOver.isGameOver, [isPlayerTurn, gameOver.isGameOver]);
    const fen = useMemo(() => game.fen(), [game]);
    const boardOrientation = useMemo(() => playerColor === 'w' ? 'white' : 'black', [playerColor]);

    const getGameOverReason = useCallback((currentGame: Chess): string => {
        if (currentGame.isCheckmate()) return `Checkmate! ${currentGame.turn() === 'w' ? 'Black' : 'White'} wins.`;
        if (currentGame.isDraw()) return "Draw!";
        if (currentGame.isStalemate()) return "Stalemate!";
        if (currentGame.isThreefoldRepetition()) return "Draw by three-fold repetition!";
        if (currentGame.isInsufficientMaterial()) return "Draw by insufficient material!";
        return "";
    }, []);

    const makeMove = useCallback((move: string | { from: Square, to: Square, promotion?: string }) => {
        const gameCopy = new Chess(game.fen());
        try {
            const result = gameCopy.move(move);
            if (result) {
                setGame(gameCopy);
                setHistory(gameCopy.history({ verbose: true }));
                if (gameCopy.isGameOver()) {
                    setGameOver({ isGameOver: true, reason: getGameOverReason(gameCopy) });
                }
            }
            return result;
        } catch (error) {
            console.error("Invalid move:", error);
            return null;
        }
    }, [game, getGameOverReason]);

    const handleNewGame = useCallback(() => {
        const newGame = new Chess();
        setGame(newGame);
        setHistory([]);
        setGameOver({isGameOver: false, reason: ""});
        setPlayerColor('w');
    }, []);
    
    const handleDifficultyChange = useCallback(async (newDifficulty: Difficulty) => {
        setDifficulty(newDifficulty);
        await adjustAiDifficulty({ difficulty: newDifficulty });
        handleNewGame();
    }, [handleNewGame]);

    const handleSwitchSides = useCallback(() => {
        setPlayerColor(prev => prev === 'w' ? 'b' : 'w');
        handleNewGame();
    }, [handleNewGame]);

    const toggleFocusMode = useCallback(() => {
        setIsFocusMode(prev => !prev);
    }, []);

    useEffect(() => {
        if(isAITurn) {
            const getAIMove = async () => {
                try {
                  const aiMove = await aiOpponentMove({ boardState: game.fen(), difficulty });
                  if (aiMove) {
                      makeMove(aiMove);
                  }
                } catch(e) {
                  console.error("AI move failed", e);
                }
            };
            const timer = setTimeout(getAIMove, 500);
            return () => clearTimeout(timer);
        }
    }, [isAITurn, game, difficulty, makeMove]);

    return (
        <>
            <main className={cn(
                "container mx-auto p-4 min-h-screen flex flex-col items-center justify-center transition-all duration-300 relative",
                isFocusMode ? "p-0 md:p-4" : ""
            )}>
                {isFocusMode && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-foreground h-8 w-8"
                        onClick={toggleFocusMode}
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Exit Focus Mode</span>
                    </Button>
                )}
                {!isFocusMode && (
                  <header className="text-center mb-8">
                      <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">ChessMate AI</h1>
                      <p className="text-muted-foreground mt-2">The ultimate chess challenge powered by GenAI</p>
                  </header>
                )}
                
                <div className={cn(
                  "w-full flex flex-col gap-8",
                  !isFocusMode && "max-w-7xl mx-auto lg:flex-row"
                )}>
                    <div className={cn(
                        "w-full transition-all duration-300",
                        !isFocusMode && "lg:w-2/3"
                    )}>
                        <Card className="shadow-lg bg-transparent">
                           <CardContent className="p-1 sm:p-2">
                                <Chessboard
                                    fen={fen}
                                    onMove={makeMove}
                                    orientation={boardOrientation}
                                    isInteractable={isPlayerTurn && !gameOver.isGameOver}
                                />
                           </CardContent>
                        </Card>
                         {isAITurn && !gameOver.isGameOver && (
                            <div className="mt-4 text-center text-lg font-semibold text-accent animate-pulse">
                                AI is thinking...
                            </div>
                        )}
                    </div>
                    {!isFocusMode && (
                      <div className="lg:w-1/3 w-full flex flex-col gap-8">
                          <GameControls 
                              onNewGame={handleNewGame}
                              onSwitchSides={handleSwitchSides}
                              difficulty={difficulty}
                              onDifficultyChange={handleDifficultyChange}
                              isAITurn={isAITurn || gameOver.isGameOver}
                              onToggleFocusMode={toggleFocusMode}
                              isFocusMode={isFocusMode}
                          />
                          <MoveHistory history={history} />
                      </div>
                    )}
                </div>
            </main>

            <Dialog open={gameOver.isGameOver} onOpenChange={(open) => !open && handleNewGame()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
                           <Crown className="text-accent" /> Game Over
                        </DialogTitle>
                        <DialogDescription className="text-center text-lg pt-4">
                            {gameOver.reason}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleNewGame} className="w-full">
                           <Swords className="mr-2 h-4 w-4" /> Start New Game
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
