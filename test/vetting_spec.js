"use strict";

const vetting = require("../src/vetting");

describe("vetting", () => {
  describe("removeFromWhitelist", () => {
    let whitelist;

    beforeEach(() => {
      whitelist = vetting.getWhitelistObject();
    });

    it("allows removing a string from the whitelist object", () => {
      expect(whitelist["do"]).toBe(1);
      vetting.removeFromWhitelist("do", whitelist);
      expect(whitelist["do"]).toEqual(undefined);
    });

    it("allows removing multiple entries with an array of strings", () => {
      expect(whitelist["do"]).toBe(1);
      expect(whitelist["let"]).toBe(1);
      expect(whitelist["const"]).toBe(1);
      vetting.removeFromWhitelist(["do", "let", "const"], whitelist);
      expect(whitelist["do"]).toEqual(undefined);
      expect(whitelist["let"]).toEqual(undefined);
      expect(whitelist["const"]).toEqual(undefined);
    });

    it("throws an error if something other than a string or array is passed as the first argument", () => {
      expect(() =>
        vetting.removeFromWhitelist({ let: "let" }, whitelist)
      ).toThrow(
        new Error(
          "removeFromWhitelist only accepts a string or an array of strings as an argument"
        )
      );
    });
  });

  describe("addToWhitelist", () => {
    let whitelist;

    beforeEach(() => {
      whitelist = vetting.getWhitelistObject();
    });
    it("allows adding a string to the whitelist object", () => {
      expect(whitelist["nonDefault"]).toEqual(undefined);
      vetting.addToWhitelist("nonDefault", whitelist);
      expect(whitelist["nonDefault"]).toEqual(1);
    });

    it("allows adding multiple entries with an array of strings", () => {
      expect(whitelist["nonD1"]).toBe(undefined);
      expect(whitelist["nonD2"]).toBe(undefined);
      expect(whitelist["nonD3"]).toBe(undefined);
      vetting.addToWhitelist(["nonD1", "nonD2", "nonD3"], whitelist);
      expect(whitelist["nonD1"]).toEqual(1);
      expect(whitelist["nonD2"]).toEqual(1);
      expect(whitelist["nonD3"]).toEqual(1);
    });

    it("throws an error if something other than a string or array is passed as the first argument", () => {
      expect(() => vetting.addToWhitelist({ nonD: "nonD" }, whitelist)).toThrow(
        new Error(
          "addToWhitelist only accepts a string or an array of strings as an argument"
        )
      );
    });
  });

  describe("checkWords", () => {
    let whitelist;

    beforeEach(() => {
      whitelist = vetting.getWhitelistObject();
    });
    it("returns an object containing passing words checked against a whitelist", () => {
      const segments = ["let", " ", "const", " ", "=", " ", "2"];
      const labels = ["w", " ", "w", " ", " ", " ", "n"];

      const passing = vetting.checkWords(segments, labels, whitelist);
      expect(passing["let"]).toBe(1);
      expect(passing["const"]).toBe(1);
      expect(passing["="]).toBe(undefined);
      expect(passing["2"]).toBe(undefined);
    });
    it("passes declared variables/function names as well", () => {
      const segments = ["let", " ", "x", " ", "=", " ", "2"];
      const labels = ["w", " ", "w", " ", " ", " ", "n"];

      const passing = vetting.checkWords(segments, labels, whitelist);
      expect(passing["let"]).toBe(1);
      expect(passing["x"]).toBe(1);
      expect(passing["="]).toBe(undefined);
      expect(passing["2"]).toBe(undefined);
    });
    it("passes words contained in an object of allowed variables", () => {
      const segments = ["foo", " ", "bar", " ", "=", " ", "2"];
      const labels = ["w", " ", "w", " ", " ", " ", "n"];

      const passing = vetting.checkWords(segments, labels, whitelist, {
        foo: 1,
        bar: 1
      });
      expect(passing["foo"]).toBe(1);
      expect(passing["bar"]).toBe(1);
      expect(passing["="]).toBe(undefined);
      expect(passing["2"]).toBe(undefined);
    });
    it("passes words used as a property, immediately after a dot operator", () => {
      const segments = ["foo", ".", "bar", " ", "=", " ", "2"];
      const labels = ["w", " ", "w", " ", " ", " ", "n"];

      const passing = vetting.checkWords(segments, labels, whitelist, {
        foo: 1
      });
      expect(passing["foo"]).toBe(1);
      expect(passing["bar"]).toBe(1);
      expect(passing["="]).toBe(undefined);
      expect(passing["2"]).toBe(undefined);
    });
    it("throws an error if an undeclared word is used that isn't on the whitelist or allowedVariables object or used as a property", () => {
      const segments = ["let", "const", "harvey"];
      const labels = ["w", "w", "w"];

      expect(() => vetting.checkWords(segments, labels, whitelist)).toThrow(
        new Error(
          "The words * harvey * are not permitted to be used, unless declared as variables"
        )
      );
    });
  });
});