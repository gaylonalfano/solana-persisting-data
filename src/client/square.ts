import * as borsh from "borsh";
import * as math from "./math";

// 1. Compute the account space size (bytes) based off our data struct (MathSquare)
// NOTE We need to replicate our Rust struct/schema
// 1.1 Create a Class to mimic the struct
class MathSquare {
  // NOTE Setting default value here DOES NOTHING! The only way I've
  // set default is using if/else inside the actual program lib.rs!
  square = 2;
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
  await math.runExample("square", MATH_SQUARE_SIZE);
}

main().then(
  () => process.exit(),
  (err) => {
    console.error(err);
    process.exit(-1);
  }
);
