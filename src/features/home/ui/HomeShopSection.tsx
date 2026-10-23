import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { AddToCartButton } from "@/features/cart/ui/AddToCartButton";
import { HomeCarousel } from "@/features/home/ui/HomeCarousel";

export type HomeShopCard = {
  id: string;
  href: string;
  title: string;
  meta: string;
  brand: string;
  price: string;
  imageUrl: string;
  productId?: string;
};

type HomeShopSectionProps = {
  title: string;
  addLabel: string;
  previousLabel: string;
  nextLabel: string;
  products: readonly HomeShopCard[];
};

export function HomeShopSection({
  title,
  addLabel,
  previousLabel,
  nextLabel,
  products,
}: HomeShopSectionProps) {
  return (
    <div className="bg-[linear-gradient(124deg,#792a57_34%,#b985a2_100%)]">
      <HomeCarousel
        title={title}
        titleClassName="text-white"
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        tone="dark"
      >
        {products.map((product) => (
          <HomeShopCardView key={product.id} product={product} addLabel={addLabel} />
        ))}
      </HomeCarousel>
    </div>
  );
}

function HomeShopCardView({
  product,
  addLabel,
}: {
  product: HomeShopCard;
  addLabel: string;
}) {
  return (
    <article className="flex h-[422px] w-[min(80vw,334px)] shrink-0 snap-start flex-col gap-4 rounded-[25px] bg-white p-6">
      <AppLink href={product.href} prefetchPolicy="intent" className="relative h-[242px] overflow-hidden rounded-[10px]">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="334px"
          className="object-cover"
        />
      </AppLink>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold leading-6 tracking-[0.1px] text-[#252b42]">
            {product.title}
            <span className="block">{product.meta}</span>
          </h3>
          <p className="mt-2 text-sm tracking-[0.2px] text-[#737373]">{product.brand}</p>
          <p className="mt-2 text-[17px] font-bold tracking-[0.2px] text-[#2e2e2e]">
            {product.price}
          </p>
        </div>
        {product.productId ? (
          <AddToCartButton
            productId={product.productId}
            label={addLabel}
            imageUrl={product.imageUrl}
            className="size-10 bg-[#1a1a1a] [&_svg]:text-white"
          />
        ) : (
          <AppLink
            href={product.href}
            aria-label={addLabel}
            className="grid size-10 place-items-center rounded-full bg-[#1a1a1a] text-2xl text-white"
          >
            +
          </AppLink>
        )}
      </div>
    </article>
  );
}
