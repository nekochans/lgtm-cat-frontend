import React from 'react';

type Props = {
  text: string;
  onClick?: () => void;
};

const Button: React.VFC<Props> = ({ text, onClick }) => (
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
