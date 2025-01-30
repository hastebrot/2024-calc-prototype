// ❯ bun test --watch valtio.test

import { cleanup } from "@testing-library/react";
import { derive } from "derive-valtio";
import { Window } from "happy-dom";
import { proxy, snapshot, subscribe } from "valtio";
import { beforeAll, beforeEach, expect, test, vi } from "vitest";

// repo for "valtio" package: https://github.com/pmndrs/valtio
// repo for "derive-valtio" package: https://github.com/valtiojs/derive-valtio

// derive(proxy, { sync: true }):
// if (notifyInSync) {
//   unmarkPending(sourceObject)
// } else {
//   subscription.p = Promise.resolve().then(() => {
//     delete subscription.p // promise
//     unmarkPending(sourceObject)
//   })
// }

beforeAll(() => {
  const window = new Window();
  global.window = window as any;
  global.document = window.document as any;
});

beforeEach(() => {
  cleanup();
});

test("proxy subscription", async () => {
  // given:
  const field = proxy({
    value: 0,
    object: { value: 0 },
    array: [0],
  });
  const derivedField = deriveProxy(field, {
    derivedValue(get) {
      return get(field).value + 10;
    },
  });
  subscribe(field, (ops) => {
    // console.log("field", ...ops);
  });
  subscribe(derivedField, (ops) => {
    // console.log("derivedField", ...ops);
  });

  const fieldCallback = vi.fn();
  const fieldObjectCallback = vi.fn();
  subscribe(field, fieldCallback);
  subscribe(field.object, fieldObjectCallback);

  // when/then:
  field.value = 1;
  await tick();
  expect(fieldCallback).toBeCalledTimes(1);
  expect(fieldObjectCallback).toBeCalledTimes(0);

  // when/then:
  field.object.value = 1;
  await tick();
  expect(fieldCallback).toBeCalledTimes(2);
  expect(fieldObjectCallback).toBeCalledTimes(1);

  // when/then:
  field.array.push(1);
  await tick();
  expect(fieldCallback).toBeCalledTimes(3);
  expect(fieldObjectCallback).toBeCalledTimes(1);
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
  // console.log("version", getVersion(field1), getVersion(field2));
  field1Input.value = 100;
  await tick();
  // console.log("version", getVersion(field1), getVersion(field2));

  // then:
  expect(snapshot(field1Input).value).toBe(100);
  expect(snapshot(field1).value).toBe(100);
  expect(snapshot(field2).value).toBe(100);

  // when
  field1Link.value = 200;
  await tick();
  // console.log("version", getVersion(field1), getVersion(field2));

  // then:
  expect(snapshot(field1).value).toBe(200);
  expect(snapshot(field2).value).toBe(200);

  // when:
  field1Link.value = null;
  await tick();
  // console.log("version", getVersion(field1), getVersion(field2));

  // then:
  expect(snapshot(field1).value).toBe(100);
  expect(snapshot(field2).value).toBe(100);
});

test("valtio aggregation with proxy() and derive()", async () => {
  type FieldLink = { value: number };

  // given:
  const field1Links = proxy({
    value: [] as FieldLink[],
  });
  const field1 = derive({
    value: (get) => {
      let sum = 0;
      for (const fieldLink of get(field1Links).value) {
        sum += fieldLink.value;
      }
      return sum;
    },
  });
  const field2 = derive({
    value: (get) => {
      return get(field1).value + 1;
    },
  });

  // when:
  field1Links.value = [];

  // then:
  expect(snapshot(field1).value).toBe(0);
  expect(snapshot(field2).value).toBe(1);

  // when:
  field1Links.value = [proxy({ value: 1 })];
  await tick();

  // then:
  expect(snapshot(field1).value).toBe(1);
  expect(snapshot(field2).value).toBe(2);

  // when:
  const fieldLink = proxy({ value: 2 });
  field1Links.value.push(fieldLink);
  await tick();

  // then:
  expect(snapshot(field1).value).toBe(3);
  expect(snapshot(field2).value).toBe(4);

  // when:
  fieldLink.value = 3;
  await tick();

  // then:
  expect(snapshot(field1).value).toBe(4);
  expect(snapshot(field2).value).toBe(5);
});

export const tick = () => {
  // schedules a function to be executed in the next iteration of the event loop,
  // after the current event loop cycle completes.
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
};

export function deriveProxy<T extends object, U extends object>(
  proxy: T,
  derived: Parameters<typeof derive<T, U>>[0]
) {
  return derive(derived, { proxy });
}
