import type { Product } from "@/models/product";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ProductCard from ".";
const testProduct: Product = {
  id: "1",
  name: "Product 1",
  image: "https://www.google.com",
  description: "this is my product",
  price: 346,
};
describe("ProductCard", () => {
  const user = userEvent.setup();
  it("renders", () => {
    render(<ProductCard product={testProduct} />);

    const name = screen.queryByRole("heading", { level: 5 });
    expect(name).toBeInTheDocument();
    expect(name).toHaveTextContent(testProduct.name);

    const price = screen.queryByRole("heading", { level: 6 });

    expect(price).toBeInTheDocument();
    expect(price).toHaveTextContent(`$${testProduct.price}`);

    const description = screen.queryByText(testProduct.description);
    expect(description).toBeInTheDocument();

    const image = screen.queryByTitle(testProduct.name);
    expect(image).toBeInTheDocument();
    expect(image).toHaveStyle({ backgroundImage: testProduct.image });
  });
  it("animates", async () => {
    render(
      <ProductCard
        product={testProduct}
        whileHover={{ opacity: 0, transition: { duration: 0 } }}
      />,
    );
    const card = screen.getByTestId("card");
    await user.hover(card);
    fireEvent.animationStart(card);
    fireEvent.animationIteration(card);
    fireEvent.animationEnd(card);
    await waitFor(() => {
      expect(card).toHaveStyle({ opacity: 0 });
    });
  });
});
