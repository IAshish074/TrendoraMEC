import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PaypalButton = ({ amount, onSuccess, onError, onCancel }) => {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-sm">
        PayPal Client ID is missing. Please set VITE_PAYPAL_CLIENT_ID in your environment variables.
      </div>
    );
  }

  const numericAmount = Math.max(0.01, Number(amount) || 0).toFixed(2);

  return (
    <PayPalScriptProvider
      options={{
        "client-id": clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: numericAmount,
                  currency_code: "USD",
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            if (onSuccess) {
              onSuccess(details);
            }
          });
        }}
        onError={(err) => {
          if (onError) {
            onError(err);
          }
        }}
        onCancel={() => {
          if (onCancel) {
            onCancel();
          }
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PaypalButton;
