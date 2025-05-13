import { CorsOptions } from 'cors';

declare module 'cors' {
  interface CustomCorsOptions extends CorsOptions {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void
    ) => void;
  }
}