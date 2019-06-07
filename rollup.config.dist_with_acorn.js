import compiler from "@ampproject/rollup-plugin-closure-compiler";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "./src/recon.js",
  output: {
    name: "Recon",
    file: "./dist/bundled_with_acorn.min.js",
    format: "esm",
    compact: true
  },
  plugins: [resolve(), compiler()]
};
