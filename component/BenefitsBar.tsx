import { Package, Home, Clock } from 'lucide-react';

const ICONS = [Package, Home, Clock];
const DEFAULT_LABELS = ['Free Eyewear Kit Included', '7-Day Free Returns', 'Up To 5-Year Warranty'];

// Labels come from the store_settings sheet tab (benefit_1..3); the defaults apply if it is empty.
export default function BenefitsBar({ labels = DEFAULT_LABELS }: { labels?: string[] }) {
  const BENEFITS = labels.slice(0, ICONS.length).map((label, index) => ({ icon: ICONS[index], label }));
  return (
    <section aria-label="Shopping benefits" className="benefits-bar relative overflow-hidden bg-[#4F6BB5] py-6 text-white">
      <div className="benefits-track">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className="benefits-group">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex shrink-0 items-center gap-3">
                <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                <span className="whitespace-nowrap text-sm uppercase">{label}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
