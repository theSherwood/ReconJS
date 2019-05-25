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
    if (!this.ast) return;
    const ast = buildScopeTree(this.ast, this.recurseAST);
    console.log(this.ast);
    return ast;
  }

  recurseAST(node, nodeCallback, childCallback) {
    (function recurse(node, nodeCallback, childCallback) {
      nodeCallback && nodeCallback(node);
      Object.entries(node).forEach(([key, value]) => {
        // Iterate over properties on the node, looking for
        // child nodes.
        if (typeof value === "object" && value !== null) {
          if (!Array.isArray(value)) {
            childCallback && childCallback(value, node);
          }
          recurse(value, nodeCallback, childCallback);
        }
      });
    })(node, nodeCallback, childCallback);
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

  parse(string) {
    this.ast = acorn.parse(string);
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

const doNotRecurseProps = ["fscope", "bscope"];

export default Recon;

// debugger;
// walk.simple(
//   this.ast,
//   Object.create(null),
//   {
//     default: (node, state, c) => {
//       count++;
//       if (count > 20) throw new Error("Stuck in a loop");
//       console.log(Object.entries(node));
//       Object.values(node).forEach(value => {
//         if (typeof value === "object" && value !== "null") {
//           if (value.type === "Identifier") identifiers.push(value.name);
//           c(value, state, "default");
//         }
//       });
//     }
//   },
//   undefined,
//   "default"
// );
// walk.simple(this.ast, {
//   Identifier: function(node) {
//     identifiers.push(node);
//   }
// });
// walk.full(this.ast, (node, state, type) => {
//   console.log(type);
// });
// walk.recursive(this.ast, undefined, undefined, (node, state, c) => {
//   console.log(node.type);
//   c(node);
// });
