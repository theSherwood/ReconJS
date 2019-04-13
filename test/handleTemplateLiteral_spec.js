"use strict";

const handleTemplateLiteral = require("../src/handleTemplateLiteral");

describe("handleTemplateLiteral", () => {
  it("treats simple `...` without expressions as one element", () => {
    expect(handleTemplateLiteral(0, "`Hello '[ ]' { } `")).toEqual([
      "`Hello '[ ]' { } `"
    ]);
  });
});
