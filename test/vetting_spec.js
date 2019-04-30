"use strict";

const vetting = require("../src/vetting");

describe("vetting", () => {
  describe("unvet", () => {
    let whitelist;

    beforeEach(() => {
      whitelist = vetting.getDefaultVetted();
    });

    it("allows removing a string from the whitelist object", () => {
      expect(whitelist["do"]).toBe(1);
      vetting.unvet("do", whitelist);
      expect(whitelist["do"]).toEqual(undefined);
    });

    it("allows removing multiple entries with an array of strings", () => {
      expect(whitelist["do"]).toBe(1);
      expect(whitelist["let"]).toBe(1);
      expect(whitelist["const"]).toBe(1);
      vetting.unvet(["do", "let", "const"], whitelist);
      expect(whitelist["do"]).toEqual(undefined);
      expect(whitelist["let"]).toEqual(undefined);
      expect(whitelist["const"]).toEqual(undefined);
    });

    it("throws an error if something other than a string or array is passed as the first argument", () => {
      expect(() => vetting.unvet({ let: "let" }, whitelist)).toThrow(
        new Error(
          "unvet only accepts a string or an array of strings as an argument"
        )
      );
    });
  });
  describe("vetAdditional", () => {
    let whitelist;

    beforeEach(() => {
      whitelist = vetting.getDefaultVetted();
    });
    it("allows adding a string to the whitelist object", () => {
      expect(whitelist["nonDefault"]).toEqual(undefined);
      vetting.vetAdditional("nonDefault", whitelist);
      expect(whitelist["nonDefault"]).toEqual(1);
    });

    it("allows adding multiple entries with an array of strings", () => {
      expect(whitelist["nonD1"]).toBe(undefined);
      expect(whitelist["nonD2"]).toBe(undefined);
      expect(whitelist["nonD3"]).toBe(undefined);
      vetting.vetAdditional(["nonD1", "nonD2", "nonD3"], whitelist);
      expect(whitelist["nonD1"]).toEqual(1);
      expect(whitelist["nonD2"]).toEqual(1);
      expect(whitelist["nonD3"]).toEqual(1);
    });

    it("throws an error if something other than a string or array is passed as the first argument", () => {
      expect(() => vetting.vetAdditional({ nonD: "nonD" }, whitelist)).toThrow(
        new Error(
          "vetAdditional only accepts a string or an array of strings as an argument"
        )
      );
    });
  });
});
