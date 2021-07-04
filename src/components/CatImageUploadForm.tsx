import React, { useState, ChangeEvent } from 'react';

const acceptedTypes: string[] = ['image/png', 'image/jpg', 'image/jpeg'];

const CatImageUploadForm: React.FC = () => {
  const [uploadedCatImageUrl, setUploadedCatImageUrl] = useState<string>();

  const isValidFileType = (fileType: string): boolean =>
    acceptedTypes.includes(fileType);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!isValidFileType(file.type)) {
        return;
      }

      const url = URL.createObjectURL(file);

      setUploadedCatImageUrl(url);
    }
  };

  return (
    <>
      <form method="post">
        <div className="file has-name is-boxed">
          <label className="file-label" htmlFor="cat-image-upload">
            <input
              className="file-input"
              type="file"
              name="uploadedCatImage"
              id="cat-image-upload"
              onChange={handleFileUpload}
            />
            <span className="file-cta">
              <span className="file-icon">
                <i className="fas fa-upload" />
              </span>
              <span className="file-label">猫ちゃん画像を選択</span>
            </span>
          </label>
        </div>
        <button className="button is-primary" type="submit">
          アップロード
        </button>
      </form>
      {uploadedCatImageUrl ? (
        <img src={uploadedCatImageUrl} alt="preview" />
      ) : (
        ''
      )}
    </>
  );
};

export default CatImageUploadForm;
