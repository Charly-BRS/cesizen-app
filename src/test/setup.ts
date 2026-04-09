// src/test/setup.ts
// Fichier de configuration global pour tous les tests Vitest.
//
// Ce fichier est exécuté une fois avant chaque suite de tests.
// Il ajoute les matchers jest-dom à Vitest, ce qui permet d'utiliser des
// assertions DOM comme toBeInTheDocument(), toHaveValue(), toBeDisabled()…

import '@testing-library/jest-dom';
