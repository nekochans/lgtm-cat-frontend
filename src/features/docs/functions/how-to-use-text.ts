import { getActionButtonText } from "@/functions/service-description-text";
import { createIncludeLanguageAppPath } from "@/functions/url";
import type { Language } from "@/types/language";
import type { Url } from "@/types/url";
import { assertNever } from "@/utils/assert-never";

export interface HowToUseSectionText {
  readonly content: readonly string[];
  readonly title: string;
}

export interface HowToUseContactText {
  readonly formLabel: string;
  readonly formLinkText: string;
  readonly formUrl: string;
  readonly intro: string;
  readonly issueLabel: string;
  readonly issueLinkText: string;
  readonly issueUrl: string;
  readonly methodsIntro: string;
  readonly title: string;
}

export interface HowToUseTexts {
  readonly contact: HowToUseContactText;
  readonly copyByClicking: {
    readonly title: string;
    readonly intro: string;
    readonly buttonDescription: readonly string[];
    readonly screenshotDescription: string;
  };
  readonly copyRandom: {
    readonly title: string;
    readonly content: string;
  };
  readonly uploadCatPhoto: {
    readonly title: string;
    readonly content: readonly string[];
  };
  readonly whatIsLgtm: HowToUseSectionText;
  readonly whatIsLgtmeow: HowToUseSectionText;
}

export function getHowToUseTexts(
  language: Language,
  baseUrl: Url
): HowToUseTexts {
  const homePath = createIncludeLanguageAppPath("home", language);
  const homeUrl = homePath === "/" ? baseUrl : `${baseUrl}${homePath}`;
  const uploadPath = createIncludeLanguageAppPath("upload", language);
  const uploadUrl = `${baseUrl}${uploadPath}`;
  const buttonText = getActionButtonText(language);

  switch (language) {
    case "ja":
      return {
        whatIsLgtm: {
          title: "LGTMとは?",
          content: [
            "「Looks Good To Me」の略で、「私は良いと思う」という意味です。",
            "エンジニアの間では PR を Approve する際に LGTM(Looks Good To Me)を伝えるために画像を貼る文化があります。",
          ],
        },
        whatIsLgtmeow: {
          title: "LGTMeowとは",
          content: [
            "可愛い猫のLGTM画像を作成して共有できるサービスです。",
            "他のLGTM画像サービスとは違って可愛い猫が写っているLGTM画像を探したり、作ったりできるのが特徴です。",
          ],
        },
        copyByClicking: {
          title: "LGTM画像を選んでコピーする",
          intro: `[HOME](${homeUrl}) に並んでいるLGTM画像をクリックするとGitHubに貼り付ける為のマークダウンソースがクリップボードにコピーされます。`,
          buttonDescription: [
            "表示されている猫の画像ですが以下の2つのボタンを押下すると切り替える事が可能です。",
            `\`${buttonText.refreshCats}\` ボタンを押下するとサーバーからランダムに取得したLGTM画像を表示します(押下する度に結果が変わります)`,
            `\`${buttonText.latestCats}\` ボタンを押下すると最近アップロードされたLGTM画像を表示します`,
          ],
          screenshotDescription:
            "GitHubにマークダウンソースを貼り付けると以下のようになります。",
        },
        copyRandom: {
          title: "LGTM画像をランダムでコピーする",
          content: `[HOME](${homeUrl}) にある \`${buttonText.randomCopy}\` ボタンを押下するとサーバーからランダムで取得したLGTM画像のマークダウンソースがクリップボードにコピーされます。`,
        },
        uploadCatPhoto: {
          title: "LGTM画像を作成する(アップロード)",
          content: [
            `[アップロード](${uploadUrl}) (Headerにリンクがあります)からオリジナルの猫画像を使ったLGTM画像が生成されます。`,
            "アップロードすると `LGTMeow` の文字が入ったLGTM画像が作成されます。",
            `制約条件等は [アップロード](${uploadUrl}) に注意書きがありますのでご覧ください。`,
          ],
        },
        contact: {
          title: "お問い合わせ",
          intro: "質問、機能リクエスト等は大歓迎です",
          methodsIntro: "お問い合わせは2つの手段があります。",
          issueLabel: "以下のリポジトリからIssueを作成する",
          issueLinkText: "GitHub Issues",
          formLabel: "お問い合わせフォームに必要情報を入力",
          formLinkText: "お問い合わせフォーム",
          issueUrl: "https://github.com/nekochans/lgtm-cat/issues",
          formUrl:
            "https://docs.google.com/forms/d/e/1FAIpQLSf0-A1ysrWQFCDuOZY8f2uH5KhUCB5yqi7TlLEsgl95Q9WKtw/viewform",
        },
      };
    case "en":
      return {
        whatIsLgtm: {
          title: "What is LGTM?",
          content: [
            'LGTM stands for "Looks Good To Me."',
            'Among engineers, there is a culture of posting LGTM images when approving a PR to convey "Looks Good To Me."',
          ],
        },
        whatIsLgtmeow: {
          title: "What is LGTMeow?",
          content: [
            "LGTMeow is a service for creating and sharing cute cat LGTM images.",
            "Unlike other LGTM image services, LGTMeow specializes in finding and creating LGTM images featuring adorable cats.",
          ],
        },
        copyByClicking: {
          title: "Copy LGTM Image by Clicking",
          intro: `Click on an LGTM image displayed on the [HOME](${homeUrl}) to copy the GitHub markdown source to your clipboard.`,
          buttonDescription: [
            "You can switch the displayed cat images using these two buttons:",
            `Click the \`${buttonText.refreshCats}\` button to display randomly fetched LGTM images from the server (results change with each click)`,
            `Click the \`${buttonText.latestCats}\` button to display the most recently uploaded LGTM images`,
          ],
          screenshotDescription:
            "When you paste the markdown source into GitHub, it will look like this:",
        },
        copyRandom: {
          title: "Copy Random LGTM Image",
          content: `Click the \`${buttonText.randomCopy}\` button on the [HOME](${homeUrl}) to copy a randomly fetched LGTM image's markdown source to your clipboard.`,
        },
        uploadCatPhoto: {
          title: "Create LGTM Image (Upload)",
          content: [
            `Upload your original cat photo from the [Upload](${uploadUrl}) page (link available in the header) to generate an LGTM image.`,
            "When you upload an image, an LGTM image with the `LGTMeow` text will be created.",
            `Please refer to the [Upload](${uploadUrl}) page for constraints and guidelines.`,
          ],
        },
        contact: {
          title: "Contact",
          intro: "Questions and feature requests are always welcome!",
          methodsIntro: "There are two ways to contact us:",
          issueLabel: "Create an issue in our repository",
          issueLinkText: "GitHub Issues",
          formLabel: "Fill out the contact form",
          formLinkText: "Inquiry Form",
          issueUrl: "https://github.com/nekochans/lgtm-cat/issues",
          formUrl:
            "https://docs.google.com/forms/d/e/1FAIpQLSf0-A1ysrWQFCDuOZY8f2uH5KhUCB5yqi7TlLEsgl95Q9WKtw/viewform",
        },
      };
    default:
      return assertNever(language);
  }
}

/**
 * LGTM画像を選んでコピーするセクションで表示する説明用スクリーンショットのパス
 * public/screenshots/lgtm-image-preview.webp を参照
 */
export const howToUseScreenshotPath = "/screenshots/lgtm-image-preview.webp";
