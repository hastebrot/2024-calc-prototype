// ❯ bun add -d valtio@1.11.3 vitest zod
// ❯ bun run test --watch valtio.test.tsx

import { cleanup } from "@testing-library/react";
import { Window } from "happy-dom";
import { getVersion, proxy, snapshot } from "valtio";
import { derive } from "valtio/utils";
import { beforeAll, beforeEach, expect, test } from "vitest";

// repo for "valtio" package: https://github.com/pmndrs/valtio
// repo for "derive-valtio" package: https://github.com/valtiojs/derive-valtio

beforeAll(() => {
  const window = new Window();
  global.window = window as any;
  global.document = window.document as any;
});

beforeEach(() => {
  cleanup();
});

test("valtio condition with proxy() and derive()", async () => {
  // given:
  const field1Input = proxy({ value: 0 });
  const field1Link = proxy<{ value: number | null }>({ value: null });
  const field1 = derive({
    // when dependencies change, value() getter is updated after the next tick.
    value(get) {
      // dependencies with derived value:
      return get(field1Link).value ?? get(field1Input).value;
    },
  });
  const field2 = proxy({
    // dependencies:
    field1Link,
    field1Input,
    // when dependencies change, value() getter is updated immediately.
    get value() {
      // derived value:
      return field1Link.value ?? field1Input.value;
    },
  });

  // when:
  console.log("version", getVersion(field1), getVersion(field2));
  field1Input.value = 100;
  await tick();
  console.log("version", getVersion(field1), getVersion(field2));

  // then:
  expect(snapshot(field1Input).value).toBe(100);
  expect(snapshot(field1).value).toBe(100);
  expect(snapshot(field2).value).toBe(100);

  // when
  field1Link.value = 200;
  await tick();
  console.log("version", getVersion(field1), getVersion(field2));

  // then:
  expect(snapshot(field1).value).toBe(200);
  expect(snapshot(field2).value).toBe(200);

  // when:
  field1Link.value = null;
  await tick();
  console.log("version", getVersion(field1), getVersion(field2));

  // then:
  expect(snapshot(field1).value).toBe(100);
  expect(snapshot(field2).value).toBe(100);
});

export const tick = () => {
  // schedules a function to be executed in the next iteration of the event loop,
  // after the current event loop cycle completes.
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
};
