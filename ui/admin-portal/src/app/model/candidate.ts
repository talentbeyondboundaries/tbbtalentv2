import {User} from "./user";
import {Country} from "./country";
import {Nationality} from "./nationality";

export interface Candidate {
  id: number;
  candidateNumber: string;
  gender: string;
  dob: Date;
  address1: string;
  city: string;
  country: Country;
  yearOfArrival: number;
  nationality: Nationality;
  phone: string;
  whatsapp: string;
  user: User;
}
