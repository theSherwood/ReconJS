"use strict";

const handleTemplateLiteral = require("../src/handleTemplateLiteral");

describe("handleTemplateLiteral", () => {
  it("treats simple `...` without expressions as one element", () => {
    expect(handleTemplateLiteral(0, "`Hello '[ ]' { } `")).toEqual([
      "`Hello '[ ]' { } `"
    ]);
  });

  it("handles`...` with one, simple expression", () => {
    expect(handleTemplateLiteral(0, "`Hello ${a} { } `")).toEqual([
      "`Hello ",
      "a",
      " { } `"
    ]);
  });

  it("handles`...` with one, complex expression", () => {
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
});
