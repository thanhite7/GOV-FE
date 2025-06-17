export default interface HealthDeclarationInput {
  _id?: string;
  name: string;
  temperature: number ;
  symptoms: string[];
  contactWithInfected: boolean;
  createdAt?: string | number | Date | undefined; 
  updatedAt?: string | number | Date | undefined;
}