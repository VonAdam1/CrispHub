export default async function handler(req, res) {
    // 1. Hämta de hemliga variablerna som Vercel skapade (från din skärmdump)
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
        return res.status(500).json({ success: false, error: 'Databas-uppgifter saknas i Vercel.' });
    }

    try {
        // 2. Skicka en säker förfrågan till databasen för att HÄMTA nyckeln "crispFullData"
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(["GET", "crispFullData"])
        });

        const upstashData = await response.json();
        
        // 3. Upstash returnerar data i form av en sträng, vi skickar den vidare till din app
        if (upstashData.result) {
            const parsedData = JSON.parse(upstashData.result);
            res.status(200).json({ success: true, data: parsedData });
        } else {
            // Om databasen är helt tom (första gången vi kör appen)
            res.status(200).json({ success: true, data: null });
        }

    } catch (error) {
        console.error("Fel vid hämtning från databas:", error);
        res.status(500).json({ success: false, error: 'Systemfel vid hämtning av data.' });
    }
}
