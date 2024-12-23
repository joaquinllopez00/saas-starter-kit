const PageHeader = ({ title }: { title: string }) => {
  return (
    <header className="flex flex-row items-center bg-background px-6 pb-4 font-display text-2xl font-bold tracking-tight text-foreground">
      {title}
    </header>
  );
};

export default PageHeader;
