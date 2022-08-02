import * as borsh from "borsh";
import * as math from "./math";

// 1. Compute the account space size (bytes) based off our data struct (MathSum)
// NOTE We need to replicate our Rust struct/schema
// 1.1 Create a Class to mimic the struct
class MathSum {
  sum = 0;
  constructor(fields: { sum: number } | undefined = undefined) {
    if (fields) {
      this.sum = fields.sum;
    }
  }
}

// 1.2 Create a Map of the Class to convert into a struct
const MathSumSchema = new Map([
  [MathSum, { kind: "struct", fields: [["sum", "u32"]] }],
]);

// 1.3 Use Borsh to serialize and compute size in bytes (u8[].length)
// NOTE This is a serialized set of bytes that representation of our struct
const MATH_SUM_SIZE = borsh.serialize(MathSumSchema, new MathSum()).length;

async function main() {
  await math.runExample("sum", MATH_SUM_SIZE);
}

main().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);
