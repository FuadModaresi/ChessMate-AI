
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating chess moves by an AI opponent.
 *
 * - aiOpponentMove - A function that takes the current board state and difficulty level and returns a chess move in UCI notation.
 * - AiOpponentMoveInput - The input type for the aiOpponentMove function.
 * - AiOpponentMoveOutput - The return type for the aiOpponentMove function, representing a chess move in UCI notation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Chess} from 'chess.js';

const AiOpponentMoveInputSchema = z.object({
  boardState: z.string().describe('The current state of the chess board in FEN notation.'),
  difficulty: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The difficulty level of the AI opponent.'),
});
export type AiOpponentMoveInput = z.infer<typeof AiOpponentMoveInputSchema>;

const AiOpponentMoveOutputSchema = z.object({
  bestMove: z.string().describe('The best chess move for the current player in UCI notation.'),
  validMoves: z.array(z.string()).describe('A list of all valid moves for the current player in UCI notation.'),
});
export type AiOpponentMoveOutput = z.infer<typeof AiOpponentMoveOutputSchema>;

export async function aiOpponentMove(input: AiOpponentMoveInput): Promise<AiOpponentMoveOutput> {
  return aiOpponentMoveFlow(input);
}

const aiOpponentMovePrompt = ai.definePrompt({
  name: 'aiOpponentMovePrompt',
  input: {schema: AiOpponentMoveInputSchema},
  output: {
    schema: AiOpponentMoveOutputSchema,
  },
  prompt: `You are a world-class chess AI, playing as the black pieces against a human opponent. Your goal is to win the game by playing strategically and tactically sound moves.

The current board state in FEN notation is: "{{{boardState}}}"

**Difficulty: {{difficulty}}**

**Thinking Process:**

**1. Strategic Analysis (Internal Monologue):**
*   **Material Advantage:** Who is ahead in material? By how much?
*   **Positional Advantage:** Who controls the center? Whose pieces are more active? Are there any strong outposts or open files to exploit?
*   **King Safety:** How safe is my king? How safe is the opponent's king? Are there any immediate threats or potential attacks?
*   **Opponent's Threats:** What is the opponent's most likely plan or threat? I must respond to it.
*   **My Plan:** Based on the above, what is my long-term goal? (e.g., attack the king, win material, improve my pawn structure).

**2. Move Selection (Based on Difficulty):**
Now, based on your analysis and the selected difficulty, choose the best move.

{{#if (eq difficulty "Beginner")}}
*   **Strategy:** Focus on fundamental principles. Make safe moves that don't lose pieces. Develop your pieces (bring them out to useful squares). Castle your king to safety.
*   **Move Selection:** Identify all your legal moves. From that list, pick a simple, safe, and useful developing move. Avoid moves that put your king in danger or lose material for no reason.
{{/if}}

{{#if (eq difficulty "Intermediate")}}
*   **Strategy:** Think 2-3 moves ahead. Control the center of the board. Look for simple tactics like forks, pins, and skewers. Create threats to your opponent's pieces. Improve the position of your worst-placed piece.
*   **Move Selection:** Identify all legal moves. Evaluate the top 3-5 candidate moves based on how they improve your position, create threats, or respond to the opponent's plans. Consider the immediate consequences of each move.
{{/if}}

{{#if (eq difficulty "Advanced")}}
*   **Strategy:** You are a chess grandmaster. Your goal is to out-maneuver your opponent positionally and tactically. Formulate a long-term plan based on the pawn structure and piece imbalances. Calculate variations accurately. Provoke weaknesses in the opponent's position and exploit them. Set up complex tactical combinations.
*   **Move Selection:** Do a deep analysis of all legal moves. Identify several candidate moves and evaluate them based on your strategic analysis. Choose the move that offers the best combination of safety, activity, and long-term potential, even if it involves a temporary sacrifice for a larger gain.
{{/if}}

**Instructions:**
1.  First, generate a list of ALL valid moves for black in standard UCI notation (e.g., "e2e4", "g1f3", "a7a8q" for promotion).
2.  Based on the strategy for your difficulty level, analyze the position and determine the single best strategic move from the list of valid moves.
3.  You MUST provide your response in the requested JSON format. The \`bestMove\` field must contain your chosen move, and it must be a valid move from the \`validMoves\` list.

If you cannot determine a move for any reason, return an empty string for bestMove and an empty array for validMoves.
`,
});

const aiOpponentMoveFlow = ai.defineFlow(
  {
    name: 'aiOpponentMoveFlow',
    inputSchema: AiOpponentMoveInputSchema,
    outputSchema: AiOpponentMoveOutputSchema,
  },
  async input => {
    try {
      const game = new Chess(input.boardState);
      const validMoves = game.moves({ verbose: false });

      if (validMoves.length === 0) {
        return { bestMove: '', validMoves: [] };
      }
      
      const {output} = await aiOpponentMovePrompt(input);

      if (output && output.bestMove && validMoves.includes(output.bestMove)) {
        // Ensure the returned bestMove is actually valid
        return output;
      }
      
      // Fallback if AI fails or returns an invalid "best" move
      // If the AI provided a list of valid moves, use the first one from that.
      if (output && output.validMoves && output.validMoves.length > 0) {
        for (const move of output.validMoves) {
            if (validMoves.includes(move)) {
                return { bestMove: move, validMoves };
            }
        }
      }
      
      // If all else fails, use a locally generated valid move.
      return { bestMove: validMoves[0], validMoves: validMoves };

    } catch (error) {
      console.error('Error in aiOpponentMoveFlow:', error);
      // In case of a catastrophic error, try to generate moves locally.
      try {
        const game = new Chess(input.boardState);
        const moves = game.moves({verbose: false});
        if (moves.length > 0) {
          return { bestMove: moves[0], validMoves: moves };
        }
      } catch (e) {
        console.error('Error in fallback move generation:', e)
      }

      return { bestMove: '', validMoves: [] };
    }
  }
);
