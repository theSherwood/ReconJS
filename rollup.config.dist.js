import resolve from "rollup-plugin-node-resolve";

export default [
  {
    input: "./src/recon.js",
    output: {
      name: "Recon",
      file: "./dist/recon.js",
      format: "cjs",
      compact: true
    },
    plugins: []
  },
  {
    input: "./src/recon.js",
    output: {
      name: "Recon",
      file: "./dist/recon_with_acorn.js",
      format: "cjs",
      compact: true
    },
    plugins: [resolve()]
  }
];
