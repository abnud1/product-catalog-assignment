import { config } from "dotenv";
import { dbConnect, dbDisconnect } from "../lib/db";
import ProductModel from "./product";
import products from "./seed.json";
config({ path: ".env.development" });
async function insertProducts() {
  await dbConnect();
  await ProductModel.insertMany(products);
  await dbDisconnect();
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void insertProducts();
