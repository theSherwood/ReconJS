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

      const vetted = {};
      const failing = {};
      segments.forEach((segment, i) => {
        if (labels[i] === "w") {
          if (whitelist.hasOwnProperty(segment)) {
            vetted[segment] = 1;
          } else if (
            vettedVariables &&
            vettedVariables.hasOwnProperty(segment)
          ) {
            vetted[segment] = 1;
          } else if (i > 0 && segments[i - 1] === ".") {
            /*
              Word is fine to use after the . operator but not elsewhere. 
              Do nothing.
            */
          } else if (
            i > 1 &&
            isNext(i, segments, ["let", "const", "var", "function"], false) > -1
          ) {
            // Word is declared as an identifier of a variable or function
            vetted[segment] = 2; // 2 is for declared variables
          } else if (parameterCheck(segments[i], i, parameters)) {
            // Word is being used as a parameter in a function declaration/expression
            vetted[segment] = 1;
          } else if (objectInitCheck(i, segments)) {
            /*
              Word is being initialized as an object property. It is not 
              added to the vetted object because it should not be useable
              without dot notation.            
            */
          } else if (vetted.hasOwnProperty(segment)) {
            // vetted already knows about it. Do nothing.
          } else {
            failing[segment] = 1;
          }
        }
      });
      const failures = Object.keys(failing);
      if (failures.length > 0) {
        // console.log(segments, labels);
        throw new Error(
          "SanitizeJS: The identifier(s) * " +
            failures.join(", ") +
            " * are not permitted to be used, unless declared as variables"
        );
      }
      return vetted;
    },

    checkForComments: (labels, segments) => {
      for (let i = 0; i < labels.length - 1; i++) {
        if (labels[i] === " " && labels[i + 1] === " ") {
          if (segments[i] === "/") {
            if (segments[i + 1] === "/" || segments[i + 1] === "*") {
              throw new Error("SanitizeJS: Comments are not allowed");
            }
          }
        }
      }
    },

    checkDeclarationScope: (labels, segments, vetted) => {
      const scopeTree = buildScope(labels, segments, -1, null);

      if (scopeTree.end < labels.length - 1) {
        // Check for extra closing bracket
        for (let i = scopeTree.end + 1; i < labels.length; i++) {
          if (segments[i] === "}") {
            throw new Error("SanitizeJS: Scope error.");
          }
        }
      }

      Object.entries(vetted).forEach(([identifier, val]) => {
        if (val !== 2) return; // the vetted identifier is not a declared variable
        const locations = getIdentifierLocations(segments, identifier);

        locations.forEach(location => {
          findScopeOfLocation(scopeTree, location, identifier);
        });
      });
    }
  };

  const findScopeOfLocation = (scopeTree, location, identifier) => {
    if (scopeTree.declarations.includes(identifier)) return;
    const absLoc = Math.abs(location);
    const scope = scopeTree.children.find(child => {
      console.log(child.start, absLoc, child.end);
      return child.start < absLoc && absLoc < child.end;
    });
    if (scope) {
      findScopeOfLocation(scope, location, identifier);
    } else {
      if (location < 0) {
        // neg location means it was a declaration
        scopeTree.declarations.push(identifier);
      } else {
        throw new Error(
          `SanitizeJS: Scope error. The identifier * ${identifier} * was used outside of declaration scope.`
        );
      }
    }
  };

  const getIdentifierLocations = (segments, identifier) => {
    const locations = [];
    for (let i = 0; i < segments.length; i++) {
      if (identifier === segments[i]) {
        // check for declaration
        if (
          isNext(i, segments, ["let", "const", "var", "function"], false) > -1
        ) {
          // use a negative number to indicate that the identifier is declared at positive i
          locations.push(-i);
        } else {
          // use a positive number to indicate that the identifier is otherwise accessed
          locations.push(i);
        }
      }
    }
    return locations.sort();
  };

  class Scope {
    constructor(start, end, parent) {
      this.start = start;
      this.end = end;
      this.parent = parent;
      this.children = [];
      this.declarations = [];
    }
  }

  const buildScope = (labels, segments, i, parent) => {
    const scope = new Scope(i, undefined, parent);

    for (let j = i + 1; j < labels.length; j++) {
      if (labels[j] === " " && segments[j] === "{") {
        const childScope = buildScope(labels, segments, j, scope);
        j = childScope.end;
        scope.children.push(childScope);
        continue;
      } else if (labels[j] === " " && segments[j] === "}") {
        if (i === -1) {
          throw new Error("SanitizeJS: Scope error.");
        }
        scope.end = j;
        return scope;
      }
    }
    if (i === -1) {
      scope.end = labels.length;
      return scope;
    }

    throw new Error("SanitizeJS: Scope error.");
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

  const objectInitCheck = (i, segments) => {
    /*
      Checks if word is being used to initialize a property in an
      object literal. It is somewhat more permissive than that, though.
      It will also allow a statement label in a block. Referencing
      that label will through an error, however.
    */
    return (
      isNext(i, segments, [":"]) > -1 && // look ahead for ':'
      isNext(i, segments, [",", "{"], false) > -1 // look behind for ',' or '{'
    );
  };

  const isNext = (i, segments, targets, forward = true) => {
    /*
      Checks for the next non-whitespace segment in some direction
      and compares it against an array of targets.
    */
    const modifier = forward ? 1 : -1; // look in which direction?
    let j = i;
    while (j > -1 && j < segments.length) {
      j += modifier;
      if (targets.includes(segments[j])) return j; // encountered a target
      if (/\S/.test(segments[j])) {
        // encountered something that was not space or target
        return -2;
      }
    }
    return -1; // nothing but perhaps whitespace in that direction
  };

  const getFunctionParameters = (segments, labels) => {
    /* 
      Since we can't simply vet words that are used as parameters as
      that would allow them to be used outside of the function definition,
      perhaps to access the global scope; the parameters object will 
      store parameter names as keys and the values will be arrays of ranges
      that coincide with the function definition. Use of one of these 
      parameters outside of the relevant ranges will throw an error.
    */
    const parameters = {};

    // Integrate new parameters with the parameters object
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
