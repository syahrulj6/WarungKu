import { Search } from "lucide-react";
import React, { useState } from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import { WarungCard } from "../components/WarungCard";
import { useDebounce } from "use-debounce";
import { CreateWarungModal } from "../components/CreateWarungModal";

const MainDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const {
    data: allWarungData,
    isLoading: isAllLoading,
    refetch,
  } = api.warung.getWarung.useQuery();

  const { data: searchWarungData, isLoading: isSearchLoading } =
    api.warung.searchWarungByName.useQuery(
      { name: debouncedSearchTerm },
      { enabled: debouncedSearchTerm.length > 0 },
    );

  const displayData =
    debouncedSearchTerm.length > 0 ? searchWarungData : allWarungData;
  const isLoading =
    debouncedSearchTerm.length > 0 ? isSearchLoading : isAllLoading;

  return (
    <DashboardLayout
      metaTitle="Dashboard"
      metaDescription="Kelola warung Anda dengan mudah melalui dashboard WarungKu"
      pathname="/dashboard/warung"
    >
      <div className="flex flex-col p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row">
          <CreateWarungModal refetch={refetch} />
          <div className="relative h-8 md:w-72">
            <Input
              id="search"
              placeholder="Cari warung"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-sm md:pl-10 md:text-sm"
            />
            <Label htmlFor="search">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 md:h-4 md:w-4" />
            </Label>
          </div>
        </div>

        {isLoading && (
          <div className="text-muted-foreground mt-4 text-center text-sm">
            Memuat data...
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayData?.map((warung) => (
            <WarungCard key={warung.id} warung={warung} />
          ))}
        </div>

        {!isLoading &&
          debouncedSearchTerm &&
          (!displayData || displayData.length === 0) && (
            <div className="text-muted-foreground mt-4 text-center text-sm">
              Tidak ada warung yang ditemukan dengan nama "{debouncedSearchTerm}
              "
            </div>
          )}
      </div>
    </DashboardLayout>
  );
};

export default MainDashboardPage;
