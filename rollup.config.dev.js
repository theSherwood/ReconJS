import resolve from "rollup-plugin-node-resolve";

export default {
  input: "./src/recon.js",
  output: {
    name: "Recon",
    file: "reconBundle.js",
    format: "esm"
  },
  watch: {
    include: ["src/**", "rollup.config.dev.js"]
  },
  plugins: [resolve()]
};
