import styles from "./HomeWordmark.module.css";

// The hero's <h1>: the BeU script logo (public/Hero-Logo-Script.svg, traced from Hero Logo.png) as a
// mask over a blue gloss fill. The letterforms are decorative; the heading text is for screen readers.
export default function HomeWordmark() {
  return (
    <h1 className={styles.wordmark}>
      <span aria-hidden="true" className={styles.script} />
      <span className="sr-only">BeU Eyewear</span>
    </h1>
  );
}
