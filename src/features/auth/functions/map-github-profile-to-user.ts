/**
 * GitHub OAuth プロフィールから Better Auth の user レコードへ保存する値への変換。
 *
 * プライバシー設計（Issue #480）:
 * - 実 email は DB に永続化しない。user.email は NOT NULL + UNIQUE 制約があるため、
 *   GitHub User ID から導出した匿名化メールアドレスで埋める。
 * - `.invalid` TLD は RFC 6761 で予約済みであり、どの SMTP も配送できない。
 * - name には GitHub username（公開情報）、image にはアバター URL（公開情報）を保存する。
 *   実名（profile.name）は保存しない。
 *
 * 注意: better-auth の GithubProfile 型は id を string と宣言しているが、
 * GitHub API の実レスポンスでは数値が入る。テンプレートリテラルで文字列化するため
 * どちらでも同じ結果になる。
 */
interface GithubProfileForMapping {
  readonly avatar_url: string;
  readonly id: string;
  readonly login: string;
}

interface MappedGithubUser {
  readonly email: string;
  readonly image: string;
  readonly name: string;
}

export function mapGithubProfileToUser(
  profile: GithubProfileForMapping
): MappedGithubUser {
  return {
    email: `gh-${profile.id}@no-email.lgtmeow.invalid`,
    name: profile.login,
    image: profile.avatar_url,
  };
}
