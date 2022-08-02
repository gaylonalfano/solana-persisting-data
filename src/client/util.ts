import { Keypair } from "@solana/web3.js";
import fs from "mz/fs";

export async function createKeypairFromFile(
  filepath: string
): Promise<Keypair> {
  console.log("Creating Web3 Keypair from JSON file using filepath: ");
  console.log(`   ${filepath}`);
  // Takes a filepath to a JSON keypair and convert into Keypair object
  const secretKeyString = await fs.readFile(filepath, { encoding: "utf8" });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}
