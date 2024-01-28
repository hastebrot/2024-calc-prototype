import { parseEDNString } from "edn-data";
import { z } from "zod";

export const parseEdn = (edn: string) => {
  return parseEDNString(edn);
};
export const parseEdnValue = <In, Out>(edn: unknown): z.SafeParseReturnType<In, Out> => {
  return ednValue.safeParse(edn);
};

export class EdnMap<Key = any, Val = any> {
  constructor(public entries: EdnMapEntry<Key, Val>[]) {}
}
export class EdnMapEntry<Key = any, Val = any> {
  constructor(public key: Key, public val: Val) {}
}
export class EdnSet<Val = any> {
  constructor(public items: Val[]) {}
}
export class EdnKey {
  constructor(public key: string) {}
}
export class EdnSym {
  constructor(public sym: string) {}
}
export class EdnTag<Val = any> {
  constructor(public tag: string, public val: Val) {}
}

export const ednValue: z.ZodLazy<any> = z.lazy(() => {
  return z.union([
    ednString,
    ednNumber,
    ednBoolean,
    ednNull,
    ednArray,
    ednList,
    ednMap,
    ednSet,
    ednKey,
    ednSym,
    ednTag,
  ]);
});
const ednString = z.string();
const ednNumber = z.number();
const ednBoolean = z.boolean();
const ednNull = z.null();
const ednArray = z.array(ednValue);
const ednList = z
  .object({
    list: z.array(ednValue),
  })
  .transform((val) => val.list);
const ednMapEntry = z
  .tuple([ednValue, ednValue]) /* wrap */
  .transform((val) => new EdnMapEntry(...val));
const ednMap = z
  .object({
    map: z.array(ednMapEntry),
  })
  .transform((val) => new EdnMap(val.map));
const ednSet = z
  .object({
    set: z.array(ednValue),
  })
  .transform((val) => new EdnSet(val.set));
const ednKey = z
  .object({
    key: z.string(),
  })
  .transform((val) => new EdnKey(val.key));
const ednSym = z
  .object({
    sym: z.string(),
  })
  .transform((val) => new EdnSym(val.sym));
const ednTag = z
  .object({
    tag: z.string(),
    val: ednValue,
  })
  .transform((val) => new EdnTag(val.tag, val.val));
