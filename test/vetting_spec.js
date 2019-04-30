"use strict";

const { vetMethods } = require("../src/vetting");

describe("vetMethods", () => {
  describe("unvet", () => {
    let vettedHash;

    beforeEach(() => {
      vettedHash = vetMethods.getDefaultVetted();
    });

    it("allows removing a string from the vettedHash object", () => {
      expect(vettedHash["do"]).toBe(1);
      vetMethods.unvet("do", vettedHash);
      expect(vettedHash["do"]).toEqual(undefined);
    });

    it("allows removing multiple entries with an array of strings", () => {
      expect(vettedHash["do"]).toBe(1);
      expect(vettedHash["let"]).toBe(1);
      expect(vettedHash["const"]).toBe(1);
      vetMethods.unvet(["do", "let", "const"], vettedHash);
      expect(vettedHash["do"]).toEqual(undefined);
      expect(vettedHash["let"]).toEqual(undefined);
      expect(vettedHash["const"]).toEqual(undefined);
    });
  });
});
