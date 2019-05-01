"use strict";

const SanitizeJS = require("../src/main");

describe("SanitizeJS", function() {
  describe("run", () => {
    let sjs;
    beforeEach(() => {
      sjs = new SanitizeJS();
    });

    it("evaluates th string as javascript if it passes vetting", () => {
      expect(sjs.run("3 + 4")).toBe(7);
    });
  });
});
