import type { Product } from "@/models/product";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  type CardProps,
} from "@mui/material";
import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import styles from "./styles";

const numberFormatter = Intl.NumberFormat(["en"], {
  currency: "USD",
  style: "currency",
});
export const cardHeight = 460;
export const cardWidth = 208;

interface ProductCardProps extends CardProps {
  product: Product;
}
function ProductCard(
  { product, ...props }: ProductCardProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <Card {...props} sx={styles.productCard} ref={ref}>
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
    </Card>
  );
}
export default forwardRef<HTMLDivElement, ProductCardProps>(ProductCard);
