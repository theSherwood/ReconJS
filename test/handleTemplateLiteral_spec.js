"use strict";

const { handleTemplateLiteral } = require("../src/split");

describe("handleTemplateLiteral", () => {
  it("treats simple `...` without expressions as one element", () => {
    expect(handleTemplateLiteral(0, "`Hello '[ ]' { } `")[1]).toEqual([
      "`Hello '[ ]' { } `"
    ]);
  });

  it("handles `...` with one, simple expression", () => {
    expect(handleTemplateLiteral(0, "`Hello ${a} { } `")[1]).toEqual([
      "`Hello ",
      "a",
      " { } `"
    ]);
  });

  it("handles `...` with one, complex expression", () => {
    expect(handleTemplateLiteral(0, "`Hello ${ a + b } { } `")[1]).toEqual([
      "`Hello ",
      " ",
      "a",
      " ",
      "+",
      " ",
      "b",
      " ",
      " { } `"
    ]);
  });

  it("handles `...` with two, simple expressions", () => {
    expect(handleTemplateLiteral(0, "`word ${a} word ${b} `")[1]).toEqual([
      "`word ",
      "a",
      " word ",
      "b",
      " `"
    ]);
  });

  it("handles `...` with two, complex expressions", () => {
    expect(
      handleTemplateLiteral(0, "`word ${a + b} word ${b - c} `")[1]
    ).toEqual([
      "`word ",
      "a",
      " ",
      "+",
      " ",
      "b",
      " word ",
      "b",
      " ",
      "-",
      " ",
      "c",
      " `"
    ]);
  });

  it("throws an error with nested expressions", () => {
    expect(() =>
      handleTemplateLiteral(0, "`word ${a + ` word ${c} word ` + b} word`")
    ).toThrow(new Error("SanitizeJS: Cannot parse nested template literals"));
  });

  it("throws an error if missing closing ` ", () => {
    expect(() => handleTemplateLiteral(0, "`word ${a + b} word")).toThrow(
      new Error("SanitizeJS: Missing closing ` ")
    );
  });
});
