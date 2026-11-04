import styles from "./NavLogo.module.css";

// Decorative: the link around it carries the accessible name.
export default function NavLogo() {
  return <span aria-hidden="true" className={styles.logo} />;
}
