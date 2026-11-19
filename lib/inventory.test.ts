import { describe, expect, it } from "vitest";
import {
  calculateInventoryValue,
  countLowStock,
  countOutOfStock,
} from "./inventory";

const products = [
  { stock: 8, threshold: 10, price: 18 },
  { stock: 24, threshold: 10, price: 12 },
  { stock: 0, threshold: 8, price: 5 },
  { stock: 5, threshold: 5, price: 7 },
];

describe("inventory calculations", () => {
  it("counts low-stock products but excludes out-of-stock items", () => {
    expect(countLowStock(products)).toBe(2);
  });

  it("counts out-of-stock products", () => {
    expect(countOutOfStock(products)).toBe(1);
  });

  it("calculates total inventory value", () => {
    expect(calculateInventoryValue(products)).toBe(8 * 18 + 24 * 12 + 5 * 7);
  });

  it("returns zero for an empty inventory", () => {
    expect(calculateInventoryValue([])).toBe(0);
    expect(countLowStock([])).toBe(0);
    expect(countOutOfStock([])).toBe(0);
  });
});