
/**
 * Searches the Musipedia API for a musical piece.
 * Note: This service has been updated to use Musipedia instead of Peachnote.
 * @param title The title of the piece.
 * @param composer The composer of the piece.
 * @returns A promise that resolves to an object with midiUrl and scoreUrl, or null if not found.
 */
export const searchMusipedia = async (title: string, composer: string): Promise<{ midiUrl?: string; scoreUrl?: string } | null> => {
    if (!title || !composer) return null;

    const composerLastName = composer.split(/[\s.]+/).pop() || '';
    // Clean up title to improve search recall, removing catalogue numbers.
    const cleanTitle = title.replace(/BWV\s*\d+[a-z]?/i, '').replace(/,?\s*Op\.\s*\d+/i, '').trim();

    const requestPayload = {
        query: `composer:"${composerLastName}" title:"${cleanTitle.replace(/"/g, '')}"`,
        type: 'text',
        from: 0,
        to: 1
    };
    const jsonpQuery = JSON.stringify(requestPayload);

    const targetUrl = `https://www.musipedia.org/js_search.mmp?request=${encodeURIComponent(jsonpQuery)}`;

    // Using a CORS proxy to bypass browser's same-origin policy.
    // Switched to thingproxy.freeboard.io for better reliability.
    const proxyUrl = `https://thingproxy.freeboard.io/fetch/${targetUrl}`;

    let musipediaResponseText: string | null = null;
    try {
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            console.warn(`CORS proxy request to Musipedia failed: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.warn("Proxy error response body:", errorText);
            return null;
        }

        musipediaResponseText = await response.text();

        if (!musipediaResponseText) {
            console.warn("Proxy response was empty.");
            return null;
        }

        // Strip JSONP padding: search_result(...)
        const jsonpRegex = /^search_result\((.*)\);?$/s;
        const match = musipediaResponseText.match(jsonpRegex);

        let jsonText: string;
        if (match && match[1]) {
            jsonText = match[1];
        } else {
            // It could be an error message or already JSON. Let JSON.parse handle it.
            jsonText = musipediaResponseText;
        }

        const data = JSON.parse(jsonText);

        if (data && data.items && data.items.length > 0) {
            const firstResult = data.items[0];
            const baseUrl = "https://www.musipedia.org";

            const resolveUrl = (relativeUrl: string | undefined): string | undefined => {
                if (!relativeUrl) return undefined;
                if (relativeUrl.startsWith('http')) return relativeUrl;
                return `${baseUrl}/${relativeUrl.replace(/^\//, '')}`;
            }

            return {
                midiUrl: resolveUrl(firstResult.midifileurl),
                // The 'url' field from Musipedia links to a page, not a direct PDF.
                // The 'pdfurl' field sometimes exists and is preferable.
                scoreUrl: resolveUrl(firstResult.pdfurl) || resolveUrl(firstResult.url),
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching or parsing data from Musipedia API via proxy:", error);
        if (musipediaResponseText) {
          // This will help debug if the response was not what we expected (e.g. HTML from Musipedia itself)
          console.error("Raw text from proxy:", musipediaResponseText);
        }
        return null;
    }
};
