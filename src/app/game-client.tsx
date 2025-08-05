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
import { Crown, Swords } from 'lucide-react';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export default function GameClient() {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [history, setHistory] = useState<Move[]>([]);
    
    const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
    const [isAITurn, setIsAITurn] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>('Beginner');
    const [gameOver, setGameOver] = useState<{isGameOver: boolean; reason: string}>({isGameOver: false, reason: ""});
    
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
                setFen(gameCopy.fen());
                setHistory(gameCopy.history({ verbose: true }));
                if (gameCopy.isGameOver()) {
                    setGameOver({ isGameOver: true, reason: getGameOverReason(gameCopy) });
                } else {
                    if (gameCopy.turn() !== playerColor) {
                        setIsAITurn(true);
                    }
                }
            }
            return result;
        } catch (error) {
            console.error("Invalid move:", error);
            return null;
        }
    }, [game, playerColor, getGameOverReason]);

    const handleNewGame = useCallback(() => {
        const newGame = new Chess();
        setGame(newGame);
        setFen(newGame.fen());
        setHistory([]);
        setGameOver({isGameOver: false, reason: ""});
        if(newGame.turn() === playerColor){
            setIsAITurn(false);
        } else {
            setIsAITurn(true);
        }
    }, [playerColor]);
    
    const handleDifficultyChange = useCallback(async (newDifficulty: Difficulty) => {
        setDifficulty(newDifficulty);
        await adjustAiDifficulty({ difficulty: newDifficulty });
        handleNewGame();
    }, [handleNewGame]);

    const handleSwitchSides = useCallback(() => {
        setPlayerColor(prev => {
            const newColor = prev === 'w' ? 'b' : 'w';
            const newGame = new Chess();
            setGame(newGame);
            setFen(newGame.fen());
            setHistory([]);
            setGameOver({isGameOver: false, reason: ""});
            if (newGame.turn() !== newColor) {
                setIsAITurn(true);
            } else {
                setIsAITurn(false);
            }
            return newColor;
        });
    }, []);

    useEffect(() => {
        if(isAITurn && !game.isGameOver() && game.turn() !== playerColor) {
            const getAIMove = async () => {
                try {
                  const aiMove = await aiOpponentMove({ boardState: game.fen(), difficulty });
                  if (aiMove) {
                      makeMove(aiMove);
                  }
                } catch(e) {
                  console.error("AI move failed", e);
                } finally {
                  setIsAITurn(false);
                }
            };
            const timer = setTimeout(getAIMove, 500);
            return () => clearTimeout(timer);
        }
    }, [isAITurn, game, difficulty, playerColor, makeMove]);

    return (
        <>
            <main className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
                <header className="text-center mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">ChessMate AI</h1>
                    <p className="text-muted-foreground mt-2">The ultimate chess challenge powered by GenAI</p>
                </header>
                
                <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3 w-full">
                        <Card className="shadow-lg bg-transparent">
                           <CardContent className="p-1 sm:p-2">
                                <Chessboard
                                    fen={fen}
                                    onMove={makeMove}
                                    orientation={boardOrientation}
                                    isInteractable={!isAITurn && !gameOver.isGameOver && game.turn() === playerColor}
                                />
                           </CardContent>
                        </Card>
                         {isAITurn && !gameOver.isGameOver && (
                            <div className="mt-4 text-center text-lg font-semibold text-accent animate-pulse">
                                AI is thinking...
                            </div>
                        )}
                    </div>
                    <div className="lg:w-1/3 w-full flex flex-col gap-8">
                        <GameControls 
                            onNewGame={handleNewGame}
                            onSwitchSides={handleSwitchSides}
                            difficulty={difficulty}
                            onDifficultyChange={handleDifficultyChange}
                            isAITurn={isAITurn || gameOver.isGameOver}
                        />
                        <MoveHistory history={history} />
                    </div>
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
