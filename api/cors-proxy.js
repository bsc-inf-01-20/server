// api/cors-proxy.js
export default async function handler(req, res) {
  const { lat, lng, radius, query } = req.query;

  // Debug Log
  console.log("Incoming request to proxy:", req.query);

  const targetUrl = `https://server-nu-peach.vercel.app/api/places/search?lat=${lat}&lng=${lng}&radius=${radius}&query=${query}`;
  console.log("Target URL:", targetUrl);

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Error fetching data from the target API.' });
  }
}
