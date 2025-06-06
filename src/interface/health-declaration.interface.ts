export default interface HealthDeclarationInput {
  name: string;
  temperature: number | string;
  symptoms: string[];
  contactWithInfected: boolean;
    createdAt?: string | number | Date | undefined; 
}