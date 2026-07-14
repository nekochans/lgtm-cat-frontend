import type { ReactNode } from "react";
import { PageLayout } from "@/components/page-layout";
import { HomeActionButtons } from "@/features/main/components/home-action-buttons";
import { ServiceDescription } from "@/features/main/components/service-description";
import type { Language } from "@/types/language";

interface Props {
  readonly header: ReactNode;
  readonly language: Language;
  /**
   * LGTM画像表示領域のReactNode。
   * page.tsx 側で searchParams の view に応じたサーバーコンポーネントを
   * Suspense 付きで注入する（Storybook ではモックを注入する）。
   * searchParams への依存をこのスロットに閉じ込める事で、Header を含む
   * ページ骨格が searchParams の Suspense 境界の外に出て静的シェルに含まれる（F44）。
   */
  readonly lgtmImages: ReactNode;
}

export const HomePage = ({ header, language, lgtmImages }: Props) => (
  <PageLayout
    header={header}
    language={language}
    mainClassName="flex w-full flex-1 flex-col items-center bg-background"
  >
    <div className="flex w-full max-w-[1300px] flex-col items-center gap-[80px] px-[40px] py-[60px]">
      <div className="flex w-full flex-col items-center gap-7 rounded-xl px-3 pt-10 pb-8">
        <ServiceDescription language={language} />
        <HomeActionButtons language={language} />
      </div>
      {lgtmImages}
    </div>
  </PageLayout>
);
