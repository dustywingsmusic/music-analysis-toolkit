
/**
 * Searches the Peachnote API for a musical piece.
 * @param title The title of the piece.
 * @param composer The composer of the piece.
 * @returns A promise that resolves to an object with midiUrl and scoreUrl, or null if not found.
 */
export const searchPeachnote = async (title: string, composer: string): Promise<{ midiUrl?: string; scoreUrl?: string } | null> => {
    if (!title || !composer) return null;

    const composerLastName = composer.split(/[\s.]+/).pop() || '';
    // Clean up title to improve search recall, removing catalogue numbers.
    const cleanTitle = title.replace(/BWV\s*\d+[a-z]?/i, '').replace(/,?\s*Op\.\s*\d+/i, '').trim();
    const query = `composer:${composerLastName} title:"${cleanTitle.replace(/"/g, '')}"`;
    const targetUrl = `https://www.peachnote.com/rest/api/v2/search?q=${encodeURIComponent(query)}&s=0&n=1`;

    // Using a different CORS proxy that passes responses directly.
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            console.warn(`CORS proxy request to Peachnote failed: ${response.status} ${response.statusText}`);
            return null;
        }

        // corsproxy.io passes the JSON response directly.
        const data = await response.json();

        if (data && data.results && data.results.length > 0) {
            const firstResult = data.results[0];
            const baseUrl = "https://www.peachnote.com";

            const resolveUrl = (relativeUrl: string | undefined): string | undefined => {
                if (!relativeUrl) return undefined;
                if (relativeUrl.startsWith('http')) return relativeUrl;
                return `${baseUrl}${relativeUrl}`;
            }

            return {
                midiUrl: resolveUrl(firstResult.midi_url),
                scoreUrl: resolveUrl(firstResult.pdf_url),
            };
        }
        return null;
    } catch (error) {
        // This will catch both network errors (like "Failed to fetch") and JSON parsing errors.
        console.error("Error fetching or parsing data from Peachnote API via proxy:", error);
        return null;
    }
};
