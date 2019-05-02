"use strict";

const SanitizeJS = require("../src/main");

describe("SanitizeJS", function() {
  it("can be constructed and used as an object", function() {
    const sjs = new SanitizeJS();
    sjs.aProperty = 1;

    expect(sjs.aProperty).toBe(1);
  });

  describe("removeFromWhitelist", () => {
    let sjs;
    beforeEach(() => {
      sjs = new SanitizeJS();
    });

    it("removes a word from the default whitelist", () => {
      expect(sjs.whitelist["do"]).toBe(1);
      expect(sjs.whitelist["let"]).toBe(1);
      sjs.removeFromWhitelist("do");
      expect(sjs.whitelist["do"]).toEqual(undefined);
      expect(sjs.whitelist["let"]).toBe(1);
    });

    it("removes words from the default whitelist", () => {
      expect(sjs.whitelist["do"]).toBe(1);
      expect(sjs.whitelist["let"]).toBe(1);
      expect(sjs.whitelist["const"]).toBe(1);
      expect(sjs.whitelist["for"]).toBe(1);
      sjs.removeFromWhitelist(["do", "let", "const"]);
      expect(sjs.whitelist["do"]).toEqual(undefined);
      expect(sjs.whitelist["let"]).toEqual(undefined);
      expect(sjs.whitelist["const"]).toEqual(undefined);
      expect(sjs.whitelist["for"]).toBe(1);
    });

    it("removes all words from the default whitelist if an array of the whitelist keys is passed in", () => {
      expect(sjs.whitelist["do"]).toBe(1);
      expect(sjs.whitelist["let"]).toBe(1);
      expect(sjs.whitelist["const"]).toBe(1);
      expect(sjs.whitelist["for"]).toBe(1);
      sjs.removeFromWhitelist(Object.keys(sjs.whitelist));
      expect(sjs.whitelist["do"]).toEqual(undefined);
      expect(sjs.whitelist["let"]).toEqual(undefined);
      expect(sjs.whitelist["const"]).toEqual(undefined);
      expect(sjs.whitelist["for"]).toEqual(undefined);
      expect(Object.keys(sjs.whitelist).length).toBe(0);
    });
  });
  describe("addToWhitelist", () => {
    let sjs;
    beforeEach(() => {
      sjs = new SanitizeJS();
    });

    it("adds a word to the default whitelist", () => {
      expect(sjs.whitelist["do"]).toBe(1);
      expect(sjs.whitelist["foo"]).toEqual(undefined);
      sjs.addToWhitelist("foo");
      expect(sjs.whitelist["do"]).toBe(1);
      expect(sjs.whitelist["foo"]).toBe(1);
    });

    it("adds words to the default whitelist", () => {
      expect(sjs.whitelist["do"]).toBe(1);
      expect(sjs.whitelist["goofeth"]).toEqual(undefined);
      expect(sjs.whitelist["foo"]).toEqual(undefined);
      expect(sjs.whitelist["bar"]).toEqual(undefined);
      sjs.addToWhitelist(["do", "foo", "bar", "goofeth"]);
      expect(sjs.whitelist["foo"]).toBe(1);
      expect(sjs.whitelist["bar"]).toBe(1);
      expect(sjs.whitelist["goofeth"]).toBe(1);
      expect(sjs.whitelist["do"]).toBe(1);
    });
  });
  describe("resetWhitelist", () => {
    let sjs;
    beforeEach(() => {
      sjs = new SanitizeJS();
    });

    it("resets whitelist to default", () => {
      expect(sjs.whitelist["do"]).toBe(1);
      expect(sjs.whitelist["foo"]).toEqual(undefined);
      sjs.addToWhitelist("foo");
      sjs.removeFromWhitelist("do");
      expect(sjs.whitelist["do"]).toEqual(undefined);
      expect(sjs.whitelist["foo"]).toBe(1);
      sjs.resetWhitelist();
      expect(sjs.whitelist["do"]).toBe(1);
      expect(sjs.whitelist["foo"]).toEqual(undefined);
    });
  });
});
