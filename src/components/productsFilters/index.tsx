import type { ProductQuery } from "@/models/product";
import { Search, Tune } from "@mui/icons-material";
import {
  Box,
  Collapse,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  TextField,
  Typography,
  type SxProps,
} from "@mui/material";
import type React from "react";
import { useId, useState } from "react";
import styles from "./styles";

interface ProductFiltersProps {
  filters: Omit<ProductQuery, "cursor">;
  setFilters: React.Dispatch<
    React.SetStateAction<Omit<ProductQuery, "cursor">>
  >;
  containerStyle?: SxProps;
}
export default function ProductFilters({
  filters,
  setFilters,
  containerStyle,
}: ProductFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const orderByLabelId = useId();
  return (
    <Grid container flexDirection="column" sx={containerStyle}>
      <Box>
        <TextField
          label="Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          value={filters.search}
          variant="outlined"
          onChange={(ev) => {
            setFilters((oldFilters) => ({
              ...oldFilters,
              search: ev.target.value,
            }));
          }}
          sx={styles.searchField}
        />
        <IconButton
          sx={{ color: filtersOpen ? "blue" : "black" }}
          onClick={() => {
            setFiltersOpen((oldOpen) => !oldOpen);
          }}
        >
          <Tune />
        </IconButton>
      </Box>
      <Collapse in={filtersOpen}>
        <Grid
          container
          flexDirection="column"
          sx={styles.additionalFiltersContainer}
        >
          <TextField
            label="Name"
            value={filters.name}
            onChange={(ev) => {
              setFilters((oldFilters) => ({
                ...oldFilters,
                name: ev.target.value,
              }));
            }}
          />
          <Typography variant="caption">Price Range</Typography>
          <Slider
            value={[filters.minPrice ?? 0, filters.maxPrice ?? 400]}
            min={0}
            max={400}
            valueLabelDisplay="auto"
            onChange={(_ev, value) => {
              setFilters((oldFilters) => ({
                ...oldFilters,
                minPrice: (value as number[])[0],
                maxPrice: (value as number[])[1],
              }));
            }}
            sx={styles.priceSlider}
          />
          <Grid container>
            <FormControl sx={styles.orderBySelect}>
              <InputLabel id={orderByLabelId}>Sort By</InputLabel>
              <Select
                labelId={orderByLabelId}
                label="Sort By"
                value={filters.orderBy ?? ""}
                onChange={(ev) => {
                  setFilters((oldFilters) => ({
                    ...oldFilters,
                    orderBy:
                      ev.target.value === ""
                        ? undefined
                        : (ev.target.value as "name" | "price"),
                  }));
                }}
              >
                <MenuItem value=""></MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="price">Price</MenuItem>
              </Select>
            </FormControl>

            <RadioGroup
              row
              value={filters.orderBySort ?? "asc"}
              onChange={(ev) => {
                setFilters((oldFilters) => ({
                  ...oldFilters,
                  orderBySort: ev.target.value as "asc" | "desc",
                }));
              }}
            >
              <FormControlLabel
                value="asc"
                control={<Radio />}
                label="Ascending"
              />
              <FormControlLabel
                value="desc"
                control={<Radio />}
                label="Descending"
              />
            </RadioGroup>
          </Grid>
        </Grid>
      </Collapse>
    </Grid>
  );
}
