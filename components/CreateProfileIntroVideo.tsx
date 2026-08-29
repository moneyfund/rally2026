"use client";

import { useEffect, useRef } from "react";

export function CreateProfileIntroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.currentTime = 0;
    video.load();

    const start = () => {
      video.play().catch(() => {
        // Browsers can defer autoplay until the media is ready.
      });
    };

    if (video.readyState >= 2) start();
    else video.addEventListener("canplay", start, { once: true });

    return () => video.removeEventListener("canplay", start);
  }, []);

  return (
    <video
      ref={videoRef}
      className="create-profile-intro-video"
      autoPlay
      muted
      playsInline
      preload="auto"
      aria-label="Animación de Germina"
    >
      <source src="/germina-crear-perfil.mp4?v=20260828-2" type="video/mp4" />
    </video>
  );
}
