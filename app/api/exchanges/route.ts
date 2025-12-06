export async function GET() {
  try {
    const res = await fetch('https://tokencanvas.io/api/coingecko/coins/ripple/tickers');
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}