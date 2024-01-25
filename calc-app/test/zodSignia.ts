import { type Atom, type Computed, type Signal } from "signia";
import { z } from "zod";

const isAtom = (data: any) => data?.constructor?.name === "_Atom";
const isComputed = (data: any) => data?.constructor?.name === "_Computed";

export const zodSignal = <Value>() => {
  return z
    .custom((data: any) => isAtom(data) || isComputed(data), {
      message: `must be type Atom or type Computed`,
    })
    .transform((data) => data as Signal<Value, unknown>);
};

export const zodAtom = <Value>() => {
  return z
    .custom((data: any) => isAtom(data), {
      message: `must be type Atom`,
    })
    .transform((data) => data as Atom<Value, unknown>);
};

export const zodComputed = <Value>() => {
  return z
    .custom((data: any) => isComputed(data), {
      message: `must be type Computed`,
    })
    .transform((data) => data as Computed<Value, unknown>);
};

const isString = (data: any) => z.string().safeParse(data).success;
const isNumber = (data: any) => z.number().safeParse(data).success;
