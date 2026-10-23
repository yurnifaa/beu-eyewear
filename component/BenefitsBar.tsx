import { Package, Home, Clock } from 'lucide-react';

const BENEFITS = [
  { icon: Package, label: 'Free Eyewear Kit Included' },
  { icon: Home, label: '7-Day Free Returns' },
  { icon: Clock, label: 'Up To 5-Year Warranty' },
];

export default function BenefitsBar() {
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
