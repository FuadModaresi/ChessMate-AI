"use client";

import { useState } from 'react';
import { Chess, type Square, type Piece as ChessPieceType } from 'chess.js';
import { Piece } from './piece';
import { cn } from '@/lib/utils';

interface ChessboardProps {
    fen: string;
    onMove: (move: { from: Square, to: Square, promotion?: string }) => void;
    orientation: 'white' | 'black';
    isInteractable: boolean;
}

const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function Chessboard({ fen, onMove, orientation, isInteractable }: ChessboardProps) {
    const [draggedPiece, setDraggedPiece] = useState<{ from: Square } | null>(null);
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    
    const game = new Chess(fen);
    const board = game.board();

    const handleDragStart = (from: Square) => {
        if (!isInteractable) return;
        setDraggedPiece({ from });
        setSelectedSquare(null); // Clear selection on drag
    };

    const handleDrop = (to: Square) => {
        if (draggedPiece && draggedPiece.from !== to) {
            onMove({ from: draggedPiece.from, to });
        }
        setDraggedPiece(null);
    };

    const handleSquareClick = (square: Square) => {
        if (!isInteractable) return;

        if (selectedSquare) {
            if (selectedSquare === square) {
                // Deselect if clicking the same square
                setSelectedSquare(null);
                return;
            }
            // This is the 'to' square
            onMove({ from: selectedSquare, to: square });
            setSelectedSquare(null);
        } else {
            const piece = game.get(square);
            // This is the 'from' square
            // Only allow selecting pieces of the current turn's color
            if (piece && piece.color === game.turn()) {
                setSelectedSquare(square);
            }
        }
    };
    
    const viewRanks = orientation === 'white' ? ranks : [...ranks].reverse();
    const viewFiles = orientation === 'white' ? files : [...files].reverse();
    
    return (
        <div className="relative" style={{ paddingBottom: '1.5rem', paddingLeft: '1.5rem' }}>
            <div className="aspect-square w-full grid grid-cols-8 grid-rows-8 border-2 border-primary/20 shadow-inner rounded-md overflow-hidden">
                {viewRanks.flatMap((rank) =>
                    viewFiles.map((file) => {
                        const square = (file + rank) as Square;
                        const piece = board[ranks.indexOf(rank)][files.indexOf(file)];
                        const rankIndex = ranks.indexOf(rank);
                        const fileIndex = files.indexOf(file);
                        const isLight = (rankIndex + fileIndex) % 2 !== 0;

                        return (
                            <div
                                key={square}
                                className={cn(
                                    "flex justify-center items-center relative transition-colors duration-200 cursor-pointer",
                                    isLight ? "bg-primary/80" : "bg-secondary",
                                    selectedSquare === square && "bg-accent/70",
                                    draggedPiece && draggedPiece.from === square && "bg-accent/50",
                                    draggedPiece && draggedPiece.from !== square && "hover:bg-accent/30"
                                )}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(square)}
                                onClick={() => handleSquareClick(square)}
                            >
                                {piece && (
                                    <Piece
                                        piece={piece}
                                        isDraggable={isInteractable && piece.color === game.turn()}
                                        onDragStart={() => handleDragStart(square)}
                                        onDragEnd={() => setDraggedPiece(null)}
                                        className={cn(draggedPiece && draggedPiece.from === square && "opacity-50")}
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
             <div className="absolute top-0 bottom-[1.5rem] left-0 w-[1.5rem] flex flex-col-reverse justify-around items-center text-primary/70 font-bold text-sm pointer-events-none">
                {viewRanks.map(rank => <span key={`rank-${rank}`}>{rank}</span>)}
            </div>
            <div className="absolute bottom-0 left-[1.5rem] right-0 h-[1.5rem] flex justify-around items-center text-primary/70 font-bold text-sm pointer-events-none">
                {viewFiles.map(file => <span key={`file-${file}`}>{file}</span>)}
            </div>
        </div>
    );
}
