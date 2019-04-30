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

    it("throws an error if something other than a string or array is passed as the first argument", () => {
      expect(() => vetMethods.unvet({ let: "let" }, vettedHash)).toThrow(
        new Error(
          "unvet only accepts a string or an array of strings as an argument"
        )
      );
    });
  });
  describe("vetAdditional", () => {
    let vettedHash;

    beforeEach(() => {
      vettedHash = vetMethods.getDefaultVetted();
    });
    it("allows adding a string to the vettedHash object", () => {
      expect(vettedHash["nonDefault"]).toEqual(undefined);
      vetMethods.vetAdditional("nonDefault", vettedHash);
      expect(vettedHash["nonDefault"]).toEqual(1);
    });

    it("allows adding multiple entries with an array of strings", () => {
      expect(vettedHash["nonD1"]).toBe(undefined);
      expect(vettedHash["nonD2"]).toBe(undefined);
      expect(vettedHash["nonD3"]).toBe(undefined);
      vetMethods.vetAdditional(["nonD1", "nonD2", "nonD3"], vettedHash);
      expect(vettedHash["nonD1"]).toEqual(1);
      expect(vettedHash["nonD2"]).toEqual(1);
      expect(vettedHash["nonD3"]).toEqual(1);
    });

    it("throws an error if something other than a string or array is passed as the first argument", () => {
      expect(() =>
        vetMethods.vetAdditional({ nonD: "nonD" }, vettedHash)
      ).toThrow(
        new Error(
          "vetAdditional only accepts a string or an array of strings as an argument"
        )
      );
    });
  });
});
