import ProductCard, { cardHeight, cardWidth } from "@/components/productCard";
import { dbConnect } from "@/lib/db";
import type { Paginated } from "@/models/common";
import ProductModel, { type Product } from "@/models/product";
import type { StylesObj } from "@/types/styles";
import { Box } from "@mui/material";
import {
  QueryClient,
  dehydrate,
  useInfiniteQuery,
  type DehydratedState,
  type QueryFunctionContext,
  type QueryKey,
} from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import axios from "axios";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import Nullify from "nullify-undefined/dist/cjs/index";
import React, { useEffect, useRef } from "react";
async function getProducts({
  pageParam,
}: QueryFunctionContext<QueryKey, string | undefined>) {
  const res = await axios.get<Paginated<Product, "products">>(
    `products${pageParam ? `?cursor=${pageParam}` : ""}`,
  );
  return res.data;
}

const styles = {
  container: {
    height: "100%",
    width: "100%",
  },
} satisfies StylesObj;

export default function ProductsCatalog() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["products"],
      queryFn: getProducts,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: undefined,
    });
  const allProducts = data ? data.pages.flatMap((d) => d.products) : [];
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useWindowVirtualizer({
    count: Math.ceil(
      (hasNextPage ? allProducts.length + 1 : allProducts.length) / 6,
    ),
    estimateSize: () => cardHeight,
  });

  const columnVirtualizer = useWindowVirtualizer({
    horizontal: true,
    count: 6,
    estimateSize: () => cardWidth,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualColumns = columnVirtualizer.getVirtualItems();
  useEffect(() => {
    const [lastRow] = [...virtualRows].reverse();
    const [lastColumn] = [...virtualColumns].reverse();
    if (!lastRow || !lastColumn) {
      return;
    }
    const lastItemIndex =
      lastRow.index * virtualColumns.length + lastColumn.index;
    if (
      lastItemIndex >= allProducts.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    fetchNextPage,
    isFetchingNextPage,
    allProducts.length,
    hasNextPage,
    virtualRows,
    virtualColumns,
  ]);
  return (
    <Box ref={parentRef} sx={styles.container}>
      {!data?.pages[0] || data.pages[0].totalRecords === 0 ? (
        "No Products"
      ) : (
        <Box
          sx={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: `${columnVirtualizer.getTotalSize()}px`,
            position: "relative",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {virtualRows.map((virtualRow) => (
            <React.Fragment key={virtualRow.index}>
              {virtualColumns.map((virtualColumn) => {
                const productIndex =
                  virtualColumns.length * virtualRow.index +
                  virtualColumn.index;
                const product = allProducts[productIndex];
                const isLoaderCell = productIndex > allProducts.length - 1;
                return isLoaderCell ? (
                  "Loading More"
                ) : product ? (
                  <Link
                    key={product.id}
                    style={{
                      textDecoration: "none",
                      display: "block",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: `${virtualColumn.size}px`,
                      height: `${virtualRow.size}px`,
                      transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                    }}
                    href={`/products/${product.id}`}
                  >
                    <ProductCard
                      product={product}
                      data-index={
                        virtualRow.index * virtualColumns.length +
                        virtualColumn.index
                      }
                      ref={rowVirtualizer.measureElement}
                    />
                  </Link>
                ) : null;
              })}
            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  await dbConnect();
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["products"],
    queryFn: ({ pageParam }) => ProductModel.getProducts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    pages: 1,
  });
  return {
    props: {
      dehydratedState: Nullify.nullifyUndefined(
        dehydrate(queryClient),
      ) as DehydratedState,
    },
  };
};
