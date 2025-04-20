import type { Subscription, Warung } from "@prisma/client";
import React from "react";
import { Card } from "~/components/ui/card";

type WarungWithSubscriptions = Warung & {
  subscriptions: Subscription[];
};

interface WarungCardProps {
  warung: WarungWithSubscriptions;
}

export const WarungCard = ({ warung }: WarungCardProps) => {
  const activeSubscription = warung.subscriptions
    .filter((sub) => sub.isActive)
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

  const currentPlan = activeSubscription?.plan || "FREE";

  return (
    <Card className="flex flex-col justify-between md:h-44 md:px-6 md:py-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{warung.name}</h3>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            currentPlan === "FREE"
              ? "bg-gray-100 text-gray-800"
              : currentPlan === "BASIC"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
          }`}
        >
          {currentPlan}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-500">{warung.address}</div>
      {activeSubscription && (
        <div className="mt-2 text-xs text-gray-500">
          <div>
            Valid until: {activeSubscription.endDate.toLocaleDateString()}
          </div>
          <div>
            Status:{" "}
            <span
              className={
                activeSubscription.isActive ? "text-green-500" : "text-red-500"
              }
            >
              {activeSubscription.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};
