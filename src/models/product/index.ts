import mongoose, { type SortOrder } from "mongoose";
import { sortToNumber, type Paginated } from "../common";
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}
export type ProductsCursor = string | [string, number | string];

export interface ProductQuery {
  cursor?: ProductsCursor;
  name?: string;
  orderBy?: "name" | "price";
  orderBySort?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
interface ProductModelType extends mongoose.Model<Product> {
  getProducts(query?: ProductQuery): Promise<Paginated<Product, "products">>;
  getById(id: string): Promise<Product | undefined>;
}
function getNextCursor(
  products: (mongoose.Document<unknown, unknown, Product> &
    Product & { _id: mongoose.Types.ObjectId })[],
  orderBy?: "price" | "name",
): string | [string, string | number] | undefined {
  const lastProduct = products.at(-1);
  if (lastProduct) {
    return orderBy
      ? [lastProduct.id as string, lastProduct[orderBy]]
      : (lastProduct.id as string);
  }
  return undefined;
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
      async getProducts(query?: ProductQuery) {
        const totalRecords = await this.countDocuments();
        const findQuery: mongoose.FilterQuery<Product> = {};
        if (query?.search) {
          findQuery.$and = [
            {
              $or: [
                { name: { $regex: new RegExp(query.search) } },
                { description: { $regex: new RegExp(query.search) } },
              ],
            },
          ];
        }
        if (query?.cursor) {
          const cursorQuery =
            Array.isArray(query.cursor) && query.orderBy
              ? {
                  [query.orderBy]:
                    query.orderBySort === "desc"
                      ? { $lt: query.cursor[1] }
                      : { $gt: query.cursor[1] },
                  _id: { $not: { $eq: query.cursor[0] } },
                }
              : Array.isArray(query.cursor)
              ? undefined
              : { _id: { $gt: query.cursor } };
          if (cursorQuery) {
            if (findQuery.$and) {
              findQuery.$and.push(cursorQuery);
            } else {
              for (const [key, value] of Object.entries(cursorQuery)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                findQuery[key] = value;
              }
            }
          }
        }
        if (query?.name) {
          findQuery.name = { $regex: new RegExp(query.name) };
        }
        if (query?.minPrice) {
          if (findQuery.$and) {
            findQuery.$and.push({ price: { $gte: query.minPrice } });
          } else {
            findQuery.price = { $gte: query.minPrice };
          }
        }
        if (query?.maxPrice) {
          if (findQuery.$and) {
            const priceQuery = findQuery.$and.find(
              (q) => q.price !== undefined,
            );
            if (priceQuery) {
              priceQuery["$lte"] = query.maxPrice;
            } else {
              findQuery.$and.push({ price: { $lte: query.maxPrice } });
            }
          } else if (findQuery.price) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            findQuery.price.$lte = query.maxPrice;
          } else {
            findQuery.price = { $lte: query.maxPrice };
          }
        }

        const sortQuery = query?.orderBy
          ? {
              [query.orderBy]: sortToNumber(query.orderBySort),
              _id: sortToNumber(query.orderBySort),
            }
          : { _id: 1 };
        const productDocs = await this.find(findQuery)
          .sort(sortQuery as Record<string, SortOrder>)
          .limit(Number(process.env["PAGINATION_LIMIT"] ?? "15"));
        return {
          products: productDocs.map((doc) => doc.toJSON()),
          totalRecords,
          nextCursor: getNextCursor(productDocs, query?.orderBy),
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
