import type { VFC } from 'react';

type Props = {
  onClick: () => void;
};

const RecentlyCatFetchButton: VFC<Props> = ({ onClick }) => (
  <button
    className="button is-outlined"
    style={{ margin: '0.5rem 0.75rem' }}
    type="submit"
    onClick={() => onClick()}
  >
    新しい猫ちゃんを表示
  </button>
);

export default RecentlyCatFetchButton;
