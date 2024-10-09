import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Header } from './Header';

test('show isLoggedIn false language is ja', () => {
  render(<Header language="ja" currentUrlPath="/" isLoggedIn={false} />);

  expect(screen.getByRole('link', { name: 'LGTMeow' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'アップロード' })).toBeTruthy();
  expect(screen.getByRole('link', { name: '使い方' })).toBeTruthy();
  expect(screen.getByRole('link', { name: '利用規約' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'ポリシー' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'language' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'ログイン' })).toBeTruthy();
});

test('show isLoggedIn false language is en', () => {
  render(<Header language="en" currentUrlPath="/" isLoggedIn={false} />);

  expect(screen.getByRole('link', { name: 'LGTMeow' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Upload new Cats' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'How to Use' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Terms of Use' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Policy' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'language' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Login' })).toBeTruthy();
});

test('show isLoggedIn true language is ja', () => {
  render(<Header language="ja" currentUrlPath="/" isLoggedIn={true} />);

  expect(screen.getByRole('link', { name: 'LGTMeow' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'アップロード' })).toBeTruthy();
  expect(screen.getByRole('link', { name: '使い方' })).toBeTruthy();
  expect(screen.getByRole('link', { name: '利用規約' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'ポリシー' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'language' })).toBeTruthy();
});

test('show isLoggedIn true language is en', () => {
  render(<Header language="en" currentUrlPath="/" isLoggedIn={true} />);

  expect(screen.getByRole('link', { name: 'LGTMeow' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Upload new Cats' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'How to Use' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Terms of Use' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Policy' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'language' })).toBeTruthy();
});
