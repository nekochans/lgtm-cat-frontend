import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

const _Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 750px;
  font-family: Roboto, sans-serif;
  font-size: 20px;
  font-style: normal;
  line-height: 25px;
  text-align: left;
  overflow-wrap: normal;
  list-style-position: inside;
  @media (max-width: 767px) {
    max-width: 380px;
  }
`;

export type Props = {
  markdown: string;
};

export const MarkdownContents: FC<Props> = ({ markdown }) => (
  <_Wrapper className="markdown">
    <ReactMarkdown>{markdown}</ReactMarkdown>
  </_Wrapper>
);
