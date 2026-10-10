import Image from 'next/image';

export default function BrandWordmark() {
  return (
    <Image
      src="/Logo-Dark.png"
      alt="BeU"
      width={512}
      height={512}
      className="mx-auto size-14 dark:brightness-0 dark:invert"
      priority
    />
  );
}