/**
 * main.ts
 * Boots the shell into #app.
 */

import { mount } from "./app";

const root = document.querySelector("#app");
if (root instanceof HTMLElement) mount(root);
