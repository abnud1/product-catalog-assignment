import ProductCard, { cardHeight, cardWidth } from "@/components/productCard";
import ProductFilters from "@/components/productsFilters";
import { dbConnect } from "@/lib/db";
import type { Paginated } from "@/models/common";
import ProductModel, {
  type Product,
  type ProductQuery,
  type ProductsCursor,
} from "@/models/product";
import type { StylesObj } from "@/types/styles";
import { Box, Grid } from "@mui/material";
import {
  QueryClient,
  dehydrate,
  useInfiniteQuery,
  type DehydratedState,
  type QueryFunctionContext,
} from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import axios from "axios";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "node:querystring";
import Nullify from "nullify-undefined/dist/cjs/index";
import React, { useEffect, useRef, useState } from "react";
function queryToFilters(query: ParsedUrlQuery): Omit<ProductQuery, "cursor"> {
  const result = { ...query } as Omit<ProductQuery, "cursor">;
  result.minPrice = query["minPrice"] ? Number(query["minPrice"]) : undefined;
  result.maxPrice = query["maxPrice"] ? Number(query["maxPrice"]) : undefined;
  return result;
}
async function getProducts({
  pageParam,
  queryKey,
}: QueryFunctionContext<[string, ParsedUrlQuery], ProductsCursor | undefined>) {
  const urlSearch = new URLSearchParams(queryKey[1] as Record<string, string>);
  if (pageParam) {
    urlSearch.set("cursor", JSON.stringify(pageParam));
  }
  if (urlSearch.get("maxPrice") === "null") {
    urlSearch.delete("maxPrice");
  }
  if (urlSearch.get("minPrice") === "null") {
    urlSearch.delete("minPrice");
  }
  const res = await axios.get<Paginated<Product, "products">>(
    `products?${urlSearch.toString()}`,
  );
  return res.data;
}

const styles = {
  productsList: {
    height: "100%",
    width: "100%",
  },
  filtersContainer: {
    marginBottom: "0.5rem",
  },
} satisfies StylesObj;

export default function ProductsCatalog() {
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["products", router.query] as [string, ParsedUrlQuery],
      queryFn: getProducts,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: undefined as ProductsCursor | undefined,
    });
  const allProducts = data ? data.pages.flatMap((d) => d.products) : [];
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<Omit<ProductQuery, "cursor">>(
    queryToFilters(router.query),
  );
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
  useEffect(() => {
    void router.push({
      pathname: "",
      query: filters,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <Grid container flexDirection="column">
      <ProductFilters
        filters={filters}
        setFilters={setFilters}
        containerStyle={styles.filtersContainer}
      />
      <Box ref={parentRef} sx={styles.productsList}>
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
    </Grid>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  await dbConnect();
  const queryClient = new QueryClient();
  const query = { ...ctx.query } as ProductQuery;
  query.maxPrice = ctx.query["maxPrice"]
    ? Number(ctx.query["maxPrice"])
    : undefined;
  query.minPrice = ctx.query["minPrice"]
    ? Number(ctx.query["minPrice"])
    : undefined;
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["products", query],
    queryFn: ({ pageParam }) =>
      ProductModel.getProducts({
        cursor: pageParam,
        ...query,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as ProductsCursor | undefined,
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
