"use strict";

const Main = require("../src/main");

describe("Main", function() {
  it("can be constructed and used as an object", function() {
    var main = new Main();
    main.aProperty = 1;

    expect(main.aProperty).toBe(1);
  });

  describe("split", function() {
    var main;

    beforeEach(function() {
      main = new Main();
    });

    it("adds some non-word, -digit, and -quote char in a string to an array and returns it", () => {
      expect(main.$split("{[-=+,.]} ")).toEqual([
        "{",
        "[",
        "-",
        "=",
        "+",
        ",",
        ".",
        "]",
        "}",
        " "
      ]);
    });

    // Words
    it("returns an array in which word chars in series are added as one string", () => {
      expect(main.$split("one two ")).toEqual(["one", " ", "two", " "]);
    });

    it("completes word if the final char is part of a word", () => {
      expect(main.$split("one two")).toEqual(["one", " ", "two"]);
    });

    it("considers '_' and '$' to be word characters", () => {
      expect(main.$split("$o_ne _t$wo _$ $_")).toEqual([
        "$o_ne",
        " ",
        "_t$wo",
        " ",
        "_$",
        " ",
        "$_"
      ]);
    });

    it("considers digits to be word characters if they are not the first char in a word", () => {
      expect(main.$split("o1ne t2wo")).toEqual(["o1ne", " ", "t2wo"]);
    });

    it("considers digits to not be word characters if they are the first char in a word", () => {
      expect(main.$split("1one 2two")).toEqual(["1", "one", " ", "2", "two"]);
    });

    // Numbers
    it("returns an array in which digit chars in series are added as one string", () => {
      expect(main.$split("123 456 ")).toEqual(["123", " ", "456", " "]);
    });
  });
});
