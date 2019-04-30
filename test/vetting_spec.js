"use strict";

const { vetMethods } = require("../src/vetting");

describe("vetMethods", () => {
  let vettedHash;

  beforeEach(() => {
    vettedHash = vetMethods.getDefaultVetted();
  });

  describe("unvet", () => {
    it("allows removing a string from the vettedHash object", () => {
      expect(vettedHash["do"]).toBe(1);
      vetMethods.unvet("do", vettedHash);
      expect(vettedHash["do"]).toEqual(undefined);
    });
  });
});
