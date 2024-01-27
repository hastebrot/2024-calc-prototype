import { expect, test } from "vitest";
import { parseEdn, parseEdnValue } from "../src/model/edn";
import { processUi } from "../src/model/ui";

test("edn", () => {
  const edn = /*clojure*/ `
  ; example
  #ui/definition [
    #ui/base [
      {:name "posten"}
      {:output money, :label "output"}

      ui/group
      {:input text, :label "bezeichnung", :link text}

      ui/group
      {:input number, :label "menge", :link number}
      {:input number, :label "tage", :link number}
      {:input money, :label "gage", :link money}

      ui/logic
      {:target #"output", :source [#"menge" * #"tage" * #"gage"]}
      {:target #"temp1", :source [if #"menge" > 10 then 20 * #"tage" else 30]}
      {:target #"temp2", :source [if #"temp1" >= 10 then 0 else 1]}

      ui/test
      {:when {#"bezeichnung" "text", #"menge" 1, #"tage" 5, #"gage" 1000}
       :then {#"output" 5000}}
    ]

    #ui/addon [
      {:name "markup"}
      {:output money, :label "output"}

      ui/group
      {:input select, :label "kategorie"}
      {:input factor, :label "satz"}
      {:input money, :label "basis"}
    ]

    #ui/addon [
      {:name "sozialabgaben"}
      {:output money, :label "output"}

      ui/group
      {:input checkbox, :label "aga"}
      {:input checkbox, :label "ksk"}
      {:input checkbox, :label "50a"}
      {:input money, :label "basis"}
      {:output money, :label "output/1"}

      ui/group
      {:input select, :label "kategorie"}
      {:input factor, :label "satz"}
      {:output money, :label "output/2"}

      ui/logic
      {:target #"output/1", :source [js/calculateSocial #"aga" #"ksk" #"50a" #"basis"]}
    ]

    #ui/addon [
      {:name "ueberstunden"}
      {:output money, :label "output"}

      ui/group
      {:input slider, :label "tage"}
      {:output money, :label "output/1"}

      ui/group
      {:input select, :label "kategorie"}
      {:input factor, :label "satz"}
      {:input money, :label "basis"}
      {:output money, :label "output/2"}
    ]
  ]
  `;

  const json = parseEdn(edn);
  const result = parseEdnValue(json);
  expect(result.success).toBe(true);
  if (result.success) {
    const ui = processUi(result.data as object);
    console.log(ui);
    // console.dir(result.data, { depth: 10 });
  }
});

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
