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
          "SanitizeJS: removeFromWhitelist only accepts a string or an array of strings as an argument"
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
          "SanitizeJS: addToWhitelist only accepts a string or an array of strings as an argument"
        )
      );
    });
  });

  describe("checkWords", () => {
    let whitelist;

    beforeEach(() => {
      whitelist = vetting.getWhitelistObject();
    });

    it("returns an object containing vetted words checked against a whitelist", () => {
      const segments = ["let", " ", "const", " ", "=", " ", "2"];
      const labels = ["w", " ", "w", " ", " ", " ", "n"];

      const vetted = vetting.checkWords(segments, labels, whitelist);
      expect(vetted["let"]).toBe(1);
      expect(vetted["const"]).toBe(1);
      expect(vetted["="]).toBe(undefined);
      expect(vetted["2"]).toBe(undefined);
    });

    it("vets declared variables/function names as well", () => {
      // The form must be <let,const,var,function> <identifier>
      const segments = ["let", " ", "x", " ", "=", " ", "2"];
      const labels = ["w", " ", "w", " ", " ", " ", "n"];

      const vetted = vetting.checkWords(segments, labels, whitelist);
      expect(vetted["let"]).toBe(1);
      expect(vetted["x"]).toBe(2);
      expect(vetted["="]).toBe(undefined);
      expect(vetted["2"]).toBe(undefined);
    });

    it("vets words that are properties of allowedVariables", () => {
      const segments = ["foo", " ", "bar", " ", "=", " ", "2"];
      const labels = ["w", " ", "w", " ", " ", " ", "n"];

      const vetted = vetting.checkWords(segments, labels, whitelist, {
        foo: 1,
        bar: 1
      });
      expect(vetted["foo"]).toBe(1);
      expect(vetted["bar"]).toBe(1);
      expect(vetted["="]).toBe(undefined);
      expect(vetted["2"]).toBe(undefined);
    });

    it("allows words declared as variable identifiers or function names", () => {
      // The form must be <let,const,var,function> <identifier>
      const segments = [
        "let",
        " ",
        "foo",
        " ",
        "const",
        " ",
        "bar",
        " ",
        "var",
        " ",
        "word",
        " ",
        "function",
        " ",
        "nameOfFunction",
        "(",
        ")",
        " ",
        "{",
        "}"
      ];
      const labels = [
        "w",
        " ",
        "w",
        " ",
        "w",
        " ",
        "w",
        " ",
        "w",
        " ",
        "w",
        " ",
        "w",
        " ",
        "w",
        " ",
        " ",
        " ",
        " ",
        " "
      ];

      const vetted = vetting.checkWords(segments, labels, whitelist);
      expect(vetted["foo"]).toBe(2);
      expect(vetted["bar"]).toBe(2);
      expect(vetted["word"]).toBe(2);
      expect(vetted["nameOfFunction"]).toBe(2);
    });

    it("throws an error if an undeclared word is used that isn't on the whitelist or allowedVariables object or used as a property", () => {
      const segments = ["let", "Object", "harvey"];
      const labels = ["w", "w", "w"];

      expect(() => vetting.checkWords(segments, labels, whitelist)).toThrow(
        new Error(
          "SanitizeJS: The identifier(s) * harvey * are not permitted to be used, unless declared as variables"
        )
      );
    });

    describe("functions", () => {
      it("allows a single parameter passed into a function declaration", () => {
        const segments = [
          "function",
          " ",
          "foo",
          " ",
          "(",
          "bar",
          ")",
          " ",
          "{",
          "}"
        ];
        const labels = ["w", " ", "w", " ", " ", "w", " ", " ", " ", " "];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["foo"]).toBe(2);
        expect(vetted["bar"]).toBe(1);
        expect(vetted["function"]).toBe(1);
      });

      it("allows multiple parameters to be passed into a function declaration", () => {
        const segments = [
          "function",
          " ",
          "foo",
          " ",
          "(",
          "bar",
          ",",
          " ",
          "fulano",
          ")",
          " ",
          "{",
          "}"
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          " ",
          " "
        ];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["foo"]).toBe(2);
        expect(vetted["bar"]).toBe(1);
        expect(vetted["fulano"]).toBe(1);
        expect(vetted["function"]).toBe(1);
      });

      it("throws an error if functions are defined without brackets", () => {
        const segments = [
          "function",
          " ",
          "foo",
          " ",
          "(",
          "bar",
          ",",
          " ",
          "fulano",
          ")",
          " ",
          " "
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          " "
        ];

        expect(() => vetting.checkWords(segments, labels, whitelist)).toThrow(
          new Error(
            "SanitizeJS: Function declaration open bracket must follow the parameter list close parenthisis after one space"
          )
        );
      });

      it("throws an error if function parameters are assigned default values", () => {
        const segments = [
          "function",
          " ",
          "foo",
          " ",
          "(",
          "bar",
          " ",
          "=",
          " ",
          "fulano",
          ")",
          " "
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          " ",
          "w",
          " ",
          " "
        ];

        expect(() => vetting.checkWords(segments, labels, whitelist)).toThrow(
          new Error(
            "SanitizeJS: Function parameters must be passed as a simple, comma-separated list without default values"
          )
        );
      });

      it("allows for the use of parameters within the block of a function declaration", () => {
        const segments = [
          "function",
          " ",
          "foo",
          " ",
          "(",
          "bar",
          ",",
          " ",
          "fulano",
          ")",
          " ",
          "{",
          " ",
          "return",
          " ",
          "bar",
          " ",
          "+",
          " ",
          "fulano",
          " ",
          "}"
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          " ",
          " ",
          "w",
          " ",
          "w",
          " ",
          " ",
          " ",
          "w",
          " ",
          " "
        ];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["foo"]).toBe(2);
        expect(vetted["bar"]).toBe(1);
        expect(vetted["fulano"]).toBe(1);
        expect(vetted["function"]).toBe(1);
      });

      it("throws an error if a parameter is used outside of the block of the function definition", () => {
        const segments = [
          "function",
          " ",
          "foo",
          " ",
          "(",
          "bar",
          ",",
          " ",
          "fulano",
          ")",
          " ",
          "{",
          "}",
          ";",
          " ",
          "bar",
          " ",
          "+",
          " ",
          "fulano",
          " "
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          "w",
          " ",
          " ",
          " ",
          "w",
          " "
        ];

        expect(() => vetting.checkWords(segments, labels, whitelist)).toThrow(
          new Error(
            "SanitizeJS: The parameter * bar * is used outside of the appropriate function definition"
          )
        );
      });

      it("throws an error if the function definition is too short", () => {
        const segments = ["function", " ", "foo", " "];
        const labels = ["w", " ", "w", " "];

        expect(() => vetting.checkWords(segments, labels, whitelist)).toThrow(
          new Error("SanitizeJS: Function declaration error")
        );
      });

      it("allows a single parameter passed into an arrow function declaration with parentheses", () => {
        const segments = ["(", "bar", ")", " ", "=", ">", " ", "{", "}"];
        const labels = [" ", "w", " ", " ", " ", " ", " ", " ", " "];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["bar"]).toBe(1);
      });

      it("allows a single parameter passed into an arrow function declaration without parentheses", () => {
        const segments = [" ", "bar", " ", "=", ">", " ", "{", "}"];
        const labels = [" ", "w", " ", " ", " ", " ", " ", " "];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["bar"]).toBe(1);
      });

      it("allows a multiple parameters passed into an arrow function declaration with parentheses", () => {
        const segments = [
          "(",
          "foo",
          ",",
          " ",
          "bar",
          ")",
          " ",
          "=",
          ">",
          " ",
          "{",
          "}"
        ];
        const labels = [
          " ",
          "w",
          " ",
          " ",
          "w",
          " ",
          " ",
          " ",
          " ",
          " ",
          " ",
          " "
        ];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["foo"]).toBe(1);
        expect(vetted["bar"]).toBe(1);
      });

      it("throws an error if brackets are omitted on the arrow function expression", () => {
        const segments = [" ", "bar", " ", "=", ">", " ", ""];
        const labels = [" ", "w", " ", " ", " ", " ", ""];

        expect(() => vetting.checkWords(segments, labels, whitelist)).toThrow(
          new Error(
            "SanitizeJS: Arrow function declarations must use brackets. Function declaration open bracket must follow the arrow after one space"
          )
        );
      });

      it("throws an error if the arrow function expression is too short or if there is some other error", () => {
        const segments = [" ", "bar", " ", "=", ">", " "];
        const labels = [" ", "w", " ", " ", " ", " "];

        expect(() => vetting.checkWords(segments, labels, whitelist)).toThrow(
          new Error("SanitizeJS: Function declaration error")
        );
      });
    });

    describe("objects-and-properties", () => {
      it("throws no error, but also does not sign off on words used as a property, immediately after a dot operator", () => {
        const segments = ["foo", ".", "bar", " ", "=", " ", "2"];
        const labels = ["w", " ", "w", " ", " ", " ", "n"];

        const vetted = vetting.checkWords(segments, labels, whitelist, {
          foo: 1
        });
        expect(vetted["foo"]).toBe(1);
        expect(vetted["bar"]).toBe(undefined);
        expect(vetted["="]).toBe(undefined);
        expect(vetted["2"]).toBe(undefined);
      });

      it("throws an error if a property is used as an identifier", () => {
        const segments = ["foo", ".", "bar", " ", "=", " ", "bar"];
        const labels = ["w", " ", "w", " ", " ", " ", "w"];

        expect(() =>
          vetting.checkWords(segments, labels, whitelist, {
            foo: 1
          })
        ).toThrow(
          new Error(
            "SanitizeJS: The identifier(s) * bar * are not permitted to be used, unless declared as variables"
          )
        );
      });

      it("throws no error, but also doesn't sign off on a word that is used to initialize a property on an object literal", () => {
        const segments = [
          "const",
          " ",
          "foo",
          " ",
          "=",
          " ",
          "{",
          " ",
          "bar",
          ":",
          " ",
          "2",
          "}"
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          " ",
          " ",
          " ",
          "w",
          " ",
          " ",
          "n",
          " "
        ];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["foo"]).toBe(2);
        expect(vetted["bar"]).toBe(undefined);
      });

      it("handles non-space whitespace in object literal declarations", () => {
        const segments = [
          "const",
          " ",
          "foo",
          " ",
          "=",
          " ",
          "{",
          "\n",
          "bar",
          "\t",
          ":",
          " ",
          "2",
          "}"
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          " ",
          " ",
          " ",
          "w",
          " ",
          " ",
          " ",
          "n",
          " "
        ];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["foo"]).toBe(2);
        expect(vetted["bar"]).toBe(undefined);
      });

      it("handles multiple property declarations", () => {
        const segments = [
          "{",
          "\n",
          "foo",
          ":",
          " ",
          "1",
          ",",
          "\n",
          "bar",
          ":",
          " ",
          "2",
          "}"
        ];
        const labels = [
          " ",
          " ",
          "w",
          " ",
          " ",
          "n",
          " ",
          " ",
          "w",
          " ",
          " ",
          "n",
          " "
        ];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["foo"]).toBe(undefined);
        expect(vetted["bar"]).toBe(undefined);
      });

      it("handles nested property declarations", () => {
        const segments = [
          "{",
          "\n",
          "foo",
          ":",
          " ",
          "{",
          "\n",
          "bar",
          ":",
          " ",
          "2",
          "\n",
          "}",
          "\n",
          "}"
        ];
        const labels = [
          " ",
          " ",
          "w",
          " ",
          " ",
          " ",
          " ",
          "w",
          " ",
          " ",
          "n",
          " ",
          " ",
          " ",
          " "
        ];

        const vetted = vetting.checkWords(segments, labels, whitelist);
        expect(vetted["foo"]).toBe(undefined);
        expect(vetted["bar"]).toBe(undefined);
      });

      it("throws an error if a word used to initialize an object property is used as an identifier", () => {
        const segments = [
          "const",
          " ",
          "foo",
          " ",
          "=",
          " ",
          "{",
          " ",
          "bar",
          ":",
          " ",
          "2",
          "}",
          " ",
          "bar"
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          " ",
          " ",
          " ",
          "w",
          " ",
          " ",
          "n",
          " ",
          " ",
          "w"
        ];

        expect(() => vetting.checkWords(segments, labels, whitelist)).toThrow(
          new Error(
            "SanitizeJS: The identifier(s) * bar * are not permitted to be used, unless declared as variables"
          )
        );
      });
    });
    describe("comments", () => {
      it("throws an error if the string contains a single-line comment", () => {
        const segments = [
          "const",
          " ",
          "foo",
          " ",
          "=",
          " ",
          "2",
          " ",
          "/",
          "/",
          " ",
          "bar"
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          " ",
          "n",
          " ",
          " ",
          " ",
          " ",
          "w"
        ];

        expect(() => vetting.checkForComments(labels, segments)).toThrow(
          new Error("SanitizeJS: Comments are not allowed")
        );
      });

      it("throws an error if the string contains a multi-line comment", () => {
        const segments = [
          "const",
          " ",
          "foo",
          " ",
          "=",
          " ",
          "2",
          " ",
          "/",
          "*",
          " ",
          "bar",
          " ",
          "*",
          "/"
        ];
        const labels = [
          "w",
          " ",
          "w",
          " ",
          " ",
          " ",
          "n",
          " ",
          " ",
          " ",
          " ",
          "w",
          " ",
          " ",
          " "
        ];

        expect(() => vetting.checkForComments(labels, segments)).toThrow(
          new Error("SanitizeJS: Comments are not allowed")
        );
      });
    });
  });
});
