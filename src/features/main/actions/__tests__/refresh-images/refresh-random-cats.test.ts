// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshRandomCats } from "@/features/main/actions/refresh-images";
import { CACHE_TAG_LGTM_IMAGES_RANDOM } from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

const updateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTagMock(...args),
}));

describe("refreshRandomCats", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates random tag and returns ja redirect URL", async () => {
    const result = await refreshRandomCats(null, "ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.ja}?view=random`,
    });
  });

  it("updates random tag and returns en redirect URL", async () => {
    const result = await refreshRandomCats(null, "en");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.en}?view=random`,
    });
  });

  it("returns error state when updateTag throws", async () => {
    updateTagMock.mockImplementation(() => {
      throw new Error("Cache update failed");
    });

    const result = await refreshRandomCats(null, "ja");

    expect(result).toEqual({
      status: "ERROR",
      message: "Failed to refresh images",
    });
  });
});
