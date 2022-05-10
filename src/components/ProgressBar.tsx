import type { VFC } from 'react';

const ProgressBar: VFC = () => (
  <>
    <p>通信中です</p>
    <progress className="progress is-large is-primary" max="100">
      100%
    </progress>
  </>
);

export default ProgressBar;
