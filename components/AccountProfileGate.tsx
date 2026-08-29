"use client";

import { LoaderCircle } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { ProfileWorkspaceV2 } from "@/components/ProfileWorkspaceV2";
import { VentureWorkspace } from "@/components/VentureWorkspace";

const ADMIN_EMAIL = "norvingarcia220@gmail.com";

type AccountType = "persona" | "negocio" | "empresa";

export function AccountProfileGate() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("persona");

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setReady(true);
      return;
    }

    if ((user.email ?? "").trim().toLowerCase() === ADMIN_EMAIL) {
      router.replace("/admin");
      return;
    }

    try {
      const [account, profile] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDoc(doc(db, "profiles", user.uid)),
      ]);
      const storedAccountType = account.data()?.accountType;
      const storedProfileKind = profile.data()?.kind;
      const resolved: AccountType = storedAccountType === "empresa" || storedProfileKind === "empresa"
        ? "empresa"
        : storedAccountType === "negocio" || storedProfileKind === "negocio"
          ? "negocio"
          : "persona";

      if (resolved === "empresa") {
        router.replace("/mi-empresa");
        return;
      }

      setAccountType(resolved);
    } catch {
      // The workspace itself will surface a concrete Firebase error if access fails.
    }
    setReady(true);
  }), [router]);

  if (!ready) return <main className="profile-workspace-page"><div className="profile-loading"><LoaderCircle className="spin" size={28} /> Preparando tu espacio...</div></main>;
  return accountType === "negocio" ? <VentureWorkspace /> : <ProfileWorkspaceV2 />;
}
