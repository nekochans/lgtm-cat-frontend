import React from 'react';
import { urlList } from '../constants/url';
import { useSetAppState } from '../contexts/AppStateContext';
import { fetchRandomImageList } from '../infrastructure/repository/ImageRepository';

const Header: React.FC = () => {
  const setAppState = useSetAppState();

  const handleRandom = async () => {
    try {
      const imageList = await fetchRandomImageList();
      setAppState({ imageList: imageList.images });
    } catch (e) {
      if (window) {
        window.location.href = urlList.error;
      }
    }
  };

  return (
    <header>
      <nav className="navbar navbar-padding">
        <div className="container" style={{ display: 'block' }}>
          <div className="navbar-brand">
            <a className="navbar-item" href={urlList.top}>
              <p className="is-size-4 has-text-black">LGTMeow</p>
            </a>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                marginLeft: 'auto',
              }}
            >
              <button
                className="button is-outlined"
                style={{ margin: '0.5rem 0.75rem' }}
                type="submit"
                onClick={() => handleRandom()}
              >
                ランダム
              </button>
            </div>
          </div>
          <p
            className="is-size-6 header-description-margin has-text-grey"
            style={{
              alignItems: 'center',
              padding: '0 0.75rem',
            }}
          >
            猫のLGTM画像を共有出来るサービスです。画像をクリックするとGitHub
            Markdownがコピーされます。
          </p>
        </div>
      </nav>
    </header>
  );
};

export default Header;
