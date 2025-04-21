import type { Subscription, Warung } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { Card } from "~/components/ui/card";
import { MdArrowForwardIos } from "react-icons/md";

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
    <Link href={`/dashboard/warung/${warung.id}`}>
      <Card className="group flex h-40 flex-col justify-between px-4 transition-all hover:shadow-xl md:h-44 md:px-6 md:py-4">
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
        <div className="mt-2 flex w-full justify-between">
          <div className="text-muted-foreground text-sm">{warung.address}</div>

          <MdArrowForwardIos className="text-muted-foreground mr-2 text-sm transition-all group-hover:mr-0 group-hover:text-lg group-hover:text-current" />
        </div>
      </Card>
    </Link>
  );
};
