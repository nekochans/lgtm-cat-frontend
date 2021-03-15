import React from 'react';

type Props = {
  handleRandom: () => void;
};

const RandomButton: React.FC<Props> = ({ handleRandom }: Props) => (
  <button
    className="button is-outlined"
    style={{ margin: '0.5rem 0.75rem' }}
    type="submit"
    onClick={() => handleRandom()}
  >
    ランダム
  </button>
);

export default RandomButton;
