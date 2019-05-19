"use strict";

const SanitizeJS = require("../src/main");

describe("SanitizeJS", function() {
  describe("run", () => {
    let sjs;
    beforeEach(() => {
      sjs = new SanitizeJS();
    });

    it("evaluates the string as javascript if it passes vetting", () => {
      expect(sjs.run("3 + 4")).toBe(7);
    });

    it("can read variables passed into an allowedVariables object", () => {
      let x = 5;
      expect(sjs.run("x + 4", { x })).toBe(9);
    });

    it("throws an error message if variables are not passed in to the allowedVariables object", () => {
      let x = 5;
      expect(sjs.run("x + 4")).toEqual(
        "SanitizeJS: The identifier(s) * x * are not permitted to be used, unless declared as variables"
      );
    });

    it("throws an error message if a keyword is not whitelisted", () => {
      expect(sjs.run("window")).toEqual(
        "SanitizeJS: The identifier(s) * window * are not permitted to be used, unless declared as variables"
      );
    });

    it("handles multi-line strings with semicolons", () => {
      expect(
        sjs.run(`
      let x = 2;
      let y = 137;
      y * x;
      `)
      ).toEqual(274);
    });

    it("handles multi-line strings without semicolons", () => {
      expect(
        sjs.run(`
      let x = 2
      let y = 137
      y * x
      `)
      ).toEqual(274);
    });
  });
});
