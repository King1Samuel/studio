'use server';

// A simple function to fetch and naively strip HTML.
export async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();
    // This is a very basic way to clean up HTML.
    // It removes style tags, then all other tags, then cleans up whitespace.
    // We are no longer removing script tags, as some sites embed job data in them.
    const noStyles = html.replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      ''
    );
    const plainText = noStyles.replace(/<[^>]+>/g, ' ');
    return plainText.replace(/\s\s+/g, ' ').trim();
  } catch (error) {
    console.error('Error fetching URL content:', error);
    throw new Error('Could not retrieve content from the provided URL.');
  }
}
