import { useRouter } from "next/router";
import { type PropsWithChildren, useEffect } from "react";
import { supabase } from "~/lib/supabase/client";

export const SessionRoute = (props: PropsWithChildren) => {
  const router = useRouter();

  useEffect(() => {
    void (async function () {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        await router.replace("/login");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return props.children;
};
