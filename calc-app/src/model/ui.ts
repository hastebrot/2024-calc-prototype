import { EdnKey, EdnMap, EdnSym, EdnTag } from "./edn";

// https://learnxinyminutes.com/docs/edn/
// https://github.com/edn-format/edn/wiki/Implementations
// https://github.com/edn-format/edn
// https://github.com/jorinvo/edn-data

export class UiSymbol {
  constructor(public name: string) {}
}

export class UiMap {
  constructor(public name: string, public map: EdnMap) {}
}

export class UiGroup {
  constructor(public sym: string) {}
}

export class UiInput {
  constructor(public map: object) {}
}

export class UiOutput {
  constructor(public map: object) {}
}

export class UiTargetSource {
  constructor(public map: object) {}
}

export class UiWhenThen {
  constructor(public map: object) {}
}

function transformEdnSym(value: EdnSym) {
  return value.sym;
}

function transformEdnMap(value: EdnMap) {
  const entries = value.entries.map((entry) => {
    let key = entry.key;
    if (key instanceof EdnKey) {
      key = key.key;
    }
    let val = entry.val;
    if (val instanceof EdnSym) {
      val = transformEdnSym(val);
    }
    if (val instanceof EdnMap) {
      val = transformEdnMap(val);
    }
    return [key, val];
  });
  return Object.fromEntries(entries);
}

export function processUi(input: object) {
  function processUiDefinition(input: EdnTag) {
    if (input.val instanceof Array) {
      const items: any[] = [];
      for (const val of input.val) {
        if (val instanceof EdnTag) {
          if (val.tag === "ui/base") {
            items.push(processUiBase(val));
            continue;
          }
          throw Error("ui/definition: expected tag ui/base or ui/addon");
        }
      }
      return items;
    }
    throw Error("ui/definition: expected array");
  }

  function processUiBase(input: EdnTag) {
    if (input.val instanceof Array) {
      const items: any[] = [];
      for (const val of input.val) {
        if (val instanceof EdnSym) {
          items.push(processUiSym(val));
          continue;
        }
        if (val instanceof EdnMap) {
          items.push(processUiMap(val));
          continue;
        }
        throw new Error("ui/base: expected symbol or map");
      }
      return items;
    }
    throw Error("ui/base: expected array");
  }

  function processUiSym(input: EdnSym) {
    if (input.sym === "ui/group") {
      return new UiGroup(transformEdnSym(input));
    }
    return new UiSymbol(transformEdnSym(input));
  }

  function processUiMap(input: EdnMap) {
    const firstKey = input.entries[0].key;
    if (firstKey instanceof EdnKey) {
      if (firstKey.key === "output") {
        return new UiOutput(transformEdnMap(input));
      }
      if (firstKey.key === "input") {
        return new UiInput(transformEdnMap(input));
      }
      if (firstKey.key === "target") {
        return new UiTargetSource(transformEdnMap(input));
      }
      if (firstKey.key === "when") {
        return new UiWhenThen(transformEdnMap(input));
      }
      return new UiMap(firstKey.key, input);
    }
    throw new Error("ui/base: expected map key");
  }

  if (input instanceof EdnTag) {
    if (input.tag === "ui/definition") {
      return processUiDefinition(input);
    }
    throw Error("expected tag ui/definition");
  }
}
