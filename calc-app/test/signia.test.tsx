// ❯ bun add -d signia@0.1.5 vitest zod
// ❯ bun run test --watch signia.test.tsx

import { atom, computed, type Atom, type Computed, type Signal } from "signia";
import { expect, test } from "vitest";
import { z } from "zod";

// repo for "signia" package: https://github.com/tldraw/signia

test("signia condition with atom() and computed()", () => {
  const BlockProps = z.object({
    field1Input: zodAtom<number>(),
    field1Link: zodAtom<null | Signal<number>>(),
    field1: zodComputed<number>(),
    field2: zodComputed<number>(),
  });
  type BlockProps = z.infer<typeof BlockProps>;

  // create field1Input and empty field1Link and check fields.
  let block = {} as BlockProps;
  block.field1Input = atom("field1Input", 100);
  block.field1Link = atom("field1Link", null);
  block.field1 = computed("field1", () => {
    return block.field1Link.value?.value ?? block.field1Input.value;
  });
  block.field2 = computed("field2", () => {
    return block.field1.value + 1;
  });
  block = BlockProps.parse(block);
  expect(block.field1.value).toBe(100);
  expect(block.field2.value).toBe(101);

  // change field1Input and check fields.
  block.field1Input.set(200);
  expect(block.field1.value).toBe(200);
  expect(block.field2.value).toBe(201);

  // set field1Link atom and check fields.
  const field1LinkSignal = atom("field1LinkSignal", 1);
  block.field1Link.set(field1LinkSignal);
  expect(block.field1.value).toBe(1);
  expect(block.field2.value).toBe(2);

  // update field1Link atom and check fields.
  field1LinkSignal.update((value) => value + 1);
  expect(block.field1.value).toBe(2);
  expect(block.field2.value).toBe(3);

  // set field1Link computed and check fields.
  block.field1Link.set(computed("field1LinkSignal", () => 3));
  expect(block.field1.value).toBe(3);
  expect(block.field2.value).toBe(4);

  // set field1Link computed atom and check fields.
  block.field1Link.set(computed("field1LinkSignal", () => atom("foo", 4).value));
  expect(block.field1.value).toBe(4);
  expect(block.field2.value).toBe(5);

  // unset field1Link and check fields.
  block.field1Link.set(null);
  expect(block.field1.value).toBe(200);
  expect(block.field2.value).toBe(201);
});

test("signia iteration with atom() and computed()", () => {
  const BlockProps = z.object({
    field1Links: zodAtom<Signal<number>[]>(),
    field1: zodComputed<number>(),
  });
  type BlockProps = z.infer<typeof BlockProps>;

  // create field1 and empty field1Links and check fields.
  let block = {} as BlockProps;
  block.field1Links = atom("field1Links", []);
  block.field1 = computed("field1", () => {
    let sum = 0;
    for (const signal of block.field1Links.value) {
      sum += signal.value;
    }
    return sum;
  });
  block = BlockProps.parse(block);
  expect(block.field1.value).toBe(0);

  // change field1Links and check fields.
  block.field1Links.set([atom("value1", 1)]);
  expect(block.field1.value).toBe(1);

  // change field1Links and check fields.
  block.field1Links.set([atom("value1", 1), atom("value2", 2)]);
  expect(block.field1.value).toBe(3);

  // change field1Links and check fields.
  block.field1Links.set([atom("value2", 2)]);
  expect(block.field1.value).toBe(2);

  // change field1Links and check fields.
  block.field1Links.set([]);
  expect(block.field1.value).toBe(0);
});

const isAtom = (data: any) => data?.constructor?.name === "_Atom";
const isComputed = (data: any) => data?.constructor?.name === "_Computed";

export const zodSignal = <Value,>() => {
  return z
    .custom((data: any) => isAtom(data) || isComputed(data), {
      message: `must be type Atom or type Computed`,
    })
    .transform((data) => data as Signal<Value, unknown>);
};

export const zodAtom = <Value,>() => {
  return z
    .custom((data: any) => isAtom(data), {
      message: `must be type Atom`,
    })
    .transform((data) => data as Atom<Value, unknown>);
};

export const zodComputed = <Value,>() => {
  return z
    .custom((data: any) => isComputed(data), {
      message: `must be type Computed`,
    })
    .transform((data) => data as Computed<Value, unknown>);
};
