import { getVersion, proxy, snapshot } from "valtio";
import { derive } from "valtio/utils";
import { expect, test } from "vitest";
import { tick } from "./valtio.test";

test("should proxy and derive", async () => {
  // given:
  const field1Input = proxy({ value: 0 });
  const field1Link = proxy<{ value: number | null; }>({ value: null });
  const field1 = derive({
    // when dependencies change, value() getter is updated after the next tick.
    value(get) {
      // dependencies:
      return get(field1Link).value ?? get(field1Input).value;
    },
  });
  const field2 = proxy({
    // dependencies:
    field1Link,
    field1Input,
    // when dependencies change, value() getter is updated immediately.
    get value() {
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

  // when:
  field1Link.value = 200;
  await tick();
  console.log("version", getVersion(field1), getVersion(field2));

  // then:
  expect(snapshot(field1).value).toBe(200);
  expect(snapshot(field2).value).toBe(200);
});
