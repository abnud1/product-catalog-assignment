import mongoose from "mongoose";
import type { Paginated } from "../common";
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}
interface ProductModelType extends mongoose.Model<Product> {
  getProducts(cursor?: string): Promise<Paginated<Product, "products">>;
  getById(id: string): Promise<Product | undefined>;
}
const ProductSchema = new mongoose.Schema<Product>(
  {
    name: {
      type: String,
      index: true,
      unique: true,
    },
    price: {
      type: Number,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    statics: {
      async getProducts(cursor?: string) {
        const totalRecords = await this.countDocuments();
        const productDocs = await this.find(
          cursor
            ? {
                _id: { $gt: cursor },
              }
            : {},
        )
          .sort({ _id: 1 })
          .limit(Number(process.env["PAGINATION_LIMIT"] ?? "15"));
        return {
          products: productDocs.map((doc) => doc.toJSON()),
          totalRecords,
          nextCursor: productDocs.at(-1)?.id as string | undefined,
        };
      },
      async getById(id: string) {
        const productDoc = await this.findById(id);
        return productDoc?.toJSON();
      },
    },
    toJSON: {
      transform(doc, ret) {
        ret["id"] = doc._id.toString();
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete ret["_id"];
        return ret;
      },
    },
  },
);
const ProductModel = mongoose.modelNames().includes("ProductModel")
  ? (mongoose.models["ProductModel"] as ProductModelType)
  : mongoose.model<Product, ProductModelType>("ProductModel", ProductSchema);

export default ProductModel;
