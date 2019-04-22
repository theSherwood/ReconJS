"use strict";

const { handleTemplateLiteral } = require("../src/split");

describe("handleTemplateLiteral", () => {
  it("treats simple `...` without expressions as one element", () => {
    expect(handleTemplateLiteral(0, "`Hello '[ ]' { } `")).toEqual([
      "`Hello '[ ]' { } `"
    ]);
  });

  it("handles `...` with one, simple expression", () => {
    expect(handleTemplateLiteral(0, "`Hello ${a} { } `")).toEqual([
      "`Hello ",
      "a",
      " { } `"
    ]);
  });

  it("handles `...` with one, complex expression", () => {
    expect(handleTemplateLiteral(0, "`Hello ${ a + b } { } `")).toEqual([
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
    expect(handleTemplateLiteral(0, "`word ${a} word ${b} `")).toEqual([
      "`word ",
      "a",
      " word ",
      "b",
      " `"
    ]);
  });

  it("handles `...` with two, complex expressions", () => {
    expect(handleTemplateLiteral(0, "`word ${a + b} word ${b - c} `")).toEqual([
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
    ).toThrow(new Error("Cannot parse nested template literals"));
  });
});
