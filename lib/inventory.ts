
export type InventoryProduct = {
  stock: number;
  threshold: number;
  price: number;
};

export function countLowStock(products: InventoryProduct[]) {
  return products.filter(
    (product) =>
      product.stock > 0 && product.stock <= product.threshold
  ).length;
}

export function countOutOfStock(products: InventoryProduct[]) {
  return products.filter((product) => product.stock === 0).length;
}

export function calculateInventoryValue(products: InventoryProduct[]) {
  return products.reduce(
    (total, product) => total + product.stock * product.price,
    0
  );
}
