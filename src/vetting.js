"use strict";

(function() {
  const vettedList = [
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

  const vetMethods = {
    getDefaultVetted: () => {
      const vettedHash = {};
      vettedList.forEach(word => {
        vettedHash[word] = 1;
      });
      return vettedHash;
    },
    unvet: (arg, vettedHash) => {
      if (Array.isArray(arg)) {
        arg.forEach(word => {
          delete vettedHash[word];
        });
      } else if (typeof arg === "string") {
        delete vettedHash[arg];
      } else {
        throw new Error(
          "Unvet only accepts a string or an array of strings as an argument"
        );
      }
    }
  };

  module.exports = { vetMethods };
})();
