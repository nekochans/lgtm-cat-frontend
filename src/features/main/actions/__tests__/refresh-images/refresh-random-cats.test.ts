// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshRandomCats } from "@/features/main/actions/refresh-images";
import { CACHE_TAG_LGTM_IMAGES_RANDOM } from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

const updateTagMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTagMock(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirectMock(...args),
}));

describe("refreshRandomCats", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates random tag and redirects to ja path", async () => {
    await refreshRandomCats("ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(redirectMock).toHaveBeenCalledWith(
      `${i18nUrlList.home.ja}?view=random`
    );
  });

  it("updates random tag and redirects to en path", async () => {
    await refreshRandomCats("en");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(redirectMock).toHaveBeenCalledWith(
      `${i18nUrlList.home.en}?view=random`
    );
  });
});
