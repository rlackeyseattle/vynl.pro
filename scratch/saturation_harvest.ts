async function saturateCircuit() {
  const regions = [
    "Austin, TX", "Nashville, TN", "Seattle, WA", "New Orleans, LA", 
    "Portland, OR", "Denver, CO", "Atlanta, GA", "Chicago, IL",
    "San Francisco, CA", "Las Vegas, NV", "Miami, FL", "Brooklyn, NY"
  ];

  const categories = ["BAND", "STUDIO", "REHEARSAL", "SHOP", "VENUE"];

  console.log(`🚀 SATURATION MODE INITIATED: SYNCING 12 NATIONAL HUBS`);

  for (const region of regions) {
    console.log(`\n📍 SYNCING REGION: ${region}`);
    
    for (const type of categories) {
      try {
        console.log(`   - Stage Scout: Finding ${type}s...`);
        const scoutRes = await fetch("http://localhost:3000/api/discovery/scout", {
          method: "POST",
          body: JSON.stringify({ region, type }),
          headers: { "Content-Type": "application/json" }
        });
        const { targets } = await scoutRes.json();

        if (!targets || targets.length === 0) {
          console.log(`   - No ${type}s discovered in this region.`);
          continue;
        }

        console.log(`   - Found ${targets.length} opportunities. Injecting...`);

        let endpoint = "/api/venues/crawl";
        if (type === "BAND") endpoint = "/api/bands/crawl";
        if (["STUDIO", "REHEARSAL", "SHOP"].includes(type)) endpoint = "/api/resources/crawl";

        for (const name of targets.slice(0, 5)) { // Aggressive limit to prevent timeouts, moving fast
          console.log(`     [${type}] Syncing: ${name}`);
          await fetch(`http://localhost:3000${endpoint}`, {
            method: "POST",
            body: JSON.stringify({ query: `${name} ${region}`, type }),
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (e) {
        console.error(`   ❌ Failed to sync ${type}s in ${region}`);
      }
    }
  }

  console.log("\n✅ SATURATION SWEEP COMPLETE.");
}

saturateCircuit();
