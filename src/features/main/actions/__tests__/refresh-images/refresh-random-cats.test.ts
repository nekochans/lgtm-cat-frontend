// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshRandomCatsAction } from "@/features/main/actions/refresh-images-action";
import { CACHE_TAG_LGTM_IMAGES_RANDOM } from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

const updateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTagMock(...args),
}));

describe("src/features/main/actions/refresh-images-action.ts refreshRandomCatsAction TestCases", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should update random tag and return ja redirect URL", async () => {
    const result = await refreshRandomCatsAction(null, "ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.ja}?view=random`,
    });
  });

  it("should update random tag and return en redirect URL", async () => {
    const result = await refreshRandomCatsAction(null, "en");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_RANDOM);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.en}?view=random`,
    });
  });

  it("should return error state when updateTag throws", async () => {
    updateTagMock.mockImplementation(() => {
      throw new Error("Cache update failed");
    });

    const result = await refreshRandomCatsAction(null, "ja");

    expect(result).toEqual({
      status: "ERROR",
      message: "Failed to refresh images",
    });
  });
});
