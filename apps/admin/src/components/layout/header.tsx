import { UserMenu } from './user-menu';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-popover/80 px-6 backdrop-blur-sm">
      <h1 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <UserMenu />
    </header>
  );
}
