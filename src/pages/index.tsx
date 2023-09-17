import ProductCard from "@/components/productCard";
import type { Product } from "@/types/product";
import { Grid } from "@mui/material";
import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { GetServerSideProps } from "next";
import Link from "next/link";
async function getProducts() {
  const res = await axios.get<Product[]>("products");
  return res.data;
}
export default function ProductsCatalog() {
  const { data } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  return (
    <Grid container gap={4}>
      {data?.map((product) => (
        <Link
          style={{ textDecoration: "none" }}
          key={product.id}
          href={`/products/${product.id}`}
        >
          <ProductCard product={product} />
        </Link>
      ))}
    </Grid>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(["products"], getProducts);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
