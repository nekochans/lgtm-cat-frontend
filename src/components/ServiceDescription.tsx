import type { VFC } from 'react';

const ServiceDescription: VFC = () => (
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
);

export default ServiceDescription;
