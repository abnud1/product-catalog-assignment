import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import ProductFilters, { type ProductFiltersType } from ".";

describe("ProductFilters", () => {
  let filters: ProductFiltersType = {};
  const setFilters = (
    callback:
      | ((prevState: ProductFiltersType) => ProductFiltersType)
      | ProductFiltersType,
  ) => {
    filters = typeof callback === "function" ? callback(filters) : callback;
  };

  const user = userEvent.setup();
  it("renders search field and filters icon", () => {
    render(<ProductFilters filters={filters} setFilters={setFilters} />);
    const searchField = screen.queryByRole("searchbox");
    expect(searchField).toBeInTheDocument();
    const tuneIcon = screen.queryByRole("button");
    expect(tuneIcon).toBeInTheDocument();
  });
  it("changes search field", async () => {
    render(<ProductFilters filters={filters} setFilters={setFilters} />);
    const searchField = screen.getByRole("searchbox");
    await user.click(searchField);
    await user.type(searchField, "ab");
    expect(filters.search).toBe("ab");
  });
  it("opens filters collapse", async () => {
    render(<ProductFilters filters={filters} setFilters={setFilters} />);
    const tuneIcon = screen.getByRole("button");
    await user.click(tuneIcon);
    const nameField = screen.queryByRole("textbox");
    expect(nameField).toBeInTheDocument();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await userEvent.type(nameField!, "ab");
    expect(filters.name).toBe("ab");
    const priceSliders = screen.queryAllByRole("slider");
    expect(priceSliders).toHaveLength(2);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.change(priceSliders[0]!, { target: { value: 100 } });
    expect(filters.minPrice).toBe(100);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.change(priceSliders[1]!, { target: { value: 300 } });
    expect(filters.maxPrice).toBe(300);

    const sortBySelect = screen.queryAllByRole("textbox", { hidden: true })[1];
    expect(sortBySelect).toBeInTheDocument();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.change(sortBySelect!, { target: { value: "name" } });
    expect(filters.orderBy).toBe("name");

    const orderSortRadio = screen.queryAllByRole<HTMLInputElement>("radio");
    expect(orderSortRadio).toHaveLength(2);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await userEvent.click(orderSortRadio[1]!);
    expect(filters.orderBySort).toBe("desc");
  });
});
