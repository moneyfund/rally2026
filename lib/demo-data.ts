export type TalentProfile = {
  id: number;
  name: string;
  role: string;
  category: string;
  location: string;
  department: string;
  description: string;
  skills: string[];
  rating: number;
  reviews: number;
  verified?: boolean;
  available?: boolean;
  initials: string;
  accent: string;
  mapPosition: { x: number; y: number };
};

export const categories = [
  "Todos",
  "Diseño",
  "Tecnología",
  "Fotografía",
  "Gastronomía",
  "Artesanía",
  "Servicios",
];

export const profiles: TalentProfile[] = [
  {
    id: 1,
    name: "Andrea López",
    role: "Diseñadora de marca",
    category: "Diseño",
    location: "Managua",
    department: "Managua",
    description: "Creo identidades visuales, contenido para redes y piezas que ayudan a pequeños negocios a verse profesionales.",
    skills: ["Branding", "Social media", "Ilustración"],
    rating: 4.9,
    reviews: 31,
    verified: true,
    available: true,
    initials: "AL",
    accent: "linear-gradient(135deg, #0b2b50, #2864a8)",
    mapPosition: { x: 51, y: 59 },
  },
  {
    id: 2,
    name: "Carlos Mena",
    role: "Desarrollador web",
    category: "Tecnología",
    location: "León",
    department: "León",
    description: "Desarrollo sitios web rápidos para emprendimientos, portafolios y comercios que quieren vender en línea.",
    skills: ["Web", "E-commerce", "Automatización"],
    rating: 4.8,
    reviews: 18,
    verified: true,
    available: true,
    initials: "CM",
    accent: "linear-gradient(135deg, #061a33, #174b80)",
    mapPosition: { x: 32, y: 46 },
  },
  {
    id: 3,
    name: "Valeria Ruiz",
    role: "Fotógrafa & creadora",
    category: "Fotografía",
    location: "Granada",
    department: "Granada",
    description: "Fotografía de producto, retratos y contenido audiovisual para marcas que quieren contar mejor su historia.",
    skills: ["Producto", "Retrato", "Video corto"],
    rating: 5,
    reviews: 24,
    verified: true,
    available: false,
    initials: "VR",
    accent: "linear-gradient(135deg, #15395f, #4e7ca8)",
    mapPosition: { x: 63, y: 65 },
  },
  {
    id: 4,
    name: "Dulce Norte",
    role: "Repostería artesanal",
    category: "Gastronomía",
    location: "Estelí",
    department: "Estelí",
    description: "Postres, pasteles personalizados y mesas dulces hechas por un emprendimiento joven del norte del país.",
    skills: ["Pastelería", "Eventos", "Pedidos"],
    rating: 4.9,
    reviews: 42,
    verified: false,
    available: true,
    initials: "DN",
    accent: "linear-gradient(135deg, #0d2847, #315d89)",
    mapPosition: { x: 49, y: 29 },
  },
  {
    id: 5,
    name: "Taller Güegüense",
    role: "Artesanía contemporánea",
    category: "Artesanía",
    location: "Masaya",
    department: "Masaya",
    description: "Transformamos técnicas tradicionales en piezas decorativas y regalos con identidad nicaragüense.",
    skills: ["Madera", "Cuero", "Personalizados"],
    rating: 4.7,
    reviews: 15,
    verified: true,
    available: true,
    initials: "TG",
    accent: "linear-gradient(135deg, #102c4c, #557899)",
    mapPosition: { x: 59, y: 61 },
  },
  {
    id: 6,
    name: "Samuel Pérez",
    role: "Barbero profesional",
    category: "Servicios",
    location: "Matagalpa",
    department: "Matagalpa",
    description: "Cortes modernos, asesoría de imagen y servicio para eventos. Atención con reserva y a domicilio.",
    skills: ["Barbería", "Imagen", "A domicilio"],
    rating: 4.9,
    reviews: 36,
    verified: true,
    available: true,
    initials: "SP",
    accent: "linear-gradient(135deg, #071b34, #386288)",
    mapPosition: { x: 60, y: 36 },
  },
];

export const stats = [
  { value: "1 plataforma", label: "para mostrar lo que sabés hacer" },
  { value: "17 departamentos", label: "con potencial para conectar" },
  { value: "2 públicos", label: "talento y quienes lo necesitan" },
];
