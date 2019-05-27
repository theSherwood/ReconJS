import * as acorn from "acorn";
// import * as walk from "acorn-walk";
import whitelist from "./whitelist";
import buildScopeTree from "./buildScopeTree";
import checkIdentifiers from "./checkIdentifiers";
import { recurseAST, traverseASTArray } from "./walkers";

class Recon {
  constructor() {
    this.resetWhitelistObject();

    // this.getIdentifiers = this.getIdentifiers.bind(this);
  }

  check(str, variables, options) {
    if (typeof str === "string") {
      this.getScopeTree(str, options);
    }
    if (!this.astArray) return;
    checkIdentifiers(this.astArray, recurseAST, this.whitelist, variables);
  }

  getScopeTree(str, options) {
    if (typeof str === "string") {
      this.parse(str, options);
    }
    if (!this.astArray) return;
    buildScopeTree(this.astArray, traverseASTArray);
    // console.log(this.ast);
    return this.ast;
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

  parse(string, options) {
    this.ast = acorn.parse(string, options);
    // console.log(ast);
    this.buildASTArray(this.ast);
    return this.ast;
  }

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
      if (index > 10000) throw new Error("Too much code to parse");
      this.astArray.push(child);
    });
    console.log("astArray: ", this.astArray);

    for (let i = 0; i < this.astArray.length; i++) {
      if (this.astArray[i].index !== i) throw new Error("not matching");
    }
  }
}

export default Recon;
