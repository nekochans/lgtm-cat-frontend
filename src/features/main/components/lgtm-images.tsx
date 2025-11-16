// 絶対厳守：編集前に必ずAI実装ルールを読む
import type { JSX } from "react";
import type { LgtmImage as LgtmImageType } from "@/features/main/types/lgtm-image";
import { LgtmImage } from "./lgtm-image";

type Props = {
  readonly images: readonly LgtmImageType[];
};

export function LgtmImages({ images }: Props): JSX.Element {
  return (
    <div className="flex w-full flex-wrap content-center items-center justify-center gap-[24px]">
      {images.map((image) => (
        <LgtmImage key={image.id} {...image} />
      ))}
    </div>
  );
}
