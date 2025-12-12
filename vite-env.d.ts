// The reference to vite/client is removed to fix the type definition error.
// We manually declare process.env to support the usage in the codebase.

declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};
