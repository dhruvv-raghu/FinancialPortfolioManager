import fetch from 'node-fetch';

export async function GET(req) {
    try {
        // Fetch the news data from Alpha Vantage for general news
        const response = await fetch(
            `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
        );

        const newsData = await response.json();
        
        // Check if the response contains an error field
        if (newsData?.error) {
            return new Response(JSON.stringify({ error: 'Error fetching news' }), { status: 500 });
        }

        // Extract the relevant news snippets, taking the first 5
        const newsSnippets = newsData?.feed?.slice(0, 5).map((item) => ({
            title: item.title,
            description: item.summary,
            url: item.url,
        }));

        return new Response(JSON.stringify({ newsSnippets }), { status: 200 });
    } catch (error) {
        console.error('Error fetching news:', error);
        return new Response(JSON.stringify({ error: 'Error fetching news' }), { status: 500 });
    }
}
