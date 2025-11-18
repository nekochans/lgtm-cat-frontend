// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, describe, expect, it, vi } from "vitest";
import { showLatestCats } from "@/features/main/actions/refresh-images";
import { CACHE_TAG_LGTM_IMAGES_LATEST } from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

const updateTagMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTagMock(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirectMock(...args),
}));

describe("showLatestCats", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates latest tag and redirects to ja path", async () => {
    await showLatestCats("ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_LATEST);
    expect(redirectMock).toHaveBeenCalledWith(
      `${i18nUrlList.home.ja}?view=latest`
    );
  });

  it("updates latest tag and redirects to en path", async () => {
    await showLatestCats("en");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_LATEST);
    expect(redirectMock).toHaveBeenCalledWith(
      `${i18nUrlList.home.en}?view=latest`
    );
  });
});
