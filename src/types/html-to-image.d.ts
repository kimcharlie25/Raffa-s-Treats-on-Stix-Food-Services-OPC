declare module 'html-to-image' {
  export function toPng(node: HTMLElement, options?: { backgroundColor?: string; pixelRatio?: number }): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: { quality?: number; backgroundColor?: string; pixelRatio?: number }): Promise<string>;
}


