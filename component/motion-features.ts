// The animation engine, in its own file so the bundler splits it into a separate chunk. Reveal.tsx
// loads it after first paint (LazyMotion), so it never delays the page's first render. domMax rather
// than domAnimation because the cart's rows use layout animations.
export { domMax as default } from 'framer-motion';
