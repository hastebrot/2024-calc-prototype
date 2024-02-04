import { expect, test } from "vitest";
import { parseEdn, parseEdnValue } from "../src/model/edn";
import { processUi } from "../src/model/ui";

test("edn", () => {
  const edn = /*clojure*/ `
  ; example
  #ui/definition [
    #ui/base [
      ui/group
      {:input text, :label "Description"}
      {:input number, :label "Amount"}
      {:input number, :label "Days"}
      {:input money, :label "Price/Unit"}
      {:output money, :label "output"}

      ui/logic
      {:target "output", :source ["Amount" * "Days" * "Price/Unit"]}

      ui/test
      {:when {"Amount" 1, "Days" 5, "Price/Unit" 1000}
       :then {"output" 5000}}
      {:when {"Amount" 2, "Days" 5, "Price/Unit" 1000}
       :then {"output" 10000}}
    ]
  ]
  `;

  const json = parseEdn(edn);
  const result = parseEdnValue(json);
  expect(result.success).toBe(true);
  if (result.success) {
    const ui = processUi(result.data as object);
    // console.log(inspect(ui, { colors: true }));
    console.dir(ui, { depth: 10, colors: true });
    // console.dir(result.data, { depth: 10 });
  }
});

// 1. create inputs and outputs in map. we use map keys to refer to the inputs and outputs
// 2. inputs with isLinkable are switches (they have two input ports)
// 3. update outputs according to the logic
// 4. create code for tests

test("edn grammar", () => {
  const json = parseEdn(`
    #tag [{:foo 1, :bar "2", :baz false}]
  `);

  const result = parseEdnValue(json);
  expect(result.success).toBe(true);
  if (result.success) {
    // console.dir(result.data, { depth: 10 });
  }
});
