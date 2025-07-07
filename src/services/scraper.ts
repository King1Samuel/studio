'use server';

// A simple function to fetch URL content.
export async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    // Return the raw HTML. The AI model is capable of parsing it.
    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error fetching URL content:', error);
    throw new Error('Could not retrieve content from the provided URL.');
  }
}
