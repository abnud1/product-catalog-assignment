import ProductCard from "@/components/productCard";
import { dbConnect } from "@/lib/db";
import ProductModel, { type Product } from "@/models/product";
import type { StylesObj } from "@/types/styles";
import { Box } from "@mui/material";
import mongoose from "mongoose";
import type { GetServerSideProps } from "next";

const styles = {
  productContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
  },
} satisfies StylesObj;
interface ProductDetailsProps {
  product: Product | null;
}
export default function ProductDetails({ product }: ProductDetailsProps) {
  return product ? (
    <Box sx={styles.productContainer}>
      <ProductCard product={product} />
    </Box>
  ) : (
    <>404 Not Found</>
  );
}

export const getServerSideProps: GetServerSideProps<
  ProductDetailsProps
> = async (context) => {
  const productId = context.params?.["id"] as string | undefined;
  if (!productId) {
    throw new Error("this page requires product id");
  }
  await dbConnect();
  try {
    const product = await ProductModel.getById(productId);
    return {
      props: {
        product: product ?? null,
      },
    };
  } catch (error) {
    if (error instanceof mongoose.MongooseError && error.name === "CastError") {
      return {
        props: {
          product: null,
        },
      };
    }
    throw error;
  }
};
