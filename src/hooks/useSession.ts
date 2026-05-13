import { api } from "~/utils/api";
import { useRouter } from "next/router";

export const useSession = () => {
  const {
    data: session,
    isLoading: loading,
    refetch,
  } = api.auth.currentUser.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const router = useRouter();
  const logout = api.auth.logout.useMutation();

  const handleSignOut = async () => {
    try {
      await logout.mutateAsync();
      await refetch();
      await router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { session, loading, handleSignOut };
};
