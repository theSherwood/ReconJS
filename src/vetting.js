"use strict";

(function() {
  const whitelistArray = [
    "do",
    "if",
    "in",
    "for",
    "let",
    "new",
    "try",
    "var",
    "case",
    "else",
    "enum",
    "null",
    "true",
    "void",
    "with",
    "await",
    "break",
    "catch",
    "class",
    "const",
    "false",
    "super",
    "throw",
    "while",
    "yield",
    "delete",
    "export",
    "import",
    "public",
    "return",
    "static",
    "switch",
    "typeof",
    "default",
    "extends",
    "finally",
    "package",
    "private",
    "continue",
    "debugger",
    "function",
    "arguments",
    "interface",
    "protected",
    "implements",
    "instanceof",
    "undefined",
    "NaN",
    "Math",
    "Number",
    "Object",
    "Array",
    "Set",
    "Map",
    "Date",
    "alert",
    "console",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "JSON",
    "parseFloat",
    "parseInt",
    "prototype",
    "String",
    "setTimeout",
    "setInterval",
    "isPrototypeOf",
    "isNaN",
    "toString",
    "of",
    "Boolean",
    "RegExp",
    "Infinity",
    "isFinite",
    "Function",
    "Symbol",
    "Error",
    "BigInt",
    "Generator",
    "GeneratorFunction",
    "Promise",
    "async",
    "await",
    "AsyncFunction"
  ];

  const vetting = {
    getWhitelistObject: () => {
      const whitelist = {};
      whitelistArray.forEach(word => {
        whitelist[word] = 1;
      });
      return whitelist;
    },

    removeFromWhitelist: (arg, whitelist) => {
      if (Array.isArray(arg)) {
        arg.forEach(word => {
          delete whitelist[word];
        });
      } else if (typeof arg === "string") {
        delete whitelist[arg];
      } else {
        throw new Error(
          "SanitizeJS: removeFromWhitelist only accepts a string or an array of strings as an argument"
        );
      }
    },

    addToWhitelist: (arg, whitelist) => {
      if (Array.isArray(arg)) {
        arg.forEach(word => {
          whitelist[word] = 1;
        });
      } else if (typeof arg === "string") {
        whitelist[arg] = 1;
      } else {
        throw new Error(
          "SanitizeJS: addToWhitelist only accepts a string or an array of strings as an argument"
        );
      }
    },

    checkWords: (segments, labels, whitelist, vettedVariables) => {
      const passing = {};
      const failing = {};
      segments.forEach((segment, i) => {
        if (labels[i] === "w") {
          if (whitelist.hasOwnProperty(segment)) {
            passing[segment] = 1;
          } else if (
            vettedVariables &&
            vettedVariables.hasOwnProperty(segment)
          ) {
            passing[segment] = 1;
          } else if (i > 0 && segments[i - 1] === ".") {
            passing[segment] = 1;
          } else if (
            i > 1 &&
            segments[i - 1] === " " &&
            ["let", "const", "var", "function"].includes(segments[i - 2])
          ) {
            passing[segment] = 1;
          } else if (isParameter(i, segments, labels)) {
            passing[segment] = 1;
          } else if (passing.hasOwnProperty(segment)) {
            // do nothing
          } else {
            failing[segment] = 1;
          }
        }
      });
      const failures = Object.keys(failing);
      if (failures.length > 0) {
        // console.log(segments, labels);
        throw new Error(
          "SanitizeJS: The words * " +
            failures.join(", ") +
            " * are not permitted to be used, unless declared as variables"
        );
      }
      return passing;
    }
  };

  const isParameter = (i, segments, labels) => {
    return (
      isParameterOfTradFunc(i, segments, labels) ||
      isParameterOfArrowFunc(i, segments, labels)
    );
  };

  const isParameterOfTradFunc = (i, segments, labels) => {
    let encounteredParenthesis = false;
    for (let j = i - 1; j > -1; j--) {
      switch (true) {
        case labels[j] === "w":
          if (encounteredParenthesis && segments[j] === "function") {
            return true;
          }
          break;
        case labels[j] === " " && segments[j] === "(":
          if (!encounteredParenthesis) {
            encounteredParenthesis = true;
          } else {
            return false;
          }
          break;
        case labels[j] === " " && [" ", ","].includes(segments[j]):
          break;
        default:
          return false;
      }
    }
    return false;
  };

  const isParameterOfArrowFunc = (i, segments, labels) => {
    for (let j = i + 1; j < segments.length; j++) {
      switch (true) {
        case labels[j] === "w":
          break;
        case labels[j] === " " && [")", " ", ","].includes(segments[j]):
          break;
        case j < segments.length - 1 &&
          labels[j] === " " &&
          segments[j] === "=" &&
          segments[j + 1] === ">":
          return true;
        default:
          return false;
      }
    }
    return false;
  };

  module.exports = vetting;
})();
