export default async function handler(req, res) {
    // Endast POST-förfrågningar tillåts när vi ska spara data
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metoden är inte tillåten. Använd POST.' });
    }

    // 1. Ta emot koden och lösenordet från HTML-filen
    const { adminPassword, appData } = req.body;

    // 2. Säkerhetskontroll PÅ SERVER-SIDAN
    // Eftersom denna fil är osynlig för användaren, är det mycket säkrare att kolla lösenordet här.
    if (adminPassword !== "crispadmin") {
        return res.status(401).json({ success: false, error: 'Nekad åtkomst: Fel administratörslösenord.' });
    }

    // 3. Hämta de hemliga variablerna
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    try {
        // 4. Skicka en säker förfrågan till databasen för att SPARA över nyckeln "crispFullData"
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            // Vi sparar hela din JSON-struktur som en enda stor sträng
            body: JSON.stringify(["SET", "crispFullData", JSON.stringify(appData)])
        });
        
        const upstashData = await response.json();

        if (upstashData.error) {
            throw new Error(upstashData.error);
        }

        res.status(200).json({ success: true, message: 'Data sparades i databasen!' });
    } catch (error) {
        console.error("Fel vid sparande till databas:", error);
        res.status(500).json({ success: false, error: 'Systemfel vid sparande av data.' });
    }
}
