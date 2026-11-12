// The standard animation engine, in its own file so the bundler splits it into a separate chunk.
// MotionProvider loads it after first paint (LazyMotion), so it never delays a page's first render.
export { domAnimation as default } from 'framer-motion';
