async function bulkHarvest(region: string) {
  console.log(`🛰️ Starting National Scouting Operation via Local API: ${region}`);

  // 1. Scout for targets (using internal logic, but we can just use the API)
  // Since we don't have a discover API that returns names easily without crawling,
  // I'll just use a hardcoded list for Seattle as a proof of concept, or try to call the scout API.
  
  try {
    const scoutRes = await fetch("http://localhost:3000/api/discovery/scout", {
      method: "POST",
      body: JSON.stringify({ region, type: "VENUE" }),
      headers: { "Content-Type": "application/json" }
    });
    const { targets: venues } = await scoutRes.json();

    console.log(`Found ${venues.length} venues. Harvesting via API...`);

    for (const venueName of venues) {
      console.log(`  - Harvesting: ${venueName}`);
      await fetch("http://localhost:3000/api/venues/crawl", {
        method: "POST",
        body: JSON.stringify({ query: venueName }),
        headers: { "Content-Type": "application/json" }
      });
    }

    const bandRes = await fetch("http://localhost:3000/api/discovery/scout", {
      method: "POST",
      body: JSON.stringify({ region, type: "BAND" }),
      headers: { "Content-Type": "application/json" }
    });
    const { targets: bands } = await bandRes.json();

    console.log(`Found ${bands.length} bands. Harvesting via API...`);

    for (const bandName of bands) {
      console.log(`  - Harvesting: ${bandName}`);
      await fetch("http://localhost:3000/api/bands/crawl", {
        method: "POST",
        body: JSON.stringify({ query: bandName }),
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log(`✅ Harvest complete for ${region}.`);
  } catch (error) {
    console.error("Harvest failed:", error);
  }
}

bulkHarvest("Seattle, WA");
