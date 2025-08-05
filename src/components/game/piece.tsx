import type { PieceSymbol, Color } from 'chess.js';
import { cn } from '@/lib/utils';

interface PieceProps extends React.HTMLAttributes<HTMLDivElement> {
  piece: {
    type: PieceSymbol;
    color: Color;
  };
  isDraggable: boolean;
}

const pieceUnicode: Record<string, string> = {
  'p': '♟︎', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
  'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
};

export function Piece({ piece, isDraggable, className, ...props }: PieceProps) {
  const { type, color } = piece;
  const pieceChar = color === 'w' ? type.toUpperCase() : type.toLowerCase();
  
  return (
    <div
      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
      className={cn(
        "w-full h-full flex items-center justify-center text-4xl sm:text-5xl md:text-6xl select-none",
        isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        color === 'w' ? 'text-primary-foreground' : 'text-primary',
        className
      )}
      draggable={isDraggable}
      {...props}
    >
      {pieceUnicode[pieceChar]}
    </div>
  );
}
