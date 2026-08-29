"use client";

import { ImagePlus, LoaderCircle, UploadCloud } from "lucide-react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { firebaseMessage } from "@/lib/firebase-errors";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function VentureCoverUploader({ uid }: { uid: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getDoc(doc(db, "profiles", uid))
      .then((snapshot) => {
        if (!active) return;
        setUrl(snapshot.exists() ? String(snapshot.data().coverUrl ?? "") : "");
      })
      .catch((caught) => active && setError(firebaseMessage(caught)))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [uid]);

  async function upload(file: File) {
    setError("");
    setNotice("");
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Usá una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("La imagen debe pesar 10 MB o menos.");
      return;
    }

    setUploading(true);
    try {
      const profileRef = doc(db, "profiles", uid);
      const profile = await getDoc(profileRef);
      if (!profile.exists()) {
        setError("Guardá primero los datos básicos del emprendimiento y luego agregá la imagen.");
        return;
      }

      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const storageRef = ref(storage, `profiles/${uid}/cover/venture-card-${Date.now()}.${extension}`);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const downloadUrl = await getDownloadURL(storageRef);
      await updateDoc(profileRef, { coverUrl: downloadUrl, updatedAt: serverTimestamp() });
      setUrl(downloadUrl);
      setNotice("Imagen de portada actualizada.");
    } catch (caught) {
      setError(firebaseMessage(caught));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="venture-cover-editor">
      <div className="venture-cover-preview">
        {url ? <img src={url} alt="Portada del emprendimiento" /> : <div><ImagePlus size={30} /><span>Imagen del emprendimiento</span></div>}
      </div>
      <div className="venture-cover-copy">
        <span className="profile-section-number">00</span>
        <div>
          <h2>Imagen de la tarjeta</h2>
          <p>Usá una foto horizontal que represente el producto, servicio o experiencia principal. También se usará como portada del perfil público.</p>
          {notice ? <small className="venture-cover-success">{notice}</small> : null}
          {error ? <small className="venture-cover-error">{error}</small> : null}
        </div>
        <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
        <button type="button" className="btn btn-secondary" disabled={loading || uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <LoaderCircle className="spin" size={16} /> : <UploadCloud size={16} />}
          {uploading ? "Subiendo..." : url ? "Cambiar imagen" : "Agregar imagen"}
        </button>
      </div>
    </section>
  );
}
