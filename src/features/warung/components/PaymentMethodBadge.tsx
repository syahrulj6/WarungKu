import type { FC } from "react";

interface PaymentMethodBadgeProps {
  method: string;
}

const PaymentMethodBadge: FC<PaymentMethodBadgeProps> = ({ method }) => {
  const paymentMethodMap: Record<string, { display: string; class: string }> = {
    CASH: {
      display: "Cash",
      class: "bg-green-100 text-green-600",
    },
    QRIS: {
      display: "QRIS",
      class: "bg-blue-100 text-blue-600",
    },
    BANK_TRANSFER: {
      display: "Bank Transfer",
      class: "bg-purple-100 text-purple-600",
    },
    E_WALLET: {
      display: "E-Wallet",
      class: "bg-teal-100 text-teal-600",
    },
    DEBT: {
      display: "Debt",
      class: "bg-red-100 text-red-600",
    },
  };

  const selectedMethod = paymentMethodMap[method] || {
    display: method.replace("_", " "),
    class: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${selectedMethod.class}`}
    >
      {selectedMethod.display}
    </span>
  );
};

export default PaymentMethodBadge;
