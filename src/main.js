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

    vet(jsString, allowedVariables) {
      try {
        const [segments, labels] = split(jsString);
        // console.log("post-split", segments, labels);
        vetting.checkWords(segments, labels, this.whitelist, allowedVariables);
        vetting.containsComment(labels, segments);
      } catch (err) {
        // console.log("err at first block!");
        return err.message;
      }
    }

    run(jsString, allowedVariables) {
      let result;
      try {
        const [segments, labels] = split(jsString);
        // console.log("post-split", segments, labels);
        vetting.checkWords(segments, labels, this.whitelist, allowedVariables);
        vetting.containsComment(labels, segments);
      } catch (err) {
        // console.log("err at first block!");
        return err.message;
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
        /*
        Pass those variables and values as arguments so that jsString will be executed
        in the scope of those variables.
        The Function constructor is needed to create a scope with the allowedVariables.
        The eval and the template literal ` are there for handling multi-line strings.
        */
        result = new Function(
          ...variables,
          "return (eval(`" + jsString + "`))"
        )();
        // result = eval(jsString);
      } catch (err) {
        // console.log("err at second block!");
        return err.message;
      }
      return result;
    }
  }

  module.exports = SanitizeJS;
})();
