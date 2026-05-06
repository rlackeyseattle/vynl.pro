async function nationwideHarvest() {
  const cities = [
    "New York City, NY",
    "Los Angeles, CA",
    "Nashville, TN",
    "Austin, TX",
    "New Orleans, LA",
    "Chicago, IL",
    "Portland, OR",
    "Denver, CO",
    "Atlanta, GA",
    "Philadelphia, PA",
    "Seattle, WA",
    "San Francisco, CA",
    "Miami, FL",
    "Dallas, TX",
    "Boston, MA"
  ];

  const types = ["VENUE", "BAND", "STUDIO", "REHEARSAL", "SHOP"];

  console.log(`🌎 2026 GLOBAL INFRASTRUCTURE HARVEST INITIATED`);
  console.log(`Targeting 10,000 Venues across high-density hubs.`);

  for (const city of cities) {
    console.log(`\n📍 PROCESSING HUB: ${city}`);
    
    for (const type of types) {
      try {
        console.log(`   - Scouting ${type}s in ${city}...`);
        
        const scoutRes = await fetch("http://localhost:3000/api/discovery/scout", {
          method: "POST",
          body: JSON.stringify({ region: city, type }),
          headers: { "Content-Type": "application/json" }
        });
        const { targets } = await scoutRes.json();

        if (!targets || targets.length === 0) continue;

        console.log(`     Found ${targets.length} ${type}s. Harvesting...`);

        let endpoint = "/api/venues/crawl";
        if (type === "BAND") endpoint = "/api/bands/crawl";
        if (["STUDIO", "REHEARSAL", "SHOP"].includes(type)) endpoint = "/api/resources/crawl";

        for (const name of targets) {
          console.log(`     [${type}] Harvesting: ${name}`);
          await fetch(`http://localhost:3000${endpoint}`, {
            method: "POST",
            body: JSON.stringify({ query: `${name} ${city}`, type }),
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (error) {
        console.error(`   ❌ Failed to process ${type}s in ${city}`);
      }
    }
  }

  console.log("\n✅ GLOBAL HARVEST COMPLETE.");
}

nationwideHarvest();
