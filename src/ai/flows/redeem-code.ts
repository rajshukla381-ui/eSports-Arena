'use server';

/**
 * @fileOverview A Genkit flow for redeeming a code for coins.
 *
 * - redeemCode - A function that handles the code redemption process.
 * - RedeemCodeInput - The input type for the redeemCode function.
 * - RedeemCodeOutput - The return type for the redeemCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RedeemCodeInputSchema = z.object({
  code: z.string().describe('The code to redeem.'),
});
export type RedeemCodeInput = z.infer<typeof RedeemCodeInputSchema>;

const RedeemCodeOutputSchema = z.object({
  success: z.boolean().describe('Whether or not the code was successfully redeemed.'),
  amount: z.number().describe('The amount of coins redeemed.'),
  message: z.string().describe('A message describing the result of the redemption.'),
});
export type RedeemCodeOutput = z.infer<typeof RedeemCodeOutputSchema>;


export async function redeemCode(input: RedeemCodeInput): Promise<RedeemCodeOutput> {
  return redeemCodeFlow(input);
}

const redeemCodeFlow = ai.defineFlow(
  {
    name: 'redeemCodeFlow',
    inputSchema: RedeemCodeInputSchema,
    outputSchema: RedeemCodeOutputSchema,
  },
  async (input) => {
    // This is a simulation. In a real app, you would check the code against a database.
    if (input.code === 'WINNER123') {
      return {
        success: true,
        amount: 500,
        message: 'Congratulations! You have redeemed 500 coins.',
      };
    } else {
      return {
        success: false,
        amount: 0,
        message: 'Invalid redeem code. Please try again.',
      };
    }
  }
);
