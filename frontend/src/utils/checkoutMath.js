export const DELIVERY_FEE = 40;
export const TAX_RATE = 0.05;

export const formatCurrency = (amount = 0) =>
  `\u20b9${Number(amount || 0).toLocaleString("en-IN")}`;

export const calculateCheckout = (items = []) => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const totalAmount = subtotal + DELIVERY_FEE + taxAmount;

  return {
    subtotal,
    deliveryFee: DELIVERY_FEE,
    taxAmount,
    totalAmount,
  };
};
