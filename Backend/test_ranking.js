const { getGlobalRankings } = require("./src/services/ranking.service");

async function test() {
  try {
    console.log("Fetching global rankings...");
    const rankings = await getGlobalRankings();
    console.log(`Successfully fetched rankings for ${rankings.size} colleges.`);
    
    // Print top 3
    let count = 0;
    for (const [id, data] of rankings.entries()) {
      if (count < 3) {
        console.log(`Rank #${data.overallRank}: College ID ${id} | Score: ${data.score} | Avg Rank: ${data.avgRank} | Best Rank: ${data.bestRank} | Branches: ${data.branchCount}`);
      }
      count++;
    }
  } catch (error) {
    console.error("Error fetching rankings:", error);
  } finally {
    process.exit(0);
  }
}

test();
