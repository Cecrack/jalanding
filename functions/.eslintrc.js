module.exports = {
  env: {
    node: true, // Esto le dice a ESLint que el código está destinado a un entorno Node.js
    browser: true, // También puedes mantener el soporte para navegador si es necesario
  },
  extends: [
    "eslint:recommended",
    "plugin:@eslint/js/recommended" // Agregar tu configuración de ESLint recomendada
  ],
  parserOptions: {
    ecmaVersion: 12, // Asegúrate de usar una versión compatible de ECMAScript
    sourceType: "module", // Usa el tipo de módulo ES6 si estás usando import/export
  },
  rules: {
    // Puedes agregar o modificar reglas específicas aquí si lo necesitas
  }
};
