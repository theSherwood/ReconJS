import resolve from "rollup-plugin-node-resolve";

export default {
  input: "./src/recon.js",
  output: {
    name: "recon",
    file: "reconBundle.js",
    format: "iife"
  },
  watch: {
    include: "src/**"
  },
  plugins: [resolve()]
};
