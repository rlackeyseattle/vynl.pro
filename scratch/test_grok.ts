import * as dotenv from "dotenv";
import { callGrok } from "../src/lib/xai";

dotenv.config();

async function testGrok() {
  try {
    console.log("Testing Grok API...");
    const result = await callGrok("List 3 music venues in Austin, TX. Return as a JSON array of strings.");
    console.log("Result:", result);
  } catch (e) {
    console.error("Grok Test Failed:", e);
  }
}

testGrok();
