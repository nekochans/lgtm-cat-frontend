import { describe, expect, it } from "vitest";
import { mapGithubProfileToUser } from "@/features/auth/functions/map-github-profile-to-user";

describe("src/features/auth/functions/map-github-profile-to-user.ts mapGithubProfileToUser TestCases", () => {
  interface TestTable {
    readonly avatarUrl: string;
    readonly expectedEmail: string;
    readonly githubUserId: string;
    readonly login: string;
  }

  it.each`
    githubUserId  | login        | avatarUrl                                             | expectedEmail
    ${"11032365"} | ${"keitakn"} | ${"https://avatars.githubusercontent.com/u/11032365"} | ${"gh-11032365@no-email.lgtmeow.invalid"}
    ${"1"}        | ${"octocat"} | ${"https://avatars.githubusercontent.com/u/1"}        | ${"gh-1@no-email.lgtmeow.invalid"}
  `(
    "should map GitHub profile to anonymized user when id is $githubUserId",
    ({ githubUserId, login, avatarUrl, expectedEmail }: TestTable) => {
      const mappedUser = mapGithubProfileToUser({
        id: githubUserId,
        login,
        avatar_url: avatarUrl,
      });

      expect(mappedUser).toStrictEqual({
        email: expectedEmail,
        name: login,
        image: avatarUrl,
      });
    }
  );

  it("should create anonymized email when GitHub API returns numeric id at runtime", () => {
    // better-auth の GithubProfile 型では id は string だが、GitHub API の実レスポンスは数値。
    // テンプレートリテラルで文字列化されるため同じ結果になる事を担保する。
    const numericIdProfile = {
      id: 11_032_365 as unknown as string,
      login: "keitakn",
      avatar_url: "https://avatars.githubusercontent.com/u/11032365",
    };

    expect(mapGithubProfileToUser(numericIdProfile).email).toBe(
      "gh-11032365@no-email.lgtmeow.invalid"
    );
  });
});
