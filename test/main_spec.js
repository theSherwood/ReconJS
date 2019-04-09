"use strict";

const Main = require("../src/main");

describe("Main", function() {
  it("can be constructed and used as an object", function() {
    var main = new Main();
    main.aProperty = 1;

    expect(main.aProperty).toBe(1);
  });

  describe("test", function() {
    var main;

    beforeEach(function() {
      main = new Main();
    });

    it("adds two numbers together", function() {
      expect(main.test(10, 1)).toBe(11);
    });
  });
});
