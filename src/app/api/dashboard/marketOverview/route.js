import yahooFinance from 'yahoo-finance2';

export async function GET() {
    try {
        console.log('Fetching market overview...');
        
        const indices = ['^GSPC', '^IXIC', '^DJI']; // S&P 500, NASDAQ, Dow Jones

        // Fetch data for all symbols
        const marketData = await Promise.all(
            indices.map((symbol) => yahooFinance.quote(symbol)) // pass symbol directly
        );

        const marketOverview = marketData.map((data, index) => {
            const price = data.regularMarketPrice;
            const changePercent = data.regularMarketChangePercent;
            return {
                symbol: indices[index],
                price: price.toFixed(2),
                change: changePercent.toFixed(2),
            };
        });

        console.log('Market overview:', marketOverview);
        
        return new Response(JSON.stringify({ marketOverview }), { status: 200 });
    } catch (error) {
        console.error('Error fetching market overview:', error);
        return new Response(JSON.stringify({ error: 'Error fetching market overview' }), { status: 500 });
    }
}
