"use strict";

(function() {
  const { split } = require("./split");
  const vetting = require("./vetting");

  class SanitizeJS {
    constructor() {
      this.whitelist = vetting.getWhitelistObject();
    }

    removeFromWhitelist(arg) {
      vetting.removeFromWhitelist(arg, this.whitelist);
    }

    addToWhitelist(arg) {
      vetting.addToWhitelist(arg, this.whitelist);
    }

    resetWhitelist() {
      this.whitelist = vetting.getWhitelistObject();
    }

    run(jsString, allowedVariables) {
      let result;
      try {
        const [segments, labels] = split(jsString);
        vetting.checkWords(segments, labels, this.whitelist, allowedVariables);
      } catch (err) {
        return err;
      }
      try {
        result = eval(jsString);
        // const result = new Function(jsString)(); // This requires a return statement
      } catch (err) {
        return err;
      }
      return result;
    }
  }

  module.exports = SanitizeJS;
})();

// // /*
// // const reservedWords = [
// //   'do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'null', 'true', 'this', 'void', 'with', 'await', 'break', 'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield', 'delete', 'export', 'import', 'public', 'return', 'static', 'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private', 'continue', 'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 'instanceof',
// //   'undefined', 'NaN', 'Math', 'Number', 'Object', 'Array', 'Set', 'Map', 'Date', 'alert', 'console', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'JSON', 'parseFloat', 'parseInt', 'prototype', 'String', 'setTimeout', 'setInterval', 'isPrototypeOf', 'isNaN', 'toString', 'of', 'Boolean', 'RegExp', 'Infinity', 'isFinite', 'Function', 'Symbol', 'Error', 'BigInt', 'Generator', 'GeneratorFunction', 'Promise', 'async', 'await', 'AsyncFunction'
// // ]
// // */
