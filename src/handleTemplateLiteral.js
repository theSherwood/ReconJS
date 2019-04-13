"use strict";

(function() {
  const handleTemplateLiteral = (i, str) => {
    const templateLiteralStacks = [["`"]];
    let templateSegment = 1;
    let templateExpressionFlag = false;
    const templateExpression = [];
    for (let j = i + 1; j < str.length; j++) {
      switch (true) {
        case templateExpressionFlag:
          templateExpression.push(str[j]);
          if (str[j] === "}" && !isEscaped(j, str)) {
            templateLiteralStacks.push(
              ...split(templateExpression.slice(1, -1).join(""))
            );
            templateExpressionFlag = false;
            templateExpression.length = 0;
            templateSegment = templateLiteralStacks.length;
            templateLiteralStacks.push([]);
          }
          break;
        case str[j] === "$" && !isEscaped(j, str):
          if (j + 1 < str.length && str[j + 1] === "{") {
            templateExpressionFlag = true;
          }
          break;
        case str[j] === "`" && !isEscaped(j, str):
          templateLiteralStacks[templateSegment].push(str[j]);
          // data.segments.push(...templateLiteralStacks);
          return templateLiteralStacks;
        default:
          templateLiteralStacks[templateSegment].push(str[j]);
          break;
      }
    }
  };

  module.exports = handleTemplateLiteral;
})();
