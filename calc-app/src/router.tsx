import { createHashRouter } from "react-router-dom";
import { App } from "./App";

export const router = createHashRouter([
  /* wrap */
  { path: "/", element: <App /> },
]);
