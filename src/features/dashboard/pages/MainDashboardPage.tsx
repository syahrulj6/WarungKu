import { Search } from "lucide-react";
import React, { useState } from "react";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/utils/api";
import { KasirCard } from "../components/KasirCard";
import { useDebounce } from "use-debounce";
import { CreateKasirModal } from "../components/CreateKasirModal";

const MainDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const {
    data: allKasirData,
    isLoading: isAllLoading,
    refetch,
  } = api.kasir.getKasir.useQuery();

  const { data: searchKasirData, isLoading: isSearchLoading } =
    api.kasir.searchKasirByName.useQuery(
      { name: debouncedSearchTerm },
      { enabled: debouncedSearchTerm.length > 0 },
    );

  const displayData =
    debouncedSearchTerm.length > 0 ? searchKasirData : allKasirData;
  const isLoading =
    debouncedSearchTerm.length > 0 ? isSearchLoading : isAllLoading;

  return (
    <DashboardLayout
      metaTitle="Dashboard"
      metaDescription="Kelola bussiness Anda dengan mudah melalui dashboard Kasirium"
      pathname="/dashboard/kasir"
    >
      <div className="flex flex-col p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row">
          <CreateKasirModal refetch={refetch} />
          <div className="relative h-8 md:w-72">
            <Input
              id="search"
              placeholder="Cari Kasir"
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
          {displayData?.map((Kasir) => (
            <KasirCard key={Kasir.id} Kasir={Kasir} />
          ))}
        </div>

        {!isLoading &&
          debouncedSearchTerm &&
          (!displayData || displayData.length === 0) && (
            <div className="text-muted-foreground mt-4 text-center text-sm">
              Tidak ada kasir yang ditemukan dengan nama &quot;
              {debouncedSearchTerm}&quot;
            </div>
          )}
      </div>
    </DashboardLayout>
  );
};

export default MainDashboardPage;


