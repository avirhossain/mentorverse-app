'use server';
/**
 * @fileOverview A flow for extracting a thumbnail URL from a given web page URL.
 *
 * - getThumbnailFromUrl - A function that takes a URL and returns a thumbnail image URL.
 * - ThumbnailInputSchema - The input type for the getThumbnailFromUrl function.
 * - ThumbnailOutputSchema - The return type for the getThumbnailFromUrl function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ThumbnailInputSchema = z.object({
  url: z.string().url().describe('The URL of the page to get a thumbnail for.'),
});

export const ThumbnailOutputSchema = z.object({
  thumbnailUrl: z.string().url().optional().describe('The URL of the thumbnail image.'),
});

export type ThumbnailInput = z.infer<typeof ThumbnailInputSchema>;
export type ThumbnailOutput = z.infer<typeof ThumbnailOutputSchema>;


/**
 * Extracts a thumbnail URL from a given web page URL.
 * Handles YouTube URLs specifically for higher quality thumbnails.
 * For other URLs, it fetches the page and looks for the og:image meta tag.
 * @param input The input object containing the URL.
 * @returns A promise that resolves to the thumbnail URL or an empty object.
 */
export async function getThumbnailFromUrl(input: ThumbnailInput): Promise<ThumbnailOutput> {
    return thumbnailFlow(input);
}


const thumbnailFlow = ai.defineFlow(
    {
        name: 'thumbnailFlow',
        inputSchema: ThumbnailInputSchema,
        outputSchema: ThumbnailOutputSchema,
    },
    async ({ url }) => {
        // 1. Handle YouTube URLs
        try {
            const youtubeUrl = new URL(url);
            if (youtubeUrl.hostname.includes('youtube.com') || youtubeUrl.hostname.includes('youtu.be')) {
                let videoId = youtubeUrl.searchParams.get('v');
                if (!videoId) {
                    const pathParts = youtubeUrl.pathname.split('/');
                    videoId = pathParts[pathParts.length - 1];
                }

                if (videoId) {
                    return { thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` };
                }
            }
        } catch (e) {
             // Not a valid URL, will proceed to generic fetch
        }

        // 2. Generic URL fetch and parse for og:image
        try {
            const response = await fetch(url, { headers: { 'User-Agent': 'Googlebot/2.1' } });
            if (!response.ok) {
                return {};
            }
            const text = await response.text();

            // Simple regex to find og:image content. Not a full parser.
            const match = text.match(/<meta\s+(?:property="og:image"|name="og:image")\s+content="([^"]+)"/);
            
            if (match && match[1]) {
                // Ensure the URL is absolute
                const thumbnailUrl = new URL(match[1], url).toString();
                return { thumbnailUrl };
            }
        } catch (error) {
            console.error(`Failed to fetch or parse URL ${url}:`, error);
            return {};
        }
        
        return {};
    }
);
