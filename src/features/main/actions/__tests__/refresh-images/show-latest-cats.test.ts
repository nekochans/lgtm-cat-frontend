// 絶対厳守：編集前に必ずAI実装ルールを読む

import { afterEach, describe, expect, it, vi } from "vitest";
import { showLatestCatsAction } from "@/features/main/actions/refresh-images-action";
import { CACHE_TAG_LGTM_IMAGES_LATEST } from "@/features/main/constants/cache-tags";
import { i18nUrlList } from "@/features/url";

const updateTagMock = vi.fn();

vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => updateTagMock(...args),
}));

describe("src/features/main/actions/refresh-images-action.ts showLatestCatsAction TestCases", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should update latest tag and return ja redirect URL", async () => {
    const result = await showLatestCatsAction(null, "ja");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_LATEST);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.ja}?view=latest`,
    });
  });

  it("should update latest tag and return en redirect URL", async () => {
    const result = await showLatestCatsAction(null, "en");

    expect(updateTagMock).toHaveBeenCalledWith(CACHE_TAG_LGTM_IMAGES_LATEST);
    expect(result).toEqual({
      status: "SUCCESS",
      redirectUrl: `${i18nUrlList.home.en}?view=latest`,
    });
  });

  it("should return error state when updateTag throws", async () => {
    updateTagMock.mockImplementation(() => {
      throw new Error("Cache update failed");
    });

    const result = await showLatestCatsAction(null, "ja");

    expect(result).toEqual({
      status: "ERROR",
      message: "Failed to show latest images",
    });
  });
});
