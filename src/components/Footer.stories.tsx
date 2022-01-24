import React from 'react';

import Footer from './Footer';

export default {
  title: 'src/components/Footer.tsx',
  component: Footer,
  includeStories: ['showFooterWithProps'],
};

const style = {
  color: 'royalblue',
};

const props = {
  termsLink: (
    <a href="https://policies.google.com/terms" style={style}>
      利用規約
    </a>
  ),
  privacyLink: (
    <a href="https://policies.google.com/privacy" style={style}>
      プライバシーポリシー
    </a>
  ),
};

export const showFooterWithProps = (): JSX.Element => (
  <Footer termsLink={props.termsLink} privacyLink={props.privacyLink} />
);
