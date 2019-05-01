"use strict";

/*
DEV NOTES:

This needs to be more dynamic. Function calls rather than switch cases.

TODOS:

* Make a push function that looks for flags before it pushes and can more easily redirect to other places on the decision tree
* Ignore comments, both single- and multi-line

*/

(function() {
  const u = require("./utils");

  function split(javascriptStr) {
    const str = javascriptStr;
    const segments = [];
    const labels = [];

    // Segments in progress
    const wordStack = [];
    const numberStack = [];
    const stringStack = [];

    const flags = {
      numberFlags: {
        haveSeenPeriod: false
      },
      stringFlags: {
        templateLiteral: false,
        templateLitExpIndex: -1 // template literal expression ${...}
      }
    };

    let i = 0;

    const primarySwitch = char => {
      switch (true) {
        case wordStack.length > 0: // a word is underway
          inWordStack(char);
          break;
        case numberStack.length > 0: // a number is underway
          inNumberStack(char);
          break;
        case stringStack.length > 0: // a string is underway
          inStringStack(char);
          break;
        default:
          emptyStacks(char);
      }
    };

    const inWordStack = char => {
      switch (true) {
        case /[\w$]/.test(char): // letter, _, $, or digit
          wordStack.push(char);
          break;
        case /['"]/.test(char):
          // if (char === "`") flags.stringFlags.templateLiteral = true;
          segments.push(wordStack.join(""));
          labels.push("w");
          wordStack.length = 0;
          stringStack.push(char);
          break;
        case /[`]/.test(char):
          segments.push(wordStack.join(""));
          labels.push("w");
          wordStack.length = 0;
          const [
            j,
            templateLiteralSegments,
            templateLabels
          ] = handleTemplateLiteral(i, str);
          segments.push(...templateLiteralSegments);
          labels.push(...templateLabels);
          i = j;
          break;
        default:
          segments.push(wordStack.join(""));
          labels.push("w");
          wordStack.length = 0;
          primarySwitch(char);
          break;
      }
    };

    const inNumberStack = char => {
      switch (true) {
        case /[\d]/.test(char):
          numberStack.push(char);
          break;
        case /\./.test(char):
          if (flags.numberFlags.haveSeenPeriod) {
            // there's already a period
            segments.push(numberStack.join(""));
            labels.push("n");
            numberStack.length = 0;
          }
          numberStack.push(char);
          flags.numberFlags.haveSeenPeriod = !flags.numberFlags.haveSeenPeriod;
          break;
        case /[\w$]/.test(char):
          segments.push(numberStack.join(""));
          labels.push("n");
          numberStack.length = 0;
          wordStack.push(char);
          break;
        case /['"]/.test(char):
          segments.push(numberStack.join(""));
          labels.push("n");
          numberStack.length = 0;
          stringStack.push(char);
          break;
        case /[`]/.test(char):
          segments.push(numberStack.join(""));
          labels.push("n");
          numberStack.length = 0;
          const [
            j,
            templateLiteralSegments,
            templateLabels
          ] = handleTemplateLiteral(i, str);
          segments.push(...templateLiteralSegments);
          labels.push(...templateLabels);
          i = j;
          break;
        default:
          segments.push(numberStack.join(""));
          labels.push("n");
          numberStack.length = 0;
          primarySwitch(char);
          break;
      }
    };

    const inStringStack = char => {
      switch (true) {
        case stringStack[0] === char:
          stringStack.push(char);
          if (!u.isEscaped(i, str)) {
            // quote char has not been escaped
            segments.push(stringStack.join(""));
            labels.push("s");
            stringStack.length = 0;
            flags.stringFlags.templateLiteral = false;
          }
          break;
        case char === "$" && flags.stringFlags.templateLiteral:
          if (u.isEscaped(i, str)) {
            stringStack.push(char);
          } else if (str[i + 1] === "{") {
            flags.stringFlags.templateLitExpIndex = 0;
            segments.push(stringStack.join(""));
            labels.push("s");
            stringStack.length = 0;
          } else {
            stringStack.push(char);
          }
          break;
        case char === "`" &&
          !u.isEscaped(i, str) &&
          flags.stringFlags.templateLiteral:
          stringStack.push(char);
          segments.push(stringStack.join(""));
          labels.push("s");
          stringStack.length = 0;
          flags.stringFlags.templateLiteral = false;
          break;
        default:
          stringStack.push(char);
          break;
      }
    };

    const emptyStacks = char => {
      switch (true) {
        case /(?=[\w$])(?=[^\d])/.test(char): // word character or _ or $ but not digit
          wordStack.push(char);
          break;
        case /[\d\.]/.test(char): // starts a number (int or float)
          numberStack.push(char);
          if (char === ".") flags.numberFlags.haveSeenPeriod = true;
          break;
        case /['"]/.test(char): // starts a string
          stringStack.push(char);
          break;
        case /[`]/.test(char):
          const [
            j,
            templateLiteralSegments,
            templateLabels
          ] = handleTemplateLiteral(i, str);
          segments.push(...templateLiteralSegments);
          labels.push(...templateLabels);
          i = j;
          break;
        // case char === " " && i < str.length && str[i + 1] === " ":
        //   // skip consecutive blankspace
        //   i++;
        //   break;
        default:
          segments.push(char); // starts no stack
          labels.push(" ");
          break;
      }
    };

    while (i < str.length) {
      primarySwitch(str[i]);
      i++;
    }

    if (wordStack.length > 0) {
      segments.push(wordStack.join(""));
      labels.push("w");
    }
    if (numberStack.length > 0) {
      segments.push(numberStack.join(""));
      labels.push("n");
    }
    if (stringStack.length > 0) {
      throw new Error("Missing closing quote");
    }
    // console.log(str, segments);
    return [segments, labels];
  }

  const handleTemplateLiteral = (i, str) => {
    const templateLiteralStacks = [["`"]];
    const templateLabels = [];
    let templateSegment = 0;
    let templateExpressionFlag = false;
    const templateExpression = [];
    for (let j = i + 1; j < str.length; j++) {
      switch (true) {
        case j === str.length - 1 && str[j] !== "`":
          throw new Error("Missing closing ` ");
        case templateExpressionFlag:
          templateExpression.push(str[j]);
          if (str[j] === "}" && !u.isEscaped(j, str)) {
            const [tSegments, tLabels] = split(
              templateExpression.slice(1, -1).join("")
            );
            templateLiteralStacks.push(...tSegments);
            templateLabels.push(...tLabels);
            templateExpressionFlag = false;
            templateExpression.length = 0;
            templateSegment = templateLiteralStacks.length;
            templateLiteralStacks.push([]);
          } else if (str[j] === "`" && !u.isEscaped(j, str)) {
            throw new Error("Cannot parse nested template literals");
          }
          break;
        case str[j] === "$" && !u.isEscaped(j, str):
          if (j + 1 < str.length && str[j + 1] === "{") {
            templateExpressionFlag = true;
            templateLiteralStacks[templateSegment] = templateLiteralStacks[
              templateSegment
            ].join("");
            templateLabels.push("t"); // template expression start
          } else {
            templateLiteralStacks[templateSegment].push(str[j]);
          }
          break;
        case str[j] === "`" && !u.isEscaped(j, str):
          templateLiteralStacks[templateSegment].push(str[j]);
          templateLiteralStacks[templateSegment] = templateLiteralStacks[
            templateSegment
          ].join("");
          templateLabels.push("t");
          return [j, templateLiteralStacks, templateLabels];
        default:
          templateLiteralStacks[templateSegment].push(str[j]);
          break;
      }
    }
  };

  module.exports = { split, handleTemplateLiteral };
})();
