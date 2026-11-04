import styles from "./FooterWordmark.module.css";

// The big BeU script that closes the footer. Decorative: the brand is already named by the logo
// mark and the copyright line, so it is hidden from assistive technology like the old wordmark was.
export default function FooterWordmark() {
  return (
    <div aria-hidden="true" className={styles.wordmark}>
      <span className={styles.script} />
    </div>
  );
}
