import resolve from "rollup-plugin-node-resolve";
// import commonjs from "rollup-plugin-commonjs";

export default {
  input: "./src/recon.js",
  output: {
    name: "recon",
    file: "reconBundle.js",
    format: "iife"
  },
  // watch: {
  //   include: "src/**"
  // },
  plugins: [
    resolve()
    // commonjs({
    //   include: ["node_modules/**"]
    // })
  ]
};
