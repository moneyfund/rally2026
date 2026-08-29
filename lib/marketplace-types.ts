export type ProfileKind = "persona" | "negocio" | "empresa";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type JobStatus = "active" | "paused" | "closed";
export type ApplicationStatus = "sent" | "viewed" | "shortlisted" | "rejected";

export type JobPost = {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  category: string;
  modality: string;
  location: string;
  jobType: string;
  salary: string;
  description: string;
  requirements: string;
  benefits: string;
  status: JobStatus;
  featured: boolean;
  publishedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantProfileId: string;
  message: string;
  status: ApplicationStatus;
  createdAt?: unknown;
};
