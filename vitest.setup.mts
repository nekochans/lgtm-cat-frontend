import "@testing-library/jest-dom/vitest";
import { loadEnvConfig } from "@next/env";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

loadEnvConfig(process.cwd());

// jsdom は Element.prototype.scrollTo を実装していないため、react-aria がメニューの
// フォーカス移動時に requestAnimationFrame 内で呼び出すと未処理例外になり
// suite 全体が exit code 1 で失敗する。何もしない実装で補う
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {
    // jsdom に描画領域は無いため何もしない
  };
}

afterEach(() => {
  cleanup();
});
