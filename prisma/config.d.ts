declare module 'prisma/config' {
  export function defineConfig(config: {
    schema: string;
    migrations?: {
      path: string;
    };
    datasource?: {
      url: string | undefined;
    };
  }): unknown;
}
