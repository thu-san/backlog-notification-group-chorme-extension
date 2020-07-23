import React, { memo } from 'react';

import * as languages from '../config/languages';

const language = navigator.language.indexOf('ja') >= 0 ? 'ja' : 'en';

export interface IProps {
  text: keyof typeof languages['en'];
  data?: {
    [key: string]: string;
  };
}

export default memo<IProps>(({ text, data }) => {
  return <>{ResolveLang({ text, data })}</>;
});

export const ResolveLang = (param: IProps['text'] | IProps) => {
  if (typeof param === 'string') {
    return languages[language][param];
  }

  const { text, data } = param;
  let newText: string = languages[language][text];
  if (data) {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      newText = newText.replace(re, value);
    });
  }

  return newText;
};
