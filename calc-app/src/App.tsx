import { proxy, useSnapshot } from "valtio";
import { derive } from "derive-valtio";
import { store } from "./store";
import { useCallback } from "react";
import { nanoid } from "nanoid";

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
    <div className="relative font-sans min-h-dvh">
      <Bar />
      <Foo />
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
