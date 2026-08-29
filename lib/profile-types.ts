export type ProfileCoordinates = {
  lat: number;
  lng: number;
};

export type SocialLinks = {
  website: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  storagePath: string;
  type: "image";
  createdAt: number;
};

export type VentureProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  availability: string;
  imageUrl: string;
  storagePath: string;
};

export type ProfileKind = "persona" | "negocio" | "empresa";

export type GerminaProfile = {
  ownerId: string;
  kind: ProfileKind;
  name: string;
  category: string;
  profession: string;
  headline: string;
  description: string;
  location: string;
  coordinates: ProfileCoordinates | null;
  locationPublic: boolean;
  phone: string;
  socialLinks: SocialLinks;
  services: string[];
  products: VentureProduct[];
  ventureNeeds: string[];
  avatarUrl: string;
  googlePhotoUrl: string;
  coverUrl: string;
  portfolio: PortfolioItem[];
  available: boolean;
  verified: boolean;
  status: string;
  legalName: string;
  companyEmail: string;
  website: string;
  representativeName: string;
  representativeRole: string;
};

export type LegalDocument = {
  id: string;
  fileName: string;
  storagePath: string;
  contentType: string;
  size: number;
  documentType: string;
};

export const emptySocialLinks: SocialLinks = {
  website: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  tiktok: "",
};

export function emptyProfile(uid = ""): GerminaProfile {
  return {
    ownerId: uid,
    kind: "persona",
    name: "",
    category: "Servicios",
    profession: "",
    headline: "",
    description: "",
    location: "",
    coordinates: null,
    locationPublic: false,
    phone: "",
    socialLinks: { ...emptySocialLinks },
    services: [],
    products: [],
    ventureNeeds: [],
    avatarUrl: "",
    googlePhotoUrl: "",
    coverUrl: "",
    portfolio: [],
    available: true,
    verified: false,
    status: "active",
    legalName: "",
    companyEmail: "",
    website: "",
    representativeName: "",
    representativeRole: "",
  };
}
