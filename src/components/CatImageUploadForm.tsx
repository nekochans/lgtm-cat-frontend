import React from 'react';

const CatImageUploadForm: React.FC = () => (
  <form>
    <div className="file has-name is-boxed">
      <label className="file-label" htmlFor="cat-image-upload">
        <input
          className="file-input"
          type="file"
          name="uploadedCatImage"
          id="cat-image-upload"
        />
        <span className="file-cta">
          <span className="file-icon">
            <i className="fas fa-upload" />
          </span>
          <span className="file-label">猫ちゃん画像をアップロード</span>
        </span>
      </label>
    </div>
  </form>
);

export default CatImageUploadForm;
