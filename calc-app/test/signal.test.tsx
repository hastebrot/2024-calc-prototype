import { act, cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Window } from "happy-dom";
import React, { useEffect, useRef } from "react";
import { Signal, atom, computed } from "signia";
import { useValue } from "signia-react";
import { beforeAll, beforeEach, expect, test } from "vitest";
import { z } from "zod";
import { zodAtom, zodComputed } from "./zodSignia";

beforeAll(() => {
  const window = new Window();
  global.window = window as any;
  global.document = window.document as any;
});

beforeEach(() => {
  cleanup();
});

test("should state", async () => {
  type Subblock1Props = {
    state: {
      field1: Signal<string, unknown>;
    };
  };

  const Subblock1 = (props: Subblock1Props) => {
    const field1 = useValue(props.state.field1);
    return <div data-testid="block1.type1.field1">{field1}</div>;
  };

  // given:
  const signals = { field1: atom("field", "text") };
  const screen = render(<Subblock1 state={signals} />);
  expect(screen.getByTestId("block1.type1.field1").textContent).toBe("text");

  // when:
  act(() => {
    signals.field1.set("more text");
  });
  // screen.debug();

  // then:
  expect(screen.getByTestId("block1.type1.field1").textContent).toBe("more text");
});

test("should state 2", async () => {
  const Subblock1Signals = z.object({
    field1Input: zodAtom<number>(),
    field1Link: zodAtom<null | Signal<number, unknown>>(),
    field1: zodComputed<number>(),
    field2: zodComputed<number>(),
  });
  type Subblock1Props = {
    signals: z.infer<typeof Subblock1Signals>;
  };
  const Subblock1 = (props: Subblock1Props) => {
    const field1 = useValue(props.signals.field1);
    const field2 = useValue(props.signals.field2);
    return (
      <section>
        <div data-testid={props.signals.field1.name}>{field1}</div>
        <div data-testid={props.signals.field2.name}>{field2}</div>
      </section>
    );
  };

  const initSignals = () => {
    const signals = {} as z.infer<typeof Subblock1Signals>;
    signals.field1Input = atom("subblock1.field1Input", 100);
    signals.field1Link = atom("subblock1.field1Link", null);
    signals.field1 = computed("subblock1.field1", () => {
      return signals.field1Link.value?.value ?? signals.field1Input.value;
    });
    signals.field2 = computed("subblock1.field2", () => {
      return signals.field1.value + 1;
    });
    return signals;
  };

  const Manager = () => {
    const signals = useRef(initSignals());
    const link = useRef(atom("subblock2.output", 1));

    const updateLink = () => {
      signals.current.field1Link.set(link.current);
    };
    const updateLinkInput = () => {
      link.current.update((value) => value + 1);
    };

    return (
      <main>
        {signals.current && <Subblock1 signals={Subblock1Signals.parse(signals.current)} />}
        <button onClick={updateLink}>click</button>
        <button onClick={updateLinkInput}>click two</button>
      </main>
    );
  };

  // given:
  const screen = render(<Manager />);
  expect(screen.getByTestId("subblock1.field1").textContent).toBe("100");
  expect(screen.getByTestId("subblock1.field2").textContent).toBe("101");

  await userEvent.click(screen.getByText("click"));
  expect(screen.getByTestId("subblock1.field1").textContent).toBe("1");
  expect(screen.getByTestId("subblock1.field2").textContent).toBe("2");

  await userEvent.click(screen.getByText("click two"));
  expect(screen.getByTestId("subblock1.field1").textContent).toBe("2");
  expect(screen.getByTestId("subblock1.field2").textContent).toBe("3");

  // when:
  // act(() => {
  //   signals.field1Input.set(200);
  // });
  // // screen.debug();

  // // then:
  // expect(screen.getByTestId("subblock1.field1").textContent).toBe("2");
});

// number1, number2, text1, text2, numberOut
// flag1, flag2, factor1, number1

test("signal graph", async () => {
  const Block1Signals = z.object({
    field1Input: zodAtom<number>(),
    field1Link: zodAtom<null | Signal<number>>(),
    field1: zodComputed<number>(),
    field2: zodComputed<number>(),
  });
  type Block1Signals = z.infer<typeof Block1Signals>;

  const Block2Signals = z.object({
    field1: zodAtom<number>(),
    field2: zodComputed<number>(),
  });
  type Block2Signals = z.infer<typeof Block2Signals>;

  // create field1Input and empty field1Link and check fields.
  let block1 = {} as Block1Signals;
  block1.field1Input = atom("block1.field1Input", 100);
  block1.field1Link = atom("block1.field1Link", null);
  block1.field1 = computed("block1.field1", () => {
    return block1.field1Link.value?.value ?? block1.field1Input.value;
  });
  block1.field2 = computed("block1.field2", () => {
    return block1.field1.value + 1;
  });
  block1 = Block1Signals.parse(block1);

  let block2 = {} as Block2Signals;
  block2.field1 = atom("block2.field1", 200);
  block2.field2 = computed("block2.field2", () => {
    return block2.field1.value + 1;
  });

  type Block1Props = {
    signals: z.infer<typeof Block1Signals>;
    extField1Link?: Signal<number>;
  };
  const Block1 = (props: Block1Props) => {
    const field1 = useValue(props.signals.field1);
    const field2 = useValue(props.signals.field2);
    const field1Input = useValue(props.signals.field1Input);
    const onChangeField1Input = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.currentTarget.value);
      const number = isNaN(value) ? 0 : value;
      props.signals.field1Input.set(number);
    };
    useEffect(() => {
      const signal = props.extField1Link ?? null;
      props.signals.field1Link.set(signal);
    }, [props.extField1Link]);

    return (
      <section>
        <div data-testid={props.signals.field1.name}>{field1}</div>
        <div data-testid={props.signals.field2.name}>{field2}</div>
        <input
          data-testid={props.signals.field1Input.name}
          value={field1Input}
          onChange={onChangeField1Input}
        />
      </section>
    );
  };

  type Block2Props = {
    signals: z.infer<typeof Block2Signals>;
  };
  const Block2 = (props: Block2Props) => {
    const field1 = useValue(props.signals.field1);
    const field2 = useValue(props.signals.field2);

    return (
      <section>
        <div data-testid={props.signals.field1.name}>{field1}</div>
        <div data-testid={props.signals.field2.name}>{field2}</div>
      </section>
    );
  };

  const result = render(
    <section>
      <Block1 signals={block1}></Block1>
      <Block2 signals={block2}></Block2>
    </section>
  );
  expect(result.getByTestId("block1.field1").textContent).toBe("100");
  expect(result.getByTestId("block1.field2").textContent).toBe("101");
  expect(result.getByTestId("block2.field1").textContent).toBe("200");
  expect(result.getByTestId("block2.field2").textContent).toBe("201");

  result.rerender(
    <section>
      <Block1 signals={block1} extField1Link={block2.field2}></Block1>
      <Block2 signals={block2}></Block2>
    </section>
  );
  expect(result.getByTestId("block1.field1").textContent).toBe("201");
  expect(result.getByTestId("block1.field2").textContent).toBe("202");
  expect(result.getByTestId("block2.field1").textContent).toBe("200");
  expect(result.getByTestId("block2.field2").textContent).toBe("201");

  act(() => {
    block2.field1.set(500);
  });
  expect(result.getByTestId("block1.field1").textContent).toBe("501");
  expect(result.getByTestId("block1.field2").textContent).toBe("502");

  result.rerender(
    <section>
      <Block1 signals={block1} extField1Link={undefined}></Block1>
    </section>
  );
  expect(result.getByTestId("block1.field1").textContent).toBe("100");
  expect(result.getByTestId("block1.field2").textContent).toBe("101");

  // await userEvent.setup({ document }).clear(result.getByTestId("block1.field1Input"));
  await userEvent.type(result.getByTestId("block1.field1Input"), "234", {
    initialSelectionStart: 0,
    initialSelectionEnd: Number.MAX_VALUE,
  });
  expect(result.getByTestId("block1.field1").textContent).toBe("234");
  expect(result.getByTestId("block1.field2").textContent).toBe("235");
});
