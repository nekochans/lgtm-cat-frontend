// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { Meta, StoryObj } from "@storybook/react";
// 重要: import type を使用してサーバー専用モジュールの混入を防止
import type { McpExternalCodes } from "../functions/mcp-code-loader";
import { DocsMcpPage } from "./docs-mcp-page";

// Storybook用のモックデータ
const mockExternalCodes: McpExternalCodes = {
  mcpServersJson: `{
  "mcpServers": {
    "lgtmeow": {
      "type": "sse",
      "url": "https://api.lgtmeow.com/sse"
    }
  }
}`,
  claudeAutoReviewYaml: `name: Claude Code Auto Review on PR Open

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-auto-review:
    runs-on: ubuntu-latest
    concurrency:
      group: \${{ github.workflow }}-\${{ github.event.pull_request.number }}
      cancel-in-progress: false
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v6
        with:
          fetch-depth: 0
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            リポジトリ: \${{ github.repository }}
            PR番号: \${{ github.event.pull_request.number }}

            このPRの変更内容をレビューしてください。

            レビュー完了後、必ず mcp__github__add_issue_comment ツールを使用して、
            上記のPR番号にレビュー結果をコメントとして投稿してください。

            マージ可能と判断した場合は、
            mcp__lgtmeow__get_random_lgtm_markdown で LGTM画像を取得し、
            レビューコメントに含めてください。

            問題がある場合は、改善点を具体的に指摘してください。

          claude_args: |
            --mcp-config .github/mcp-servers.json
            --allowedTools "Bash(git diff),Read,LS,Glob,Grep,mcp__github__pull_request_read,mcp__github__get_pull_request,mcp__github__get_pull_request_files,mcp__github__get_pull_request_diff,mcp__github__add_issue_comment,mcp__github__get_issue,mcp__lgtmeow__get_random_lgtm_markdown"

        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`,
  codexAutoReviewYaml: `name: Codex Auto Review on PR Open

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  codex:
    runs-on: ubuntu-latest
    concurrency:
      group: \${{ github.workflow }}-\${{ github.event.pull_request.number }}
      cancel-in-progress: false
    permissions:
      contents: read
    outputs:
      final_message: \${{ steps.run_codex.outputs.final-message }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v6
        with:
          ref: refs/pull/\${{ github.event.pull_request.number }}/merge

      - name: Pre-fetch base and head refs for the PR
        run: |
          git fetch --no-tags origin \\
            \${{ github.event.pull_request.base.ref }} \\
            +refs/pull/\${{ github.event.pull_request.number }}/head

      - name: Install mcp-proxy for SSE bridge
        run: pip install mcp-proxy

      - name: Run Codex
        id: run_codex
        uses: openai/codex-action@v1
        with:
          openai-api-key: \${{ secrets.OPENAI_API_KEY }}
          codex-args: |
            --config mcp_servers={"lgtmeow"={"command"="mcp-proxy","args"=["https://api.lgtmeow.com/sse"]}}
          prompt: |
            リポジトリ: \${{ github.repository }}
            PR番号: \${{ github.event.pull_request.number }}

            このPRの変更内容をレビューしてください。

            マージ可能な品質と判断した場合は、lgtmeow MCPサーバーの get_random_lgtm_markdown でLGTM画像を取得し、レビュー結果に含めてください。
            問題がある場合は、改善点を具体的に指摘してください。

            PRタイトルと本文:
            ----
            \${{ github.event.pull_request.title }}
            \${{ github.event.pull_request.body }}

  post_feedback:
    runs-on: ubuntu-latest
    needs: codex
    if: needs.codex.outputs.final_message != ''
    permissions:
      issues: write
      pull-requests: write

    steps:
      - name: Post review comment to PR
        uses: actions/github-script@v7
        env:
          CODEX_FINAL_MESSAGE: \${{ needs.codex.outputs.final_message }}
        with:
          github-token: \${{ github.token }}
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: process.env.CODEX_FINAL_MESSAGE,
            });`,
};

const meta = {
  component: DocsMcpPage,
  title: "features/docs/DocsMcpPage",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DocsMcpPage>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 日本語版MCPドキュメントページ
 */
export const Japanese: Story = {
  args: {
    language: "ja",
    currentUrlPath: "/docs/mcp",
    externalCodes: mockExternalCodes,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/docs/mcp",
      },
    },
  },
};

/**
 * 英語版MCPドキュメントページ
 */
export const English: Story = {
  args: {
    language: "en",
    currentUrlPath: "/en/docs/mcp",
    externalCodes: mockExternalCodes,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/en/docs/mcp",
      },
    },
  },
};
