import { proxy, useSnapshot } from "valtio";
import { derive } from "derive-valtio";
import { store } from "./store";
import { useCallback } from "react";
import { nanoid } from "nanoid";
import * as Lucide from "lucide-react";

type Item = { id: string; name: string };

const myProxy = proxy({
  items: [] as Item[],
});

const fooProxy = proxy({
  fooStore: store,
  get fooCount() {
    return this.fooStore.count + 1;
  },
});

const barProxy = derive({
  barCount(get) {
    return get(store).count + 1;
  },
});

export const App = () => {
  return (
    <div className="relative font-sans min-h-dvh bg-[#F5F3EF] font-[400]">
      <div className="p-4 bg-[#FFFFFF] font-[600]">
        <span>Beispielkalkulation</span>
      </div>
      <div className="p-4 text-[#0F203C]">
        <Board>
          <Section>Gagen</Section>
          <Subsection>Produktionsstab</Subsection>
          <Group>
            <Item>Produzent</Item>
            <Item>Produktionsleitung</Item>
            <Item>1. Aufnahmeleitung</Item>
          </Group>
          <Subsection>Regiestab</Subsection>
          <Group>
            <Item>Regie</Item>
            <Item>1. Regieassistenz</Item>
            <Item>Script / Continuity</Item>
          </Group>
          <Subsection>Kamerastab</Subsection>
          <Group>
            <Item>Kamera</Item>
            <Item>1. Kameraassistenz</Item>
          </Group>
        </Board>
      </div>

      <div className="hidden">
        <Bar />
        <Foo />
      </div>
    </div>
  );
};

type BoardProps = {
  children?: React.ReactNode;
};

const Board = ({ children }: BoardProps) => {
  return (
    <div className="mx-auto max-w-[800px] bg-[#ECE7DE] px-4 pb-4 box-content rounded-lg">
      {children}
    </div>
  );
};

type GroupProps = {
  children?: React.ReactNode;
};

const Group = ({ children }: GroupProps) => {
  return <div className="bg-[#FFFFFF] rounded-lg">{children}</div>;
};

type SectionProps = {
  children?: React.ReactNode;
};

const Section = ({ children }: SectionProps) => {
  return (
    <div className="flex items-center justify-between border-b border-[#B8AE9C] py-4 px-2">
      <div className="font-[600] flex items-center gap-2">
        <Lucide.ChevronDown size={18} />
        <span>{children}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-[600] text-sm tabular-nums">3000 EUR</div>
        <Lucide.Trash size={18} />
      </div>
    </div>
  );
};

type SubsectionProps = {
  children?: React.ReactNode;
};

const Subsection = ({ children }: SubsectionProps) => {
  return (
    <div className="flex items-center justify-between py-4 px-2">
      <div className="flex items-center gap-2">
        <Lucide.ChevronDown size={18} />
        <span>{children}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-[600] text-sm tabular-nums">3000 EUR</div>
        <Lucide.Trash size={18} />
      </div>
    </div>
  );
};
type ItemProps = {
  children?: React.ReactNode;
};

const Item = ({ children }: ItemProps) => {
  return (
    <div className="flex items-center justify-between py-2 px-2">
      <div className="flex items-center gap-2">
        <Lucide.GripVertical className="text-[#918D85]" size={18} />
        <div className="grid grid-flow-col auto-cols-max grid-rows-[auto_auto]">
          <label className="text-xs text-[#1C4E88] font-[600]">Description</label>
          <input
            className="pr-2 mr-4 max-w-[220px] border-r border-[#888A90]"
            defaultValue={children as string}
          />
          <label className="text-xs text-[#1C4E88] font-[600]">Amount</label>
          <input className="pr-2 mr-4 max-w-[80px] border-r border-[#888A90]" defaultValue="1" />
          <label className="text-xs text-[#1C4E88] font-[600]">Days</label>
          <input className="pr-2 mr-4 max-w-[80px] border-r border-[#888A90]" defaultValue="1" />
          <label className="text-xs text-[#1C4E88] font-[600]">Price/Unit</label>
          <input
            className="pr-2 mr-4 max-w-[120px] border-r-0 border-[#888A90]"
            defaultValue="1000"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-[600] text-sm tabular-nums">1000 EUR</div>
        <Lucide.X size={18} />
      </div>
    </div>
  );
};

const Bar = () => {
  const { title } = useSnapshot(store, { sync: true });
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      store.title = value;
    },
    [store]
  );

  return (
    <div className="p-4">
      <div>title: {title}</div>
      <input className="block w-full hover:bg-gray-300" value={title} onChange={onChange} />
    </div>
  );
};

const Foo = () => {
  const { title, count } = useSnapshot(store);
  const foo = useSnapshot(fooProxy);
  const bar = useSnapshot(barProxy);
  const onClick = useCallback(() => {
    store.title = "foobar";
    store.count += 1;
  }, [store]);
  const onClick2 = useCallback(() => {
    const item = { id: nanoid(10), name: "foo" };
    myProxy.items.push(item);
  }, [myProxy]);
  const onClick3 = useCallback(
    (item: Item) => {
      const itemIndex = myProxy.items.findIndex((it) => it.id === item.id);
      myProxy.items.splice(itemIndex, 1);
    },
    [myProxy]
  );
  const items = useSnapshot(myProxy.items);

  return (
    <div className="p-4">
      <div>title: {title}</div>
      <div>count: {count}</div>
      <div>count: {foo.fooCount}</div>
      <div>count: {bar.barCount}</div>
      <button className="block hover:bg-gray-300" tabIndex={1} onClick={onClick}>
        click
      </button>
      <button className="block hover:bg-gray-300" tabIndex={1} onClick={onClick2}>
        click
      </button>
      <div>
        {items.map((item) => {
          return (
            <div className="flex gap-2" key={item.id}>
              <span>{item.id}</span>
              <button className="block hover:bg-gray-300" onClick={() => onClick3(item)}>
                remove
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
