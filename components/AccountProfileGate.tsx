"use client";

import { LoaderCircle } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { ProfileWorkspaceV2 } from "@/components/ProfileWorkspaceV2";

const ADMIN_EMAIL = "norvingarcia220@gmail.com";

export function AccountProfileGate() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

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
      const account = await getDoc(doc(db, "users", user.uid));
      if (account.data()?.accountType === "empresa") {
        router.replace("/mi-empresa");
        return;
      }
    } catch {
      // Profile workspace will surface any real access error.
    }
    setReady(true);
  }), [router]);

  if (!ready) return <main className="profile-workspace-page"><div className="profile-loading"><LoaderCircle className="spin" size={28} /> Preparando tu espacio...</div></main>;
  return <ProfileWorkspaceV2 />;
}
