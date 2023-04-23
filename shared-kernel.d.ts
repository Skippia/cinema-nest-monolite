/**
 * Global types that don't high coupling in the application
 */

declare global {
  type Class = { new (...args: any[]): any }
}
export {}
