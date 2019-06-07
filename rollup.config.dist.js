import compiler from "@ampproject/rollup-plugin-closure-compiler";

export default {
  input: "./src/recon.js",
  output: {
    name: "Recon",
    file: "./dist/bundle.min.js",
    format: "esm",
    compact: true
  },
  plugins: [compiler()]
};
