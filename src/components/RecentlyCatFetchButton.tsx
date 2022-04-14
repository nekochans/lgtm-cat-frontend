import React from 'react';

type Props = {
  handleOnClick: () => void;
};

const RecentlyCatFetchButton: React.VFC<Props> = ({ handleOnClick }) => (
  <button
    className="button is-outlined"
    style={{ margin: '0.5rem 0.75rem' }}
    type="submit"
    onClick={() => handleOnClick()}
  >
    新しい猫ちゃんを表示
  </button>
);

export default RecentlyCatFetchButton;
