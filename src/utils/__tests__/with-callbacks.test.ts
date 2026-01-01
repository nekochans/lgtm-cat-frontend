// 絶対厳守：編集前に必ずAI実装ルールを読む

import { describe, expect, it, vi } from "vitest";
import { withCallbacks } from "@/utils/with-callbacks";

type TestActionState =
  | { readonly status: "SUCCESS"; readonly data: string }
  | { readonly status: "ERROR"; readonly message: string }
  | null;

describe("withCallbacks", () => {
  it("calls onSuccess callback when action returns SUCCESS status", async () => {
    const mockAction = vi.fn().mockResolvedValue({
      status: "SUCCESS",
      data: "test data",
    });
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const wrappedAction = withCallbacks<[string], TestActionState>(mockAction, {
      onSuccess,
      onError,
    });

    const result = await wrappedAction("arg1");

    expect(mockAction).toHaveBeenCalledWith("arg1");
    expect(onSuccess).toHaveBeenCalledWith({
      status: "SUCCESS",
      data: "test data",
    });
    expect(onError).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "SUCCESS", data: "test data" });
  });

  it("calls onError callback when action returns ERROR status", async () => {
    const mockAction = vi.fn().mockResolvedValue({
      status: "ERROR",
      message: "Something went wrong",
    });
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const wrappedAction = withCallbacks<[string], TestActionState>(mockAction, {
      onSuccess,
      onError,
    });

    const result = await wrappedAction("arg1");

    expect(mockAction).toHaveBeenCalledWith("arg1");
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({
      status: "ERROR",
      message: "Something went wrong",
    });
    expect(result).toEqual({
      status: "ERROR",
      message: "Something went wrong",
    });
  });

  it("does not call callbacks when action returns null", async () => {
    const mockAction = vi.fn().mockResolvedValue(null);
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const wrappedAction = withCallbacks<[], TestActionState>(mockAction, {
      onSuccess,
      onError,
    });

    const result = await wrappedAction();

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("works without onError callback", async () => {
    const mockAction = vi.fn().mockResolvedValue({
      status: "SUCCESS",
      data: "test",
    });
    const onSuccess = vi.fn();

    const wrappedAction = withCallbacks<[], TestActionState>(mockAction, {
      onSuccess,
    });

    await wrappedAction();

    expect(onSuccess).toHaveBeenCalled();
  });

  it("works without onSuccess callback", async () => {
    const mockAction = vi.fn().mockResolvedValue({
      status: "ERROR",
      message: "error",
    });
    const onError = vi.fn();

    const wrappedAction = withCallbacks<[], TestActionState>(mockAction, {
      onError,
    });

    await wrappedAction();

    expect(onError).toHaveBeenCalled();
  });
});
