import { Plus, Search } from "lucide-react";
import React, { useState } from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";

const MainDashboardPage = () => {
  const [search, setSearch] = useState("");
  const { data: getAllWarungData, isLoading: isGetAllWarungDataLoading } =
    api.warung.getWarung.useQuery();

  return (
    <DashboardLayout>
      <div className="flex flex-col p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row">
          <Button size="sm">
            Buat warung <Plus />
          </Button>
          <div className="relative h-8 md:w-72">
            <Input
              id="search"
              placeholder="Cari warung"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm md:pl-10 md:text-sm"
            />
            <Label htmlFor="search">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 md:h-4 md:w-4" />
            </Label>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getAllWarungData?.map((warung) => {
            const activeSubscription = warung.subscriptions
              .filter((sub) => sub.isActive)
              .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];

            const currentPlan = activeSubscription?.plan || "FREE";

            return (
              <Card
                key={warung.id}
                className="flex flex-col justify-between md:h-44 md:px-6"
              >
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
                <div className="mt-2 text-sm text-gray-500">
                  {warung.address}
                </div>
                {activeSubscription && (
                  <div className="mt-2 text-xs text-gray-500">
                    <div>
                      Valid until:{" "}
                      {activeSubscription.endDate.toLocaleDateString()}
                    </div>
                    <div>
                      Status:{" "}
                      <span
                        className={
                          activeSubscription.isActive
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {activeSubscription.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MainDashboardPage;
