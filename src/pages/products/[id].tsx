import ProductCard from "@/components/productCard";
import type { Product } from "@/types/product";
import type { StylesObj } from "@/types/styles";
import { Box } from "@mui/material";
import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";

async function getProduct(productId: string) {
  const res = await axios.get<Product>(`/products/${productId}`);
  return res.data;
}

const styles = {
  productContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100vw",
    height: "100vh",
  },
} satisfies StylesObj;

export default function ProductDetails() {
  const router = useRouter();
  const productId = router.query["id"] as string;
  const { data } = useQuery({
    queryKey: ["products", productId],
    queryFn: () => getProduct(productId),
  });
  return data ? (
    <Box sx={styles.productContainer}>
      <ProductCard product={data} />
    </Box>
  ) : null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const productId = context.params?.["id"] as string | undefined;
  if (!productId) {
    throw new Error("this page requires product id");
  }
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(["products", productId], () =>
    getProduct(productId),
  );
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
