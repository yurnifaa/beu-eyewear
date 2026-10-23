// LEGACY-CATALOG-ADMIN
// Shown on the admin pages that edit the old Prisma catalog tables. The storefront now
// reads the Google Sheet, so edits made on these pages do not reach shoppers.
// To remove or revive these pages, see docs/google-sheets-catalog.md ("Legacy admin pages").
export default function LegacyCatalogNotice() {
  return (
    <div role="note" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
      <p className="font-semibold text-amber-700 dark:text-amber-500">Legacy page: not connected to the storefront</p>
      <p className="mt-1 text-muted-foreground">
        The storefront now reads products, categories and stock from the Google Sheet catalog. This page still edits the
        old database tables, so changes made here will not appear in the shop. Edit the Sheet instead. Kept for reference
        until the team decides whether to remove it (see <span className="font-mono">docs/google-sheets-catalog.md</span>).
      </p>
    </div>
  );
}
