import { parse } from "acorn";
import whitelist from "./whitelist";
import buildScopeTree from "./buildScopeTree";
import checkWords from "./checkWords";
import { recurseAST, traverseASTArray } from "./walkers";

class Recon {
  constructor() {
    this.resetWhitelist();
    this.defaultOptions = {
      sourceType: "module",
      locations: true,
      allowThis: false
    };
  }

  check(str, options, allowedIdentifiers) {
    options = { ...this.defaultOptions, ...options };
    if (typeof str === "string") {
      this.getScopeTree(str, options);
    }
    if (!this.astArray) return;
    const illicitIdentifiers = checkWords(
      this.astArray,
      recurseAST,
      this.whitelist,
      allowedIdentifiers,
      options
    );
    return illicitIdentifiers;
  }

  getScopeTree(str, options) {
    options = { ...this.defaultOptions, ...options };
    if (typeof str === "string") {
      this.parse(str, options);
    }
    if (!this.astArray) return;
    buildScopeTree(this.astArray, traverseASTArray);
    return this.ast;
  }

  resetWhitelist() {
    this.whitelist = new Set(whitelist);
  }

  removeFromWhitelist(arg) {
    if (Array.isArray(arg)) {
      arg.forEach(word => {
        this.whitelist.delete(word);
      });
    } else if (typeof arg === "string") {
      this.whitelist.delete(arg);
    } else {
      throw new Error(
        "ReconJS: removeFromWhitelist only accepts a string or an array of strings as an argument"
      );
    }
  }

  addToWhitelist(arg) {
    if (Array.isArray(arg)) {
      arg.forEach(word => {
        this.whitelist.add(word);
      });
    } else if (typeof arg === "string") {
      this.whitelist.add(arg);
    } else {
      throw new Error(
        "ReconJS: addToWhitelist only accepts a string or an array of strings as an argument"
      );
    }
  }

  parse(string, options) {
    options = { ...this.defaultOptions, ...options };
    this.ast = parse(string, options);
    this.buildASTArray(this.ast);
    return this.ast;
  }

  /*
    Build an array of the ast with each node holding
    the index of the parent in a property called 'parent'.
    This makes backtracking comparatively low cost.
  */
  buildASTArray(ast) {
    this.astArray = [ast];
    ast.index = 0;
    ast.parent = null;
    let index = 1;
    recurseAST(ast, undefined, (child, node) => {
      if (child.hasOwnProperty("index")) {
        /*
          Replace the child with a clone if the child
          has already been visited (there are duplicates).
          ```
          const obj = { prop } 
          ```
          for example, will create one node for prop,
          but reference it from the parent on both
          the 'key' and 'value' properties. Clone the
          key so that the value node has a different 
          index.
        */
        Object.entries(node).find(([key, value]) => {
          if (value === child) {
            child = { ...child };
            node[key] = child;
            return true;
          }
        });
      }
      child.parent = node.index;
      child.index = index;
      index++;
      if (index > 100000) throw new Error("Too much code to parse");
      this.astArray.push(child);
    });

    for (let i = 0; i < this.astArray.length; i++) {
      if (this.astArray[i].index !== i) throw new Error("not matching");
    }
  }
}

export default Recon;
