import ProductCard, { cardHeight, cardWidth } from "@/components/productCard";
import ProductFilters, {
  type ProductFiltersType,
} from "@/components/productsFilters";
import { dbConnect } from "@/lib/db";
import type { Paginated } from "@/models/common";
import ProductModel, {
  type Product,
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
import { useVirtualizer } from "@tanstack/react-virtual";
import axios from "axios";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "node:querystring";
import Nullify from "nullify-undefined/dist/cjs/index";
import React, { useEffect, useRef, useState } from "react";
function queryToFilters(query: ParsedUrlQuery): ProductFiltersType {
  const result = { ...query } as ProductFiltersType;
  result.minPrice = query["minPrice"] ? Number(query["minPrice"]) : undefined;
  result.maxPrice = query["maxPrice"] ? Number(query["maxPrice"]) : undefined;
  return result;
}
async function getProducts({
  pageParam,
  queryKey,
}: QueryFunctionContext<
  [string, ProductFiltersType],
  ProductsCursor | undefined
>) {
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
  const initialFilters = queryToFilters(router.query);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["products", initialFilters] as [string, ProductFiltersType],
      queryFn: getProducts,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
  const allProducts = data ? data.pages.flatMap((d) => d.products) : [];
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [hoveredRows, setHoveredRows] = useState<number[]>([]);
  const [hoveredColumns, setHoveredColumns] = useState<number[]>([]);
  const [currentHoveredScale, setCurrentHoveredScale] = useState(1);
  const [filters, setFilters] = useState<ProductFiltersType>(initialFilters);
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(
      (hasNextPage ? allProducts.length + 1 : allProducts.length) / 6,
    ),
    estimateSize: (rowIndex) =>
      cardHeight * (hoveredRows.includes(rowIndex) ? currentHoveredScale : 1),
    getScrollElement: () => parentRef.current,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: Math.min(6, allProducts.length),
    estimateSize: (columnIndex) =>
      cardWidth *
      (hoveredColumns.includes(columnIndex) ? currentHoveredScale : 1),
    getScrollElement: () => parentRef.current,
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

  useEffect(() => {
    rowVirtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredRows, currentHoveredScale]);
  useEffect(() => {
    columnVirtualizer.measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredColumns, currentHoveredScale]);
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
                        onUpdate={(latest) => {
                          setCurrentHoveredScale(
                            (latest["scale"] ?? 1) as number,
                          );
                        }}
                        onHoverStart={() => {
                          setHoveredRows((previosRows) => [
                            ...previosRows,
                            virtualRow.index,
                          ]);
                          setHoveredColumns((previosColumns) => [
                            ...previosColumns,
                            virtualColumn.index,
                          ]);
                        }}
                        onHoverEnd={() => {
                          setHoveredRows((previosRows) => {
                            const newRows = [...previosRows];
                            const index = newRows.indexOf(virtualRow.index);
                            if (index >= 0) {
                              newRows.splice(index, 1);
                              return newRows;
                            }
                            return previosRows;
                          });
                          setHoveredColumns((previosColumns) => {
                            const newColumns = [...previosColumns];
                            const index = newColumns.indexOf(
                              virtualColumn.index,
                            );
                            if (index >= 0) {
                              newColumns.splice(index, 1);
                              return newColumns;
                            }
                            return previosColumns;
                          });
                        }}
                        whileHover={{
                          scale: 1.5,
                          transition: { duration: 0.5 },
                        }}
                        initial={{
                          opacity: 0,
                          y: 300,
                        }}
                        whileInView={{
                          opacity: 1,
                          y: 0,
                          transition: {
                            type: "spring",
                            bounce: 0.4,
                            duration: 0.8,
                          },
                        }}
                        viewport={{ once: true }}
                        product={product}
                        data-index={
                          virtualRow.index * virtualColumns.length +
                          virtualColumn.index
                        }
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
  const query = queryToFilters(ctx.query);
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["products", query],
    queryFn: ({ pageParam }) =>
      ProductModel.getProducts({
        cursor: pageParam as ProductsCursor | undefined,
        ...query,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  return {
    props: {
      dehydratedState: Nullify.nullifyUndefined(
        dehydrate(queryClient),
      ) as DehydratedState,
    },
  };
};
