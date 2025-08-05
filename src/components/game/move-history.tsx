"use client";

import type { Move } from 'chess.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollAreaViewport } from '@/components/ui/scroll-area';
import { History } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface MoveHistoryProps {
    history: Move[];
}

export function MoveHistory({ history }: MoveHistoryProps) {
    const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaViewportRef.current) {
            scrollAreaViewportRef.current.scrollTop = scrollAreaViewportRef.current.scrollHeight;
        }
    }, [history]);

    const movePairs: { white: Move; black?: Move }[] = [];
    for (let i = 0; i < history.length; i += 2) {
        movePairs.push({
            white: history[i],
            black: history[i + 1],
        });
    }

    return (
        <Card className="shadow-lg flex-grow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="text-primary" />
                    Move History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 md:h-64">
                    <ScrollAreaViewport ref={scrollAreaViewportRef}>
                    {movePairs.length === 0 ? (
                        <p className="text-muted-foreground text-center pt-8">No moves yet.</p>
                    ) : (
                        <ol className="space-y-2 text-sm">
                            {movePairs.map((pair, index) => (
                                <li key={index} className="grid grid-cols-[auto_1fr_1fr] gap-x-4 items-center">
                                    <span className="font-bold text-muted-foreground">{index + 1}.</span>
                                    <span className="font-mono bg-secondary px-2 py-1 rounded-md text-center">{pair.white.san}</span>
                                    {pair.black && <span className="font-mono bg-secondary px-2 py-1 rounded-md text-center">{pair.black.san}</span>}
                                </li>
                            ))}
                        </ol>
                    )}
                    </ScrollAreaViewport>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
