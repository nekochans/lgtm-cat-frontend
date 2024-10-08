import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Footer } from './Footer';

test('show language is ja', () => {
  render(<Footer language="ja" />);

  expect(screen.getByRole('link', { name: '利用規約' })).toBeTruthy();
  expect(
    screen.getByRole('link', { name: 'プライバシーポリシー' }),
  ).toBeTruthy();
  expect(screen.getByRole('link', { name: '外部送信ポリシー' })).toBeTruthy();
});

test('show language is en', () => {
  render(<Footer language="en" />);

  expect(screen.getByRole('link', { name: 'Terms of Use' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeTruthy();
  expect(
    screen.getByRole('link', { name: 'External Transmission Policy' }),
  ).toBeTruthy();
});
