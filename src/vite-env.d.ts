/// <reference types="vite/client" />

declare module '*.sol?raw' {
  const content: string;
  export default content;
}
