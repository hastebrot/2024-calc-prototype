import { proxy, useSnapshot } from "valtio";
import { derive } from "derive-valtio";
import { store } from "./store";
import { useCallback } from "react";

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
  const { title, count } = useSnapshot(store);
  const foo = useSnapshot(fooProxy);
  const bar = useSnapshot(barProxy);
  const onClick = useCallback(() => {
    store.title = "foobar";
    store.count += 1;
  }, [store]);

  return (
    <div className="relative font-sans min-h-dvh">
      <div className="p-4">
        <div>title: {title}</div>
        <div>count: {count}</div>
        <div>count: {foo.fooCount}</div>
        <div>count: {bar.barCount}</div>
        <button tabIndex={1} onClick={onClick}>
          click
        </button>
      </div>
    </div>
  );
};
