export interface ProfileData {
  name: string;
  clinicName: string;
  profilePhoto: string;
  about: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  instagram: string;
  location: string;
  rating: number;
  dogsHelped: number;
  story: string | null;
  type: "veterinarian" | "shelter" | "rescuer";
}

export interface Campaign {
  dogId: string;
  dogName: string;
  dogImage: string;
  raised: number;
  goal: number;
  spent: number;
  status: string;
  createdDate: string;
}

export interface Dog {
  id: string;
  name: string;
  images: string[];
  story: string;
  currentCondition: string;
  location: string;
  isEmergency: boolean;
  needsSurgery: boolean;
  medicalTreatment: string;
  medicalRecovery: string;
  readyForAdoption: boolean;
  createdAt: string;
}
