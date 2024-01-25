import { proxy } from "valtio";

export { deepClone } from "valtio/utils";

export type Store = {
  title: string;
  count: number;
};

export const store = proxy<Store>({
  title: "title",
  count: 0,
});
