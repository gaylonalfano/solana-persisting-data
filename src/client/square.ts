import * as borsh from "borsh";
import * as math from "./math";

// 1. Compute the account space size (bytes) based off our data struct (MathSquare)
// NOTE We need to replicate our Rust struct/schema
// 1.1 Create a Class to mimic the struct
class MathSquare {
  square = 1;
  constructor(fields: { square: number } | undefined = undefined) {
    if (fields) {
      this.square = fields.square;
    }
  }
}

// 1.2 Create a Map of the Class to convert into a struct
const MathSquareSchema = new Map([
  [MathSquare, { kind: "struct", fields: [["square", "u32"]] }],
]);

// 1.3 Use Borsh to serialize and compute size in bytes (u8[].length)
// NOTE This is a serialized set of bytes that representation of our struct
const MATH_SQUARE_SIZE = borsh.serialize(
  MathSquareSchema,
  new MathSquare()
).length;

async function main() {
  await math.runExample("sum", MATH_SQUARE_SIZE);
}

main().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);
