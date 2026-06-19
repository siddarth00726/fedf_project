import { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export const CheckoutProvider = ({ children }) => {
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [coupon, setCoupon] = useState(null);
  const [totals, setTotals] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [pendingCoupon, setPendingCoupon] = useState(null);

  const startBuyNow = (product, quantity = 1) => {
    setCheckoutItems([{ ...product, quantity }]);
    setIsBuyNow(true);
    setCoupon(null);
    setTotals(null);
    setSelectedAddress(null);
    setPaymentMethod('');
    setPaymentDetails({});
  };

  const startCartCheckout = (items) => {
    setCheckoutItems(items);
    setIsBuyNow(false);
  };

  const resetCheckout = () => {
    setCheckoutItems([]);
    setIsBuyNow(false);
    setSelectedAddress(null);
    setPaymentMethod('');
    setPaymentDetails({});
    setCoupon(null);
    setTotals(null);
    setPendingCoupon(null);
  };

  return (
    <CheckoutContext.Provider
      value={{
        checkoutItems,
        setCheckoutItems,
        isBuyNow,
        selectedAddress,
        setSelectedAddress,
        paymentMethod,
        setPaymentMethod,
        paymentDetails,
        setPaymentDetails,
        coupon,
        setCoupon,
        totals,
        setTotals,
        lastOrder,
        setLastOrder,
        pendingCoupon,
        setPendingCoupon,
        startBuyNow,
        startCartCheckout,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => useContext(CheckoutContext);
