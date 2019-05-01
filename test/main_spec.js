"use strict";

const SanitizeJS = require("../src/main");

describe("SanitizeJS", function() {
  it("can be constructed and used as an object", function() {
    const s = new SanitizeJS();
    s.aProperty = 1;

    expect(s.aProperty).toBe(1);
  });

  describe("removeFromWhitelist", () => {
    let s;
    beforeEach(() => {
      s = new SanitizeJS();
    });

    it("removes a word from the default whitelist", () => {
      expect(s.whitelist["do"]).toBe(1);
      expect(s.whitelist["let"]).toBe(1);
      s.removeFromWhitelist("do");
      expect(s.whitelist["do"]).toEqual(undefined);
      expect(s.whitelist["let"]).toBe(1);
    });

    it("removes words from the default whitelist", () => {
      expect(s.whitelist["do"]).toBe(1);
      expect(s.whitelist["let"]).toBe(1);
      expect(s.whitelist["const"]).toBe(1);
      expect(s.whitelist["for"]).toBe(1);
      s.removeFromWhitelist(["do", "let", "const"]);
      expect(s.whitelist["do"]).toEqual(undefined);
      expect(s.whitelist["let"]).toEqual(undefined);
      expect(s.whitelist["const"]).toEqual(undefined);
      expect(s.whitelist["for"]).toBe(1);
    });

    it("removes all words from the default whitelist if an array of the whitelist keys is passed in", () => {
      expect(s.whitelist["do"]).toBe(1);
      expect(s.whitelist["let"]).toBe(1);
      expect(s.whitelist["const"]).toBe(1);
      expect(s.whitelist["for"]).toBe(1);
      s.removeFromWhitelist(Object.keys(s.whitelist));
      expect(s.whitelist["do"]).toEqual(undefined);
      expect(s.whitelist["let"]).toEqual(undefined);
      expect(s.whitelist["const"]).toEqual(undefined);
      expect(s.whitelist["for"]).toEqual(undefined);
      expect(Object.keys(s.whitelist).length).toBe(0);
    });
  });
  describe("addToWhitelist", () => {
    let s;
    beforeEach(() => {
      s = new SanitizeJS();
    });

    it("adds a word to the default whitelist", () => {
      expect(s.whitelist["do"]).toBe(1);
      expect(s.whitelist["foo"]).toEqual(undefined);
      s.addToWhitelist("foo");
      expect(s.whitelist["do"]).toBe(1);
      expect(s.whitelist["foo"]).toBe(1);
    });

    it("adds words to the default whitelist", () => {
      expect(s.whitelist["do"]).toBe(1);
      expect(s.whitelist["goofeth"]).toEqual(undefined);
      expect(s.whitelist["foo"]).toEqual(undefined);
      expect(s.whitelist["bar"]).toEqual(undefined);
      s.addToWhitelist(["do", "foo", "bar", "goofeth"]);
      expect(s.whitelist["foo"]).toBe(1);
      expect(s.whitelist["bar"]).toBe(1);
      expect(s.whitelist["goofeth"]).toBe(1);
      expect(s.whitelist["do"]).toBe(1);
    });
  });
  describe("resetWhitelist", () => {
    let s;
    beforeEach(() => {
      s = new SanitizeJS();
    });

    it("resets whitelist to default", () => {
      expect(s.whitelist["do"]).toBe(1);
      expect(s.whitelist["foo"]).toEqual(undefined);
      s.addToWhitelist("foo");
      s.removeFromWhitelist("do");
      expect(s.whitelist["do"]).toEqual(undefined);
      expect(s.whitelist["foo"]).toBe(1);
      s.resetWhitelist();
      expect(s.whitelist["do"]).toBe(1);
      expect(s.whitelist["foo"]).toEqual(undefined);
    });
  });
});

//   describe("$split", function() {
//     var main;

//     beforeEach(function() {
//       main = new Main();
//     });

//     it("adds some non-word, -digit, and -quote char in a string to an array and returns it", () => {
//       expect(main.$split("{[-=+,.]} ")).toEqual([
//         "{",
//         "[",
//         "-",
//         "=",
//         "+",
//         ",",
//         ".",
//         "]",
//         "}",
//         " "
//       ]);
//     });

//     // Words
//     it("returns an array in which word chars in series are added as one string", () => {
//       expect(main.$split("one two ")).toEqual(["one", " ", "two", " "]);
//     });

//     it("completes word if the final char is part of a word", () => {
//       expect(main.$split("one two")).toEqual(["one", " ", "two"]);
//     });

//     it("considers '_' and '$' to be word characters", () => {
//       expect(main.$split("$o_ne _t$wo _$ $_")).toEqual([
//         "$o_ne",
//         " ",
//         "_t$wo",
//         " ",
//         "_$",
//         " ",
//         "$_"
//       ]);
//     });

//     it("considers digits to be word characters if they are not the first char in a word", () => {
//       expect(main.$split("o1ne t2wo")).toEqual(["o1ne", " ", "t2wo"]);
//     });

//     it("considers digits to not be word characters if they are the first char in a word", () => {
//       expect(main.$split("1one 2two")).toEqual(["1", "one", " ", "2", "two"]);
//     });

//     // Numbers
//     it("returns an array in which digit chars in series are added as one string", () => {
//       expect(main.$split("123 456 ")).toEqual(["123", " ", "456", " "]);
//     });

//     it("will include up to exactly 1 period ('.') as part of a number", () => {
//       expect(main.$split("1.23 .456 ")).toEqual(["1.23", " ", ".456", " "]);
//     });
//   });
// });
