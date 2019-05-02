"use strict";

/*

!!!!!    DevNotes    !!!!!

* No support for object properties as yet

*/

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
      const parameters = getFunctionParameters(segments, labels);

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
          } else if (parameterCheck(segments[i], i, parameters)) {
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

  const parameterCheck = (parameter, location, parameters) => {
    // Check that the parameter is used only within the function declaration
    let passesCheck = false;
    if (parameters.hasOwnProperty(parameter)) {
      parameters[parameter].forEach(range => {
        if (location >= range[0] && location <= range[1]) {
          passesCheck = true;
        }
      });
      if (!passesCheck) {
        throw new Error(
          `SanitizeJS: The parameter * ${parameter} * is used outside of the appropriate function definition`
        );
      }
    }
    return passesCheck;
  };

  const getFunctionParameters = (segments, labels) => {
    const parameters = {};

    const addParameters = paramsObject => {
      paramsObject.params.forEach(param => {
        if (parameters.hasOwnProperty(param)) {
          parameters[param].push(paramsObject.range);
        } else {
          parameters[param] = [paramsObject.range];
        }
      });
    };

    for (let i = 0; i < segments.length; i++) {
      if (segments[i] === "function") {
        const paramsObject = getTradFuncParams(i, segments, labels);
        addParameters(paramsObject);
      } else if (
        i < segments.length - 1 &&
        segments[i] === "=" &&
        segments[i + 1] === ">"
      ) {
        const paramsObject = getArrowFuncParams(i, segments, labels);
        addParameters(paramsObject);
      }
    }
    return parameters;
  };

  const getTradFuncParams = (i, segments, labels) => {
    let rangeStart;
    let bracketStart = -1;
    let bracketEnd = -1;
    let bracketStack = [];
    let params = [];
    let openingParenthesis = 0;
    let closingParenthesis = 0;
    for (let j = i + 1; j < segments.length; j++) {
      if (!closingParenthesis) {
        if (!openingParenthesis && segments[j] === "(") {
          openingParenthesis = j;
          rangeStart = j;
          continue;
        }
        if (openingParenthesis) {
          if (segments[j] === ")") {
            closingParenthesis = j;
            continue;
          }
          switch (true) {
            case labels[j] === "w":
              params.push(segments[j]);
              break;
            case [",", " "].includes(segments[j]):
              break;
            default:
              throw new Error(
                "SanitizeJS: Function parameters must be passed as a simple, comma-separated list without default values"
              );
          }
        }
      } else {
        if (j === closingParenthesis + 2 && segments[j] !== "{") {
          throw new Error(
            "SanitizeJS: Function declaration open bracket must follow the parameter list close parenthisis after one space"
          );
        }
        if (segments[j] === "{" && bracketStart < 0) {
          bracketStart = j;
          bracketStack.push("{");
          continue;
        }
        if (bracketStart > -1 && bracketEnd < 0) {
          switch (segments[j]) {
            case "{":
              bracketStack.push("{");
              break;
            case "}":
              bracketStack.pop();
              if (bracketStack.length === 0) {
                bracketEnd = j;
                return { params, range: [rangeStart, bracketEnd] };
              }
              break;
            default:
              break;
          }
        }
      }
    }
    throw new Error("SanitizeJS: Function declaration error");
  };

  const getArrowFuncParams = (i, segments, labels) => {
    let rangeStart = -1;
    let bracketStart = -1;
    let bracketEnd = -1;
    let bracketStack = [];
    let params = [];
    let openingParenthesis = -1;
    let closingParenthesis = -1;
    for (let j = i - 1; j > -1; j--) {
      if (rangeStart > -1) break;
      if (closingParenthesis < 0 && segments[j] === ")") {
        closingParenthesis = j;
        continue;
      }
      if (closingParenthesis < 0) {
        if (labels[j] === "w") {
          // single parameter, no parentheses
          params.push(segments[j]);
          rangeStart = j;
          break;
        }
      } else {
        if (openingParenthesis < 0) {
          switch (true) {
            case segments[j] === "(":
              openingParenthesis = j;
              rangeStart = j;
              break;
            case labels[j] === "w":
              params.push(segments[j]);
              break;
            case [",", " "].includes(segments[j]):
              break;
            default:
              throw new Error(
                "SanitizeJS: Function parameters must be passed as a simple, comma-separated list without default values"
              );
          }
        }
      }
    }

    for (let k = i + 2; k < segments.length; k++) {
      if (
        (k === i + 2 && segments[k] !== " ") ||
        (k === i + 3 && segments[k] !== "{")
      ) {
        throw new Error(
          "SanitizeJS: Arrow function declarations must use brackets. Function declaration open bracket must follow the arrow after one space"
        );
      }
      if (segments[k] === "{" && bracketStart < 0) {
        bracketStart = k;
        bracketStack.push("{");
        continue;
      }
      if (bracketStart > -1 && bracketEnd < 0) {
        switch (segments[k]) {
          case "{":
            bracketStack.push("{");
            break;
          case "}":
            bracketStack.pop();
            if (bracketStack.length === 0) {
              bracketEnd = k;
              return { params, range: [rangeStart, bracketEnd] };
            }
            break;
        }
      }
    }
    throw new Error("SanitizeJS: Function declaration error");
  };

  module.exports = vetting;
})();
