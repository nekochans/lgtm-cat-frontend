export class UploadCatImageSizeTooLargeError extends Error {
  constructor(error?: string) {
    super(error);
    this.name = new.target.name;

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
