import type { FC } from 'react';
import * as React from 'react';
import { FaInfoCircle } from 'react-icons/all';

interface NoteProps {
  iconElement?: React.ReactNode;
  labelText: string;
  content: string;
}

export const Note: FC<NoteProps> = ({ iconElement, labelText, content }) => {
  return (
    <div className="flex items-center gap-x-2">
      {iconElement ? iconElement : <FaInfoCircle size={20} />}
      <span>
        <span className="underline italic">{labelText}</span>{' '}
        <span className="text-purple-800">{content}</span>
      </span>
    </div>
  );
};
