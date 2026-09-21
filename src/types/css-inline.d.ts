/**
 * Vite returns a stylesheet's text, instead of injecting it, when it is
 * imported with `?inline` — used to hand the popup's stylesheet to the guide's
 * shadow root.
 */
declare module "*.css?inline" {
  const css: string
  export default css
}

/** Plasmo's own scheme for importing a stylesheet as a string. */
declare module "data-text:*" {
  const css: string
  export default css
}
