function checkIdentifiers(ast, walker) {
  const illicitIdentifiers = [];
  walker(
    ast,
    (node, state) => {
      // Return is the node is not a real node:
      // (scopedParams or declaredIdentifiers)
      if (node.index === undefined) return;

      const identifiersInScope = buildIdentifierSet(node, state);
      console.log("index: ", node.index);
      console.log("state: ", node, identifiersInScope);
      return identifiersInScope;
    },
    undefined
  );
}

/*
  Create new state set containing identifiers
  (params or declared identifiers) that are
  safe to use in the current and descendant 
  scopes.
*/
function buildIdentifierSet(node, state) {
  const identifiersInScope = new Set();
  // Add ancestor scope identifiers, if any
  if (state && state.toString() === "[object Set]") {
    state.forEach(identifier => {
      identifiersInScope.add(identifier);
    });
  }
  // Add declaredIdentifiers, if any
  if (node.declaredIdentifiers) {
    node.declaredIdentifiers.forEach(identifier => {
      identifiersInScope.add(identifier);
    });
  }
  // Add declaredIdentifiers, if any
  if (node.declaredIdentifiers) {
    node.declaredIdentifiers.forEach(identifier => {
      identifiersInScope.add(identifier);
    });
  }
  // Add scopedParams, if any
  if (node.scopedParams) {
    node.scopedParams.forEach(identifier => {
      identifiersInScope.add(identifier);
    });
  }
  return identifiersInScope;
}

export default checkIdentifiers;
