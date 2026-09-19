/// <reference types="vite/client" />

// Declare CSS module imports so TypeScript does not error on `import './index.css'`
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// Declare SVG imports
declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default string;
}

// Declare PNG/JPEG/WEBP image imports
declare module "*.png" { const src: string; export default src; }
declare module "*.jpg" { const src: string; export default src; }
declare module "*.jpeg" { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }
declare module "*.gif" { const src: string; export default src; }

// Pi Network SDK global
interface Window {
  Pi?: {
    init: (options: { version: string; sandbox?: boolean }) => Promise<void>;
    authenticate: (
      scopes: string[],
      onIncompletePaymentFound: (payment: any) => void
    ) => Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  };
}
