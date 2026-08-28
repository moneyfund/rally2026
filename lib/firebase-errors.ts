import { FirebaseError } from "firebase/app";

export function firebaseMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) return "Ocurrió un error inesperado. Intentá de nuevo.";

  const messages: Record<string, string> = {
    "auth/email-already-in-use": "Ese correo ya está registrado en Germina.",
    "auth/invalid-email": "Ingresá un correo válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
    "auth/operation-not-allowed": "Activá el proveedor Email/Password en Firebase Authentication.",
    "auth/too-many-requests": "Demasiados intentos. Esperá un momento e intentá nuevamente.",
    "auth/network-request-failed": "No pudimos conectar con Firebase. Revisá tu conexión.",
    "permission-denied": "Firebase rechazó la operación. Revisá las reglas de Firestore.",
  };

  return messages[error.code] ?? `Firebase: ${error.code}`;
}
