import type { Product } from "@/models/product";
import {
  CardContent,
  CardMedia,
  Typography,
  type CardProps,
} from "@mui/material";
import type { MotionProps } from "framer-motion";
import type { ForwardedRef } from "react";
import AnimatedCard from "../AnimatedCard";
import styles from "./styles";

const numberFormatter = Intl.NumberFormat(["en"], {
  currency: "USD",
  style: "currency",
});
export const cardHeight = 460;
export const cardWidth = 208;

type ProductCardProps = MotionProps &
  CardProps & {
    product: Product;
  };
export default function ProductCard(
  { product, ...props }: ProductCardProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <AnimatedCard
      {...props}
      sx={styles.productCard}
      ref={ref}
      data-testid="card"
    >
      <CardMedia
        title={product.name}
        image={product.image}
        sx={styles.productImage}
      />
      <CardContent>
        <Typography variant="h5">{product.name}</Typography>
        <Typography variant="h6">
          {numberFormatter.format(product.price)}
        </Typography>
        <Typography variant="body2">{product.description}</Typography>
      </CardContent>
    </AnimatedCard>
  );
}
