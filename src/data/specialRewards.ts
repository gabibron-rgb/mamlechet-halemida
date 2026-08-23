export type SpecialPetDefinition = {
  id: string;
  nameHe: string;
  emoji: string;
  descriptionHe: string;
  originHe: string;
};

export const SPECIAL_PETS: Record<string, SpecialPetDefinition> = {
  pet_magical_unicorn: {
    id: 'pet_magical_unicorn',
    nameHe: 'חד־הקרן הקסום',
    emoji: '🦄',
    descriptionHe:
      'יצור מסע נדיר שהגיע מהיער הקסום. אי אפשר לקנות אותו או לקבל אותו מקופסה.',
    originHe: 'מסע חד־הקרן',
  },
};
