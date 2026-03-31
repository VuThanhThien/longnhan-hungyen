import { UserMenu } from './user-menu';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shrink-0">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      <UserMenu />
    </header>
  );
}
