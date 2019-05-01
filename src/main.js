"use strict";

/*
Run code in a sandbox with only the specified context variables in scope
*/
// $tw.utils.evalSandboxed = $tw.browser ? $tw.utils.evalGlobal : function(code,context,filename) {
// 	var sandbox = $tw.utils.extend(Object.create(null),context);
// 	vm.runInNewContext(code,sandbox,filename);
// 	return sandbox.exports;
// };

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
        if (!allowedVariables) {
          allowedVariables = {};
        }
        // Get variables and their values out of the allowedVariables object
        const variables = [];
        Object.entries(allowedVariables).forEach(entry =>
          variables.push(entry[0] + "=" + entry[1])
        );
        // Pass those variables and values as arguments so that jsString will be executed in the scope of those variables
        result = new Function(...variables, `return (${jsString})`)();
        // result = eval(jsString);
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
