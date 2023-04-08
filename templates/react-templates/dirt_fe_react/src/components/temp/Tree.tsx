import React from 'react';

type TreeProps = {
  children?: React.ReactNode;
};

type ElementProps = {
  rootElement?: Boolean;
  icon: React.ReactElement;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export const Tree: React.FC<TreeProps> & { Element: typeof Element } = ({
  children,
}: TreeProps) => {
  return <div className="my-1">{children}</div>;
};

const Element = ({
  rootElement,
  icon,
  title,
  subtitle,
  children,
}: ElementProps): JSX.Element => {
  return (
    <div className={['-py-2 mb-2', rootElement ? 'ml-0' : 'ml-8'].join(' ')}>
      <div className="flex items-center pl-2">
        {icon}
        <div className="flex flex-col px-2">
          <span className="text-lg font-semibold">{title}</span>
          {subtitle && (
            <span className="text-sm text-slate-400 -mt-1">{subtitle}</span>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

Tree.Element = Element;
