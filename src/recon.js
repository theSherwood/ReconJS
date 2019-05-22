import * as acorn from "acorn";
import * as walk from "acorn-walk";
import whitelist from "./whitelist";

console.log(walk);

class Recon {
  constructor() {
    this.resetWhitelistObject();

    // this.getIdentifiers = this.getIdentifiers.bind(this);
  }

  getIdentifiers(str) {
    if (typeof str === "string") {
      parse(str);
    }
    if (!this.ast) return;
    const identifiers = [];
    walk.simple(this.ast, {
      Identifier: function(node) {
        identifiers.push(node);
      }
    });
    this.identifiers = identifiers;
    console.log(this.identifiers);
    return this.identifiers;
  }

  resetWhitelistObject() {
    const whitelistObj = {};
    whitelist.forEach(word => {
      whitelistObj[word] = 1;
    });
    this.whitelist = whitelistObj;
  }

  removeFromWhitelist(arg) {
    if (Array.isArray(arg)) {
      arg.forEach(word => {
        delete this.whitelist[word];
      });
    } else if (typeof arg === "string") {
      delete this.whitelist[arg];
    } else {
      throw new Error(
        "ReconJS: removeFromWhitelist only accepts a string or an array of strings as an argument"
      );
    }
  }

  addToWhitelist(arg) {
    if (Array.isArray(arg)) {
      arg.forEach(word => {
        this.whitelist[word] = 1;
      });
    } else if (typeof arg === "string") {
      this.whitelist[arg] = 1;
    } else {
      throw new Error(
        "ReconJS: addToWhitelist only accepts a string or an array of strings as an argument"
      );
    }
  }

  parse(string) {
    this.ast = acorn.parse(string);
    // console.log(ast);
    return this.ast;
  }
}

export default Recon;
