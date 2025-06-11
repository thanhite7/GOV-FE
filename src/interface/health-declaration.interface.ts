export default interface HealthDeclarationInput {
  name: string;
  temperature: number ;
  symptoms: string[];
  contactWithInfected: boolean;
    createdAt?: string | number | Date | undefined; 
}