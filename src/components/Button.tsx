import type { VFC } from 'react';

type Props = {
  text: string;
  onClick?: () => void;
};

const Button: VFC<Props> = ({ text, onClick }) => (
  <button
    className="button is-outlined"
    style={{ margin: '0.5rem 0.75rem' }}
    type="submit"
    onClick={onClick}
  >
    {text}
  </button>
);

export default Button;
