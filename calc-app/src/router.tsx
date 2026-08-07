import { createHashRouter } from "react-router";
import { App } from "./App";

export const router = createHashRouter([
  /* wrap */
  { path: "/", element: <App /> },
]);
