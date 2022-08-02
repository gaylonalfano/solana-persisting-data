// TODO Keep finishing this one up and reviewing the accounts
// NOTE I think it's best to think of the clientAccount
// as a DATA ACCOUNT... at least that's where I'm leaning lol
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createKeypairFromFile } from "./util";
import fs from "mz/fs";
import os from "os";
import path from "path";
import yaml from "yaml";

// NOTE This is basically a "Math" class that aligns with our
// MathSum and MathSquare structs in our programs

// 1. Get the keypair from our local config
const CONFIG_FILE_PATH = path.resolve(
  os.homedir(),
  ".config",
  "solana",
  "cli",
  "config.yml"
);

let connection: Connection;
let localKeypair: Keypair; // Wallet?
let programKeypair: Keypair;
let programId: PublicKey;
let clientPubKey: PublicKey;

// TODO Confirm the correct path after building with cargo build
// let PROGRAM_FILE_PATH = path.resolve(__dirname, "../../target");
let PROGRAM_FILE_PATH = path.resolve(__dirname, "../programs/square/target");

/*
 * Connect to cluster
 */
export async function connect() {
  connection = new Connection("http://localhost:8899", "confirmed");
  console.log("Successfully connected to Solana cluster");
}

/*
 * Use local keypair (account) for client
 */
export async function getLocalAccount() {
  const configYml = await fs.readFile(CONFIG_FILE_PATH, { encoding: "utf8" });
  const keypairPath = await yaml.parse(configYml).keypair_path;
  // NOTE localKeypair AKA wallet!
  localKeypair = await createKeypairFromFile(keypairPath);
  // NOTE Obviously can omit if not testing on devnet
  const airdropRequest = await connection.requestAirdrop(
    localKeypair.publicKey,
    LAMPORTS_PER_SOL * 2
  );
  await connection.confirmTransaction(airdropRequest);

  console.log("Local account loaded successfully.");
  console.log("Local account's address is:");
  console.log(`   ${localKeypair.publicKey}`);
}

/*
 * Get the targeted program we intend to transact with
 */
export async function getProgram(programName: string) {
  programKeypair = await createKeypairFromFile(
    path.join(PROGRAM_FILE_PATH, programName + "-keypair.json")
  );
  programId = programKeypair.publicKey;

  console.log(
    `We're going to transact with the ${programName.toUpperCase()} program.`
  );
  console.log("Its program ID is: ");
  console.log(`   ${programId.toBase58()}`);
}

/*
 * Configure the client account and make the program be the account owner
 * The client account stores the data!
 * The client account is the data account!
 * This account is going to hit our program, and the program is going to
 * change the state of this account!
 */
// Q: Are these client accounts simulating a dapp? So, when I go to
// stake my Fox, my connection has my Phantom wallet and then I hit
// the 'stake' button. Is the account OWNER of my NFT the FFF staking
// programId? Just trying to better understand.
// UPDATE: I think the client does simulate a dapp, HOWEVER, I DON'T
// think the FFF staking program is my NFT owner. Instead, I BELIEVE
// that my WALLET (keypair) is the NFT owner, and I'm signing permission
// via my wallet to allow the FFF staking program to interact with my
// NFT token account. Do I have this right?
export async function configureClientAccount(accountSpaceSize: number) {
  const SEED = "math";
  // NOTE By passing programId into createWithSeed(), this makes the
  // programId the OWNER of this account that we create! Recall that this
  // is required in order for the program to transact and modify this
  // account's data! (if account.owner != program_id in lib.rs)
  clientPubKey = await PublicKey.createWithSeed(
    localKeypair.publicKey,
    SEED,
    programId
  );

  console.log("For simplicity's sake, we've created an address using a seed.");
  console.log("The generated address is: ");
  console.log(`   ${clientPubKey.toBase58()}`);

  // Make sure the account doesn't exist already
  const clientAccount = await connection.getAccountInfo(clientPubKey);
  if (clientAccount === null) {
    console.log("Looks like that account does not exist. Let's create it.");

    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: localKeypair.publicKey,
        basePubkey: localKeypair.publicKey,
        seed: SEED,
        newAccountPubkey: clientPubKey,
        lamports: LAMPORTS_PER_SOL,
        space: accountSpaceSize,
        programId, // Owner of this new account
      })
    );

    await sendAndConfirmTransaction(connection, transaction, [localKeypair]);
    console.log("Client account created successfully.");
  } else {
    console.log(
      "Looks like that account exists alreay since we were able to derive the Pubkey with seeds and programId and then successfully found the account info by this Pubkey."
    );
  }
}

/*
 * Ping/transact with the program
 */
export async function pingProgram(programName: string) {
  console.log("Okay, let's run it.");
  console.log(`Pinging ${programName.toUpperCase()} program...`);

  const instruction = new TransactionInstruction({
    keys: [{ pubkey: clientPubKey, isSigner: false, isWritable: true }],
    programId,
    data: Buffer.alloc(0), // Empty instruction data
  });

  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [localKeypair] // Signers
  );

  console.log("Ping successful!");
}

/*
 * Run the example (essentially our main method)
 */
export async function runExample(
  programName: string,
  accountSpaceSize: number
) {
  await connect();
  await getLocalAccount();
  await getProgram(programName);
  await configureClientAccount(accountSpaceSize);
  await pingProgram(programName);
}
