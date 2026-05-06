async function manualHarvest() {
  const venues = [
    "The Crocodile Seattle", "Neumos Seattle", "The Showbox Seattle", 
    "Tractor Tavern Seattle", "Sunset Tavern Seattle", "Barboza Seattle", 
    "High Dive Seattle", "Nectar Lounge Seattle", "Dimitriou's Jazz Alley Seattle", 
    "The Triple Door Seattle"
  ];

  const bands = [
    "Thunderpussy Seattle", "Deep Sea Diver Seattle", "Naked Giants Seattle", 
    "The Black Tones Seattle", "Tacocat Seattle", "Chong the Nomad Seattle", 
    "Shaina Shepherd Seattle", "Parisalexa Seattle", "Acid Tongue Seattle"
  ];

  console.log("🛰️ Starting Manual Harvest Operation...");

  for (const v of venues) {
    console.log(`  - Harvesting Venue: ${v}`);
    await fetch("http://localhost:3000/api/venues/crawl", {
      method: "POST",
      body: JSON.stringify({ query: v }),
      headers: { "Content-Type": "application/json" }
    });
  }

  for (const b of bands) {
    console.log(`  - Harvesting Band: ${b}`);
    await fetch("http://localhost:3000/api/bands/crawl", {
      method: "POST",
      body: JSON.stringify({ query: b }),
      headers: { "Content-Type": "application/json" }
    });
  }

  console.log("✅ Manual Harvest Complete.");
}

manualHarvest();
