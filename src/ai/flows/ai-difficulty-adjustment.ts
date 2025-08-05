'use server';

/**
 * @fileOverview A Genkit flow for adjusting the AI opponent's difficulty in a chess game.
 *
 * - adjustAiDifficulty - A function that adjusts the AI difficulty.
 * - AdjustAiDifficultyInput - The input type for the adjustAiDifficulty function.
 * - AdjustAiDifficultyOutput - The return type for the adjustAiDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustAiDifficultyInputSchema = z.object({
  difficulty: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The desired difficulty level for the AI opponent.'),
});
export type AdjustAiDifficultyInput = z.infer<typeof AdjustAiDifficultyInputSchema>;

const AdjustAiDifficultyOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the difficulty adjustment was successful.'),
  message: z.string().describe('A message indicating the outcome of the adjustment.'),
});
export type AdjustAiDifficultyOutput = z.infer<typeof AdjustAiDifficultyOutputSchema>;

export async function adjustAiDifficulty(input: AdjustAiDifficultyInput): Promise<AdjustAiDifficultyOutput> {
  return adjustAiDifficultyFlow(input);
}

const adjustAiDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustAiDifficultyFlow',
    inputSchema: AdjustAiDifficultyInputSchema,
    outputSchema: AdjustAiDifficultyOutputSchema,
  },
  async input => {
    // Here, you would typically interact with a service or database to persist the
    // AI difficulty setting.
    // For this example, we'll just return a success message.

    //In a real chess game implementation, the difficulty adjustment
    //would involve modifying the parameters or strategy used by the AI opponent.

    return {
      success: true,
      message: `AI difficulty adjusted to ${input.difficulty}.`,
    };
  }
);
