import { EdnKey, EdnMap, EdnSym, EdnTag } from "./edn";

// https://learnxinyminutes.com/docs/edn/
// https://github.com/edn-format/edn/wiki/Implementations
// https://github.com/edn-format/edn
// https://github.com/jorinvo/edn-data

export function processUi(input: object) {
  function processUiDefinition(input: EdnTag<object>) {
    if (input.val instanceof Array) {
      const items: any[] = [];
      for (const val of input.val) {
        if (val instanceof EdnTag) {
          if (val.tag === "ui/base") {
            items.push(processUiBase(val));
            continue;
          }
          if (val.tag === "ui/addon") {
            items.push(processUiAddon(val));
            continue;
          }
          throw Error("ui/definition: expected tag ui/base or ui/addon");
        }
      }
      return items;
    }
    throw Error("ui/definition: expected array");
  }

  function processUiBase(input: EdnTag<object>) {
    if (input.val instanceof Array) {
      const items: any[] = [];
      for (const val of input.val) {
        if (val instanceof EdnSym) {
          items.push(val.sym);
          continue;
        }
        if (val instanceof EdnMap) {
          const firstKey = val.entries[0].key;
          if (firstKey instanceof EdnKey) {
            items.push(firstKey.key);
            continue;
          }
          throw new Error("ui/base: expected map key");
        }
        throw new Error("ui/base: expected symbol or map");
      }
      return items;
    }
    throw Error("ui/base: expected array");
  }

  function processUiAddon(input: EdnTag<object>) {
    if (input.val instanceof Array) {
      const items: any[] = [];
      for (const val of input.val) {
        if (val instanceof EdnSym) {
          items.push(val.sym);
          continue;
        }
        if (val instanceof EdnMap) {
          const firstKey = val.entries[0].key;
          if (firstKey instanceof EdnKey) {
            items.push(firstKey.key);
            continue;
          }
          throw new Error("ui/addon: expected map key");
        }
        throw new Error("ui/addon: expected symbol or map");
      }
      return items;
    }
    throw Error("ui/addon: expected array");
  }

  if (input instanceof EdnTag) {
    if (input.tag === "ui/definition") {
      return processUiDefinition(input);
    }
    throw Error("expected tag ui/definition");
  }
}
