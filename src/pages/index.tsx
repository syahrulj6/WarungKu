import { PageContainer } from "~/components/layout/PageContainer";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <PageContainer>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1>WarungKu</h1>
        <Button>Login</Button>
      </main>
    </PageContainer>
  );
}
