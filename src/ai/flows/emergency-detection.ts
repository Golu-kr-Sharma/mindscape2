// src/ai/flows/emergency-detection.ts
'use server';

/**
 * @fileOverview A flow to detect emergency situations
 * based on user input and provide emergency helplines.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EmergencyDetectionInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input text to check for emergency keywords.'),
});

export type EmergencyDetectionInput = z.infer<
  typeof EmergencyDetectionInputSchema
>;

const EmergencyDetectionOutputSchema = z.object({
  emergencyDetected: z
    .boolean()
    .describe(
      'Whether an emergency situation is detected in the user input.'
    ),

  helplines: z.array(
    z.string().describe(
      'A list of emergency helpline numbers to display.'
    )
  ),
});

export type EmergencyDetectionOutput = z.infer<
  typeof EmergencyDetectionOutputSchema
>;

export async function detectEmergency(
  input: EmergencyDetectionInput
): Promise<EmergencyDetectionOutput> {
  return detectEmergencyFlow(input);
}

const emergencyDetectionPrompt = ai.definePrompt({
  name: 'emergencyDetectionPrompt',

  input: {
    schema: EmergencyDetectionInputSchema,
  },

  output: {
    schema: EmergencyDetectionOutputSchema,
  },

  prompt: `
You are a mental health support AI.

Your task is to analyze user input to detect:
- self-harm
- suicide risk
- immediate danger
- emergency situations

Respond ONLY in valid JSON format.

Rules:
- emergencyDetected = true if danger/self-harm/suicide is detected
- emergencyDetected = false otherwise

If emergencyDetected is true, include these helplines:
- Tele Mental Health: 14416 / 1-800-891-4416
- AASRA: 9152987821

If emergencyDetected is false:
- helplines must be an empty array

User Input:
{{{userInput}}}
`,
});

const detectEmergencyFlow = ai.defineFlow(
  {
    name: 'detectEmergencyFlow',

    inputSchema: EmergencyDetectionInputSchema,

    outputSchema: EmergencyDetectionOutputSchema,
  },

  async input => {
    try {
      // Check API key
      const key =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        '';

      if (
        !key ||
        key.includes('your_') ||
        key.includes('replace')
      ) {
        console.error('Gemini API key missing');

        return {
          emergencyDetected: false,
          helplines: [],
        };
      }

      // AI Prompt Execution
      const { output } = await emergencyDetectionPrompt(input);

      // Safe fallback if output undefined
      return (
        output || {
          emergencyDetected: false,
          helplines: [],
        }
      );
    } catch (error: any) {
      console.error('Gemini API Error:', error);

      // Handle Gemini 503 / overload safely
      return {
        emergencyDetected: false,
        helplines: [],
      };
    }
  }
);