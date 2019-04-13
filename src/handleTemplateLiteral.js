"use strict";

(function() {
  const u = require("./utils");

  const handleTemplateLiteral = (i, str) => {
    const templateLiteralStacks = [["`"]];
    let templateSegment = 0;
    let templateExpressionFlag = false;
    const templateExpression = [];
    for (let j = i + 1; j < str.length; j++) {
      // debugger;
      switch (true) {
        case templateExpressionFlag:
          templateExpression.push(str[j]);
          if (str[j] === "}" && !u.isEscaped(j, str)) {
            templateLiteralStacks.push(
              ...split(templateExpression.slice(1, -1).join(""))
            );
            templateExpressionFlag = false;
            templateExpression.length = 0;
            templateSegment = templateLiteralStacks.length;
            templateLiteralStacks.push([]);
          }
          break;
        case str[j] === "$" && !u.isEscaped(j, str):
          if (j + 1 < str.length && str[j + 1] === "{") {
            templateExpressionFlag = true;
          }
          break;
        case str[j] === "`" && !u.isEscaped(j, str):
          templateLiteralStacks[templateSegment].push(str[j]);
          templateLiteralStacks[templateSegment] = templateLiteralStacks[
            templateSegment
          ].join("");
          return templateLiteralStacks;
        default:
          templateLiteralStacks[templateSegment].push(str[j]);
          break;
      }
    }
  };

  module.exports = handleTemplateLiteral;
})();
