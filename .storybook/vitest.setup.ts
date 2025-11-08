// 絶対厳守：編集前に必ずAI実装ルールを読む
// biome-ignore lint/performance/noNamespaceImport: Storybook addon annotations require namespace imports
import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/nextjs-vite";
// biome-ignore lint/performance/noNamespaceImport: Storybook project annotations require namespace imports
import * as projectAnnotations from "./preview";

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
