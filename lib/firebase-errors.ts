import { FirebaseError } from "firebase/app";

export function firebaseMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) return "Ocurrió un error inesperado. Intentá de nuevo.";

  const messages: Record<string, string> = {
    "auth/email-already-in-use": "Ese correo ya está registrado en Germina.",
    "auth/invalid-email": "Ingresá un correo válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
    "auth/operation-not-allowed": "Ese método de acceso todavía no está activado en Firebase Authentication.",
    "auth/configuration-not-found": "Terminá de configurar Firebase Authentication en la consola de Firebase.",
    "auth/unauthorized-domain": "Agregá rally-nicaragua-2026.vercel.app a los dominios autorizados de Firebase Authentication.",
    "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de terminar. Podés intentarlo nuevamente.",
    "auth/popup-blocked": "El navegador bloqueó la ventana de Google. Permití ventanas emergentes e intentá de nuevo.",
    "auth/cancelled-popup-request": "Se canceló el intento anterior de acceso con Google. Intentá nuevamente.",
    "auth/account-exists-with-different-credential": "Ya existe una cuenta con ese correo usando otro método de acceso. Entrá con el método original.",
    "auth/too-many-requests": "Demasiados intentos. Esperá un momento e intentá nuevamente.",
    "auth/network-request-failed": "No pudimos conectar con Firebase. Revisá tu conexión.",
    "permission-denied": "Firebase rechazó la operación. Revisá las reglas de Firestore.",
  };

  return messages[error.code] ?? `Firebase: ${error.code}`;
}
