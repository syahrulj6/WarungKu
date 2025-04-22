import React from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";

const SecurityPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-xl font-semibold md:text-2xl">
            Multi-Factor Authentication
          </h1>
          <p className="text-muted-foreground text-sm">
            Tambahkan lapisan keamanan tambahan ke akun Anda dengan meminta
            lebih dari sekadar kata sandi untuk masuk.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecurityPage;
