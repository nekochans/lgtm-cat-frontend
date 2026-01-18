// 絶対厳守：編集前に必ずAI実装ルールを読む

import type { Language } from "@/features/language";
import { assertNever } from "@/utils/assert-never";

export interface McpToolInfo {
  readonly name: string;
  readonly description: string;
  readonly responseFormat: string;
  readonly responseExample: string;
}

export interface McpConfigPattern {
  readonly title: string;
  readonly description?: string;
  readonly code: string;
  readonly note?: string;
}

export interface McpGitHubActionsExample {
  readonly title: string;
  readonly description: string;
  readonly folderStructure: string;
  readonly folderNote?: string;
  readonly mcpConfigCode?: string;
  readonly mcpConfigDescription?: string;
  readonly workflowCode: string;
  readonly outputDescription: string;
  readonly screenshotPath: string;
  readonly screenshotAlt: string;
  readonly screenshotWidth: number;
  readonly screenshotHeight: number;
}

export interface McpTexts {
  readonly overview: {
    readonly title: string;
    readonly intro: string;
    readonly useCases: readonly string[];
  };
  readonly availableTools: {
    readonly title: string;
    readonly tools: readonly McpToolInfo[];
  };
  readonly clientConfig: {
    readonly title: string;
    readonly intro: {
      readonly main: string;
      readonly authTitle: string;
      readonly authDescription: string;
      readonly serverUrlTitle: string;
      readonly serverUrl: string;
    };
    readonly patternsIntro: string;
    readonly patterns: readonly McpConfigPattern[];
  };
  readonly githubActions: {
    readonly title: string;
    readonly examples: readonly McpGitHubActionsExample[];
  };
}

const mcpServerUrl = "https://api.lgtmeow.com/sse";

const nodeConfigCode = `{
  "mcpServers": {
    "lgtmeow": {
      "command": "npx",
      "args": ["mcp-remote", "${mcpServerUrl}"]
    }
  }
}`;

const pythonConfigCode = `{
  "mcpServers": {
    "lgtmeow": {
      "command": "uvx",
      "args": [
        "mcp-proxy",
        "${mcpServerUrl}"
      ]
    }
  }
}`;

const lgtmImagesResponseExample = `{
  "lgtmImages": [
    {
      "id": "1",
      "url": "https://lgtm-images.lgtmeow.com/2021/03/16/23/5947f291-a46e-453c-a230-0d756d7174cb.webp"
    },
    {
      "id": "2",
      "url": "https://lgtm-images.lgtmeow.com/2021/03/16/23/6947f291-a46e-453c-a230-0d756d7174cb.webp"
    }
  ]
}`;

const markdownResponseExample = `{
  "markdown": "[![LGTMeow](https://lgtm-images.lgtmeow.com/2022/03/23/10/9738095a-f426-48e4-be8d-93f933c42917.webp)](https://lgtmeow.com)"
}`;

export function getMcpTexts(language: Language): McpTexts {
  switch (language) {
    case "ja":
      return {
        overview: {
          title: "LGTMeow MCPサーバー",
          intro:
            "LGTMeow は、MCP(Model Context Protocol)に対応したリモートMCPサーバーを提供しています。MCPを利用すると、AIエージェントから猫のLGTM画像を簡単に呼び出すことができるようになります。",
          useCases: [
            "レビュー結果に応じてAIが自動でLGTM画像を挿入する",
            "「LGTM画像ください」と依頼して、Markdownを受け取る",
          ],
        },
        availableTools: {
          title: "利用可能ツール",
          tools: [
            {
              name: "get_random_lgtm_images",
              description: "ランダムに選択されたLGTM画像のリストを返します。",
              responseFormat: "application/json",
              responseExample: lgtmImagesResponseExample,
            },
            {
              name: "get_recently_created_lgtm_images",
              description: "最近作成されたLGTM画像のリストを返します。",
              responseFormat: "application/json",
              responseExample: lgtmImagesResponseExample,
            },
            {
              name: "get_random_lgtm_markdown",
              description:
                "Markdown 形式の LGTM 画像を 1 件返します。PRコメントなどにそのまま貼り付け可能です。",
              responseFormat: "application/json",
              responseExample: markdownResponseExample,
            },
          ],
        },
        clientConfig: {
          title: "MCPクライアントの設定方法",
          intro: {
            main: "LGTMeow MCP Server は、リモート(SSE)方式のみ提供しています。",
            authTitle: "認証について",
            authDescription:
              "認証不要で利用できます。API キーやトークンの設定は不要です。",
            serverUrlTitle: "サーバー URL",
            serverUrl: mcpServerUrl,
          },
          patternsIntro:
            "お使いの MCP クライアントが SSE を「直接サポートしているか」に応じて、以下の 3 パターンのいずれかを利用してください。",
          patterns: [
            {
              title: "SSE を直接サポートするクライアントの場合",
              // 実際の値は page.tsx から props として渡される
              code: "",
            },
            {
              title: "Node 環境 / mcp-remote を使う場合",
              description:
                "クライアントが SSE を直接サポートしない場合、mcp-remote を利用して SSE → stdio をブリッジできます。",
              code: nodeConfigCode,
              note: "npx が見つからない場合は、Node.js がインストールされているか、PATH が通っているかをご確認ください。必要に応じて npx のフルパスを指定してください。",
            },
            {
              title: "Python / uvx + mcp-proxy を使う場合",
              description: "Python ユーザー向けの SSE → stdio ブリッジです。",
              code: pythonConfigCode,
              note: "uvx が見つからない場合は、インストール状況と PATH をご確認ください。必要に応じて uvx のフルパスを指定してください。",
            },
          ],
        },
        githubActions: {
          title: "GitHub Actionsで LGTM画像を自動コメントする",
          examples: [
            {
              title: "Claude Code Action を使った例",
              description:
                "PR が作成 or 更新された際に Claude Code がレビューを実行し、マージ可能と判断した場合に LGTMeow MCP Server から LGTM 画像を取得して自動でコメントするワークフロー例です。",
              folderStructure: `.github
├── mcp-servers.json              # LGTMeow MCP Server の設定
└── workflows
    └── claude-auto-review.yml    # PR を自動レビューする GitHub Actions`,
              mcpConfigDescription:
                "MCP サーバー設定 (.github/mcp-servers.json)",
              // 実際の値は page.tsx から props として渡される
              mcpConfigCode: "",
              workflowCode: "",
              outputDescription:
                "マージ可能と判断された場合、Claude Code は LGTMeow MCP Server から取得した Markdown 形式の LGTM 画像を含むコメントを自動で PR に投稿します。",
              screenshotPath:
                "/screenshots/claude-auto-review-with-lgtmeow-mcp.webp",
              screenshotAlt: "Claude Code による自動レビューとLGTM画像投稿の例",
              screenshotWidth: 700,
              screenshotHeight: 496,
            },
            {
              title: "Codex Action を使った例",
              description:
                "PR が作成 or 更新された際に Codex Action がレビューを実行し、マージ可能と判断した場合に LGTMeow MCP Server から LGTM 画像を取得して自動でコメントするワークフロー例です。",
              folderStructure: `.github
└── workflows
    └── codex-auto-review.yml    # PR を自動レビューする GitHub Actions`,
              folderNote:
                "Codex Action は MCP サーバー設定を codex-args で直接指定できるため、.github/mcp-servers.json は不要です。",
              // 実際の値は page.tsx から props として渡される
              workflowCode: "",
              outputDescription:
                "マージ可能と判断された場合、Codex Action は LGTMeow MCP Server から取得した Markdown 形式の LGTM 画像を含むコメントを自動で PR に投稿します。",
              screenshotPath:
                "/screenshots/codex-auto-review-with-lgtmeow-mcp.webp",
              screenshotAlt: "Codex による自動レビューとLGTM画像投稿の例",
              screenshotWidth: 700,
              screenshotHeight: 406,
            },
          ],
        },
      };
    case "en":
      return {
        overview: {
          title: "LGTMeow MCP Server",
          intro:
            "LGTMeow provides a remote MCP (Model Context Protocol) server. With MCP, you can easily call cat LGTM images from AI agents.",
          useCases: [
            "AI automatically inserts LGTM images based on review results",
            'Request "Please give me an LGTM image" and receive Markdown',
          ],
        },
        availableTools: {
          title: "Available Tools",
          tools: [
            {
              name: "get_random_lgtm_images",
              description: "Returns a list of randomly selected LGTM images.",
              responseFormat: "application/json",
              responseExample: lgtmImagesResponseExample,
            },
            {
              name: "get_recently_created_lgtm_images",
              description: "Returns a list of recently created LGTM images.",
              responseFormat: "application/json",
              responseExample: lgtmImagesResponseExample,
            },
            {
              name: "get_random_lgtm_markdown",
              description:
                "Returns one LGTM image in Markdown format. You can paste it directly into PR comments.",
              responseFormat: "application/json",
              responseExample: markdownResponseExample,
            },
          ],
        },
        clientConfig: {
          title: "MCP Client Configuration",
          intro: {
            main: "LGTMeow MCP Server only supports remote (SSE) mode.",
            authTitle: "Authentication",
            authDescription:
              "No authentication required. No API key or token configuration is needed.",
            serverUrlTitle: "Server URL",
            serverUrl: mcpServerUrl,
          },
          patternsIntro:
            "Depending on whether your MCP client directly supports SSE, use one of the following 3 patterns.",
          patterns: [
            {
              title: "For clients that directly support SSE",
              // 実際の値は page.tsx から props として渡される
              code: "",
            },
            {
              title: "For Node environment / using mcp-remote",
              description:
                "If your client doesn't directly support SSE, you can use mcp-remote to bridge SSE → stdio.",
              code: nodeConfigCode,
              note: "If npx is not found, please verify that Node.js is installed and PATH is configured. Specify the full path to npx if needed.",
            },
            {
              title: "For Python / uvx + mcp-proxy",
              description: "This is an SSE → stdio bridge for Python users.",
              code: pythonConfigCode,
              note: "If uvx is not found, please verify installation and PATH. Specify the full path to uvx if needed.",
            },
          ],
        },
        githubActions: {
          title: "Auto-comment LGTM Images with GitHub Actions",
          examples: [
            {
              title: "Using Claude Code Action",
              description:
                "This is a workflow example where Claude Code performs a review when a PR is created or updated, and if it determines the PR is mergeable, it automatically fetches an LGTM image from LGTMeow MCP Server and posts a comment.",
              folderStructure: `.github
├── mcp-servers.json              # LGTMeow MCP Server configuration
└── workflows
    └── claude-auto-review.yml    # GitHub Actions for auto PR review`,
              mcpConfigDescription:
                "MCP Server Configuration (.github/mcp-servers.json)",
              // 実際の値は page.tsx から props として渡される
              mcpConfigCode: "",
              workflowCode: "",
              outputDescription:
                "When determined as mergeable, Claude Code automatically posts a comment to the PR containing a Markdown-formatted LGTM image retrieved from LGTMeow MCP Server.",
              screenshotPath:
                "/screenshots/claude-auto-review-with-lgtmeow-mcp.webp",
              screenshotAlt:
                "Example of auto review and LGTM image posting by Claude Code",
              screenshotWidth: 700,
              screenshotHeight: 496,
            },
            {
              title: "Using Codex Action",
              description:
                "This is a workflow example where Codex Action performs a review when a PR is created or updated, and if it determines the PR is mergeable, it automatically fetches an LGTM image from LGTMeow MCP Server and posts a comment.",
              folderStructure: `.github
└── workflows
    └── codex-auto-review.yml    # GitHub Actions for auto PR review`,
              folderNote:
                "Codex Action can specify MCP server configuration directly via codex-args, so .github/mcp-servers.json is not needed.",
              // 実際の値は page.tsx から props として渡される
              workflowCode: "",
              outputDescription:
                "When determined as mergeable, Codex Action automatically posts a comment to the PR containing a Markdown-formatted LGTM image retrieved from LGTMeow MCP Server.",
              screenshotPath:
                "/screenshots/codex-auto-review-with-lgtmeow-mcp.webp",
              screenshotAlt:
                "Example of auto review and LGTM image posting by Codex",
              screenshotWidth: 700,
              screenshotHeight: 406,
            },
          ],
        },
      };
    default:
      return assertNever(language);
  }
}
