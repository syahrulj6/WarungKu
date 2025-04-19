import { Plus, Search } from "lucide-react";
import React, { useState } from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import WarungCard from "../components/WarungCard";

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
          {getAllWarungData?.map((warung) => (
            <WarungCard key={warung.id} warung={warung} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MainDashboardPage;
