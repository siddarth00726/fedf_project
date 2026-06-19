export const getEffectivePrice = (product) => {
  if (product.salePrice && product.saleEndsAt && new Date(product.saleEndsAt) > new Date()) {
    return product.salePrice;
  }
  return product.price;
};

export const isOnSale = (product) =>
  product.salePrice && product.saleEndsAt && new Date(product.saleEndsAt) > new Date();
