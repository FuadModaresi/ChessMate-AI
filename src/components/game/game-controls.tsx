import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { HardHat, Repeat, Swords, Users } from 'lucide-react';
import type { Difficulty } from '@/app/game-client';

interface GameControlsProps {
    onNewGame: () => void;
    onSwitchSides: () => void;
    difficulty: Difficulty;
    onDifficultyChange: (difficulty: Difficulty) => void;
    isAITurn: boolean;
}

export function GameControls({ onNewGame, onSwitchSides, difficulty, onDifficultyChange, isAITurn }: GameControlsProps) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HardHat className="text-primary" />
                    Game Controls
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <Button onClick={onNewGame} disabled={isAITurn}>
                        <Swords className="mr-2 h-4 w-4" /> New Game
                    </Button>
                    <Button variant="outline" onClick={onSwitchSides} disabled={isAITurn}>
                        <Users className="mr-2 h-4 w-4" /> Switch Sides
                    </Button>
                </div>
                <div>
                    <Label htmlFor="difficulty-select" className='pl-1'>AI Difficulty</Label>
                    <Select
                        value={difficulty}
                        onValueChange={(value) => onDifficultyChange(value as Difficulty)}
                        disabled={isAITurn}
                    >
                        <SelectTrigger id="difficulty-select" className="mt-1">
                            <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
