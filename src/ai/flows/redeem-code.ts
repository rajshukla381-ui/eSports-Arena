
'use server';

/**
 * @fileOverview A Genkit flow for redeeming a code for coins.
 *
 * - redeemCode - A function that handles code redemption.
 * - RedeemCodeInput - The input type for the redeemCode function.
 * - RedeemCodeOutput - The return type for the redeemCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RedeemCodeInputSchema = z.object({
  code: z.string().describe('The redeem code entered by the user.'),
  userId: z.string().describe('The ID of the user redeeming the code.'),
});
export type RedeemCodeInput = z.infer<typeof RedeemCodeInputSchema>;

const RedeemCodeOutputSchema = z.object({
  success: z.boolean().describe('Whether the code was successfully redeemed.'),
  amount: z.number().optional().describe('The amount of coins awarded.'),
  message: z.string().optional().describe('A message to the user.'),
});
export type RedeemCodeOutput = z.infer<typeof RedeemCodeOutputSchema>;


// In a real app, you would look this up in a database.
const VALID_CODES: Record<string, { amount: number; usedBy: string[] }> = {
    'WINNER123': { amount: 500, usedBy: [] },
    'FREEBIE': { amount: 100, usedBy: [] },
    'BIGWIN': { amount: 1000, usedBy: [] },
};

export async function redeemCode(input: RedeemCodeInput): Promise<RedeemCodeOutput> {
  return redeemCodeFlow(input);
}

const redeemCodeFlow = ai.defineFlow(
  {
    name: 'redeemCodeFlow',
    inputSchema: RedeemCodeInputSchema,
    outputSchema: RedeemCodeOutputSchema,
  },
  async ({ code, userId }) => {
    const upperCaseCode = code.toUpperCase();
    
    if (VALID_CODES[upperCaseCode]) {
      const codeData = VALID_CODES[upperCaseCode];
      
      // In a real app, you'd persist this change.
      // For this simulation, we'll just check the in-memory object.
      if (codeData.usedBy.includes(userId)) {
        return {
          success: false,
          message: 'You have already used this code.',
        };
      }

      codeData.usedBy.push(userId);

      return {
        success: true,
        amount: codeData.amount,
        message: `Successfully redeemed ${codeData.amount} coins!`,
      };
    }

    return {
      success: false,
      message: 'The entered code is invalid or has expired.',
    };
  }
);
