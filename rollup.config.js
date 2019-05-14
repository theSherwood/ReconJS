import commonjs from "rollup-plugin-commonjs";

export default {
  input: "./src/main.js",
  output: {
    name: "SanitizeJS",
    file: "bundle.js",
    format: "iife"
  },
  plugins: [
    commonjs({
      include: "src/**"
    })
  ]
};
