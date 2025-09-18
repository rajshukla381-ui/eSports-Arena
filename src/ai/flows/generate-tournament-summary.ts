
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a concise summary of tournament details and rules.
 *
 * - generateTournamentSummary - A function that takes tournament details as input and returns an AI-generated summary.
 * - GenerateTournamentSummaryInput - The input type for the generateTournamentSummary function.
 * - GenerateTournamentSummaryOutput - The return type for the generateTournamentSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTournamentSummaryInputSchema = z.object({
  title: z.string().describe('The title of the tournament.'),
  gameName: z.string().describe('The name of the game being played in the tournament (e.g., Free Fire, BGMI).'),
  prizePool: z.number().describe('The total prize pool for the tournament.'),
  host: z.string().describe('The host of the tournament.'),
  rules: z.string().describe('The rules of the tournament.'),
  matchTime: z.string().describe('The match time of the tournament.'),
});

export type GenerateTournamentSummaryInput = z.infer<
  typeof GenerateTournamentSummaryInputSchema
>;

const GenerateTournamentSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise AI-generated summary of the tournament details and rules.'),
});

export type GenerateTournamentSummaryOutput = z.infer<
  typeof GenerateTournamentSummaryOutputSchema
>;

export async function generateTournamentSummary(
  input: GenerateTournamentSummaryInput
): Promise<GenerateTournamentSummaryOutput> {
  return generateTournamentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTournamentSummaryPrompt',
  input: {schema: GenerateTournamentSummaryInputSchema},
  output: {schema: GenerateTournamentSummaryOutputSchema},
  prompt: `You are an AI assistant that generates concise summaries of esports tournaments.

  Given the following tournament details, create a brief and engaging summary that highlights the key information for potential players. The tournament is free to join.

  Tournament Title: {{{title}}}
  Game: {{{gameName}}}
  Prize Pool: {{{prizePool}}} Points
  Host: {{{host}}}
  Match Time: {{{matchTime}}}
  Rules: {{{rules}}}
  `,
});

const generateTournamentSummaryFlow = ai.defineFlow(
  {
    name: 'generateTournamentSummaryFlow',
    inputSchema: GenerateTournamentSummaryInputSchema,
    outputSchema: GenerateTournamentSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
