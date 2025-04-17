import { CirclePlay } from "lucide-react";
import { PageContainer } from "~/components/layout/PageContainer";
import { SectionContainer } from "~/components/layout/SectionContainer";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <PageContainer>
      <SectionContainer
        padded
        className="mt-20 mb-4 flex min-h-[calc(100vh-144px)] w-full flex-col justify-center gap-4 md:mt-20 md:mb-0 md:gap-6"
      >
        <h1 className="text-center text-4xl font-semibold">
          WarungKu untuk semua kebutuhan warung Anda{" "}
        </h1>
        <p className="text-muted-foreground text-center tracking-tight">
          ucapkan selamat tinggal pada pengambilan pesanan manual dan proses
          penagihan yang rumit dengan sistem POS kami yang mudah digunakan
        </p>

        <div className="mt-2 flex gap-4">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">
            <CirclePlay /> Watch Video
          </Button>
        </div>
      </SectionContainer>
    </PageContainer>
  );
}
