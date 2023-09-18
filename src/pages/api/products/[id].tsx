import { dbConnect } from "@/lib/db";
import ProductModel, { type Product } from "@/models/product";
import status from "http-status";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product>,
) {
  await dbConnect();
  const id = req.query["id"] as string | undefined;
  if (!id) {
    res.status(status.BAD_REQUEST).end();
    return;
  }
  const product = await ProductModel.getById(id);
  if (product) {
    res.status(status.OK).json(product);
  } else {
    res.status(status.NOT_FOUND).end();
  }
}
