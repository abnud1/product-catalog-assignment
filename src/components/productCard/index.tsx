import type { Product } from "@/types/product";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import styles from "./styles";
interface ProductCardProps {
  product: Product;
}
const numberFormatter = Intl.NumberFormat(["en"], {
  currency: "USD",
  style: "currency",
});
export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card sx={styles.productCard}>
      <CardMedia
        title={product.name}
        image={product.image}
        sx={styles.productImage}
      />
      <CardContent>
        <Typography variant="h4">{product.name}</Typography>
        <Typography variant="h6">
          {numberFormatter.format(product.price)}
        </Typography>
        <Typography variant="body2">{product.description}</Typography>
      </CardContent>
    </Card>
  );
}
