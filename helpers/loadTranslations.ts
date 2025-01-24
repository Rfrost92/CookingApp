// helpers/loadTranslations.ts
import translations from "../data/translations.json";

export const getTranslation = (language: string, key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
};
