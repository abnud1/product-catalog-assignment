import { dbConnect } from "@/lib/db";
import type { Paginated } from "@/models/common";
import ProductModel, { type Product } from "@/models/product";
import status from "http-status";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Paginated<Product, "products">>,
) {
  await dbConnect();
  const products = await ProductModel.getProducts(
    req.query["cursor"] as string | undefined,
  );
  res.status(status.OK).json(products);
}
