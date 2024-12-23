type Props = {
  env: Record<string, string>;
};

export const PublicEnv = (props: Props) => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.ENV = ${JSON.stringify(props)}`,
      }}
    />
  );
};
