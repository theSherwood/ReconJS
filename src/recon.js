import * as acorn from "acorn";
// import * as walk from "acorn-walk";
import whitelist from "./whitelist";
import buildScopeTree from "./buildScopeTree";

class Recon {
  constructor() {
    this.resetWhitelistObject();

    // this.getIdentifiers = this.getIdentifiers.bind(this);
  }

  getScopeTree(str) {
    if (typeof str === "string") {
      parse(str);
    }
    if (!this.astArray) return;
    buildScopeTree(this.astArray, this.traverseASTArray);
    console.log(this.ast);
    return this.ast;
  }

  traverseASTArray(astArray, callback) {
    for (let i = 0; i < astArray.length; i++) {
      callback(astArray[i]);
    }
  }

  recurseAST(node, nodeCallback, childCallback, state) {
    (function recurse(node, nodeCallback, childCallback, state) {
      nodeCallback && nodeCallback(node, state);
      Object.values(node).forEach(value => {
        // Iterate over properties on the node, looking for
        // child nodes.
        if (typeof value === "object" && value !== null) {
          if (value.hasOwnProperty("index")) return;
          if (Array.isArray(value)) {
            value.forEach(arrayChild => {
              childCallback && childCallback(arrayChild, node, state);
              recurse(arrayChild, nodeCallback, childCallback);
            });
          } else {
            childCallback && childCallback(value, node, state);
            recurse(value, nodeCallback, childCallback, state);
          }
        }
      });
    })(node, nodeCallback, childCallback, state);
  }

  getIdentifiers(str) {
    if (typeof str === "string") {
      parse(str);
    }
    if (!this.ast) return;
    let count = 0;
    const identifiers = [];

    this.identifiers = identifiers;
    console.log("identifiers", identifiers);
    return identifiers;
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
    this.recurseAST(ast, undefined, (child, node) => {
      // if (child === "null") console.log("parent of null: ", node);
      // console.log("child ", child, node);
      child.parent = node.index;
      child.index = index;
      index++;
      if (index > 2000) throw new Error("infinite loop");
      this.astArray.push(child);
    });
    console.log("astArray: ", this.astArray);

    for (let i = 0; i < this.astArray.length; i++) {
      if (this.astArray[i].index !== i) throw new Error("not matching");
    }
  }
}

export default Recon;
