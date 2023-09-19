import { dbConnect } from "@/lib/db";
import type { Paginated } from "@/models/common";
import ProductModel, {
  type Product,
  type ProductQuery,
  type ProductsCursor,
} from "@/models/product";
import status from "http-status";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Paginated<Product, "products">>,
) {
  await dbConnect();
  const query = { ...req.query } as ProductQuery;
  if (req.query["cursor"]) {
    query.cursor = JSON.parse(req.query["cursor"] as string) as ProductsCursor;
  }
  const products = await ProductModel.getProducts(query);
  res.status(status.OK).json(products);
}
