// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import { mPlusRounded1c } from "../src/app/fonts";
import { Providers } from "../src/components/heroui/providers";
import "../src/app/globals.css";

initialize();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    viewport: {
      options: INITIAL_VIEWPORTS,
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    (Story) => (
      <div className={mPlusRounded1c.variable}>
        <Providers>
          <Story />
        </Providers>
      </div>
    ),
  ],
  loaders: [mswLoader],
};

export default preview;
