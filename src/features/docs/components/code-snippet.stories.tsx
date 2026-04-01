// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
import { CodeSnippet } from "./code-snippet";

const meta = {
  component: CodeSnippet,
  title: "features/docs/CodeSnippet",
  tags: ["autodocs"],
} satisfies Meta<typeof CodeSnippet>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * インラインコードスニペット
 */
export const Inline: Story = {
  args: {
    code: "npm install @heroui/react",
    variant: "inline",
  },
};

/**
 * JSONシンタックスハイライト
 */
export const Json: Story = {
  args: {
    code: `{
  "mcpServers": {
    "lgtmeow": {
      "type": "sse",
      "url": "https://api.lgtmeow.com/sse"
    }
  }
}`,
    variant: "block",
    language: "json",
  },
};

/**
 * YAMLシンタックスハイライト
 */
export const Yaml: Story = {
  args: {
    code: `name: Claude Code Auto Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6`,
    variant: "block",
    language: "yaml",
  },
};

/**
 * TypeScriptシンタックスハイライト
 */
export const Typescript: Story = {
  args: {
    code: `import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});

type User = z.infer<typeof userSchema>;`,
    variant: "block",
    language: "typescript",
  },
};

/**
 * プレーンテキスト
 */
export const Plaintext: Story = {
  args: {
    code: "![LGTM](https://lgtmeow.com/api/lgtm/random)",
    variant: "block",
    language: "plaintext",
  },
};
