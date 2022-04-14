import type { VFC } from 'react';

type Props = {
  handleOnClick: () => void;
};

const RecentlyCatFetchButton: VFC<Props> = ({ handleOnClick }) => (
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
