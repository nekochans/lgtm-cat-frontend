import React from 'react';

const ProgressBar: React.FC = () => (
  <>
    <p>通信中です</p>
    <progress className="progress is-large is-primary" max="100">
      100%
    </progress>
  </>
);

export default ProgressBar;
