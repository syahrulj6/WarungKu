export type ChartActivityConfig = {
  count: {
    label: string;
    color: string;
  };
  SALE_CREATED: {
    label: string;
    color: string;
  };
  SALE_UPDATED: {
    label: string;
    color: string;
  };
  SALE_DELETED: {
    label: string;
    color: string;
  };
  PRODUCT_ADDED: {
    label: string;
    color: string;
  };
  PRODUCT_UPDATED: {
    label: string;
    color: string;
  };
  PRODUCT_STOCK_ADJUSTED: {
    label: string;
    color: string;
  };
  CUSTOMER_ADDED: {
    label: string;
    color: string;
  };
  CUSTOMER_UPDATED: {
    label: string;
    color: string;
  };
  STAFF_ADDED: {
    label: string;
    color: string;
  };
  STAFF_REMOVED: {
    label: string;
    color: string;
  };
  SHIFT_OPENED: {
    label: string;
    color: string;
  };
  SHIFT_CLOSED: {
    label: string;
    color: string;
  };
  DEBT_PAID: {
    label: string;
    color: string;
  };
  STOCK_LOW: {
    label: string;
    color: string;
  };
  IMPORT_COMPLETED: {
    label: string;
    color: string;
  };
  EXPORT_COMPLETED: {
    label: string;
    color: string;
  };
  SETTINGS_CHANGED: {
    label: string;
    color: string;
  };
};

export const chartActivityConfig: ChartActivityConfig = {
  count: {
    label: "Total Activities",
    color: "#4D55CC",
  },
  SALE_CREATED: {
    label: "New Sale",
    color: "#8884d8",
  },
  SALE_UPDATED: {
    label: "Sale Updated",
    color: "#82ca9d",
  },
  SALE_DELETED: {
    label: "Sale Deleted",
    color: "#ffc658",
  },
  PRODUCT_ADDED: {
    label: "Product Added",
    color: "#ff8042",
  },
  PRODUCT_UPDATED: {
    label: "Product Updated",
    color: "#D84040",
  },
  PRODUCT_STOCK_ADJUSTED: {
    label: "Stock Adjusted",
    color: "#0088FE",
  },
  CUSTOMER_ADDED: {
    label: "New Customer",
    color: "#00C49F",
  },
  CUSTOMER_UPDATED: {
    label: "Customer Updated",
    color: "#FFBB28",
  },
  STAFF_ADDED: {
    label: "Staff Added",
    color: "#FF8042",
  },
  STAFF_REMOVED: {
    label: "Staff Removed",
    color: "#A4DE6C",
  },
  SHIFT_OPENED: {
    label: "Shift Started",
    color: "#D0ED57",
  },
  SHIFT_CLOSED: {
    label: "Shift Ended",
    color: "#8884d8",
  },
  DEBT_PAID: {
    label: "Debt Payment",
    color: "#82ca9d",
  },
  STOCK_LOW: {
    label: "Low Stock",
    color: "#ffc658",
  },
  IMPORT_COMPLETED: {
    label: "Import Completed",
    color: "#ff8042",
  },
  EXPORT_COMPLETED: {
    label: "Export Completed",
    color: "#D84040",
  },
  SETTINGS_CHANGED: {
    label: "Settings Changed",
    color: "#0088FE",
  },
};
