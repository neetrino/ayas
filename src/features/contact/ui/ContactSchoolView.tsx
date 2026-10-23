import { AboutSchoolFooter } from "@/features/about/ui/AboutSchoolFooter";
import { ContactDetails } from "@/features/contact/ui/ContactDetails";
import { ContactForm } from "@/features/contact/ui/ContactForm";
import { homeAssets } from "@/features/home/ui/home-assets";
import { SchoolPageHero } from "@/features/home/ui/SchoolPageHero";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactSchoolViewProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function ContactSchoolView({ locale, dictionary }: ContactSchoolViewProps) {
  const landing = dictionary.home.landing;
  const contact = dictionary.contact;
  const footer = landing.footer;

  return (
    <div className="home-landing">
      <SchoolPageHero
        locale={locale}
        languageLabel={dictionary.header.language}
        navLabel={dictionary.nav.navigation}
        cartLabel={dictionary.nav.cart}
        openMenuLabel={landing.openMenu}
        contactLabel={landing.nav.contact}
        nav={landing.nav}
        title={contact.title}
        lead={contact.subtitle}
      />
      <ContactDetails
        addressLabel={contact.addressLabel}
        address={`${footer.addressLine1}, ${footer.addressLine2}`}
        phoneLabel={contact.phoneLabel}
        phone={footer.phone}
        emailLabel={contact.email}
        email={footer.email}
        hoursLabel={contact.hoursLabel}
        hours={[contact.hoursWeekdays, contact.hoursSaturday]}
        socialLabel={contact.socialLabel}
        networks={schoolNetworks(contact.social)}
        mapLabel={contact.mapTitle}
        mapSrc={homeAssets.map}
      />
      <ContactMessage contact={contact} />
      <AboutSchoolFooter locale={locale} nav={landing.nav} footer={footer} />
    </div>
  );
}

function ContactMessage({ contact }: { contact: Dictionary["contact"] }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-8 lg:px-[84px] lg:pb-24">
        <div className="max-w-xl">
          <h2 className="home-display text-[clamp(2.5rem,5vw,4rem)] text-[#030303]">
            {contact.writeTitle}
          </h2>
          <p className="mt-4 text-lg leading-7">{contact.writeDescription}</p>
          <div className="mt-8">
            <ContactForm
              copy={{
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                message: contact.message,
                submit: contact.submit,
                success: contact.success,
                error: contact.error,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function schoolNetworks(social: Dictionary["contact"]["social"]) {
  return [
    { label: "Facebook", href: social.facebook, iconSrc: homeAssets.social.facebook },
    { label: "Twitter", href: social.twitter, iconSrc: homeAssets.social.twitter },
    { label: "Vimeo", href: social.vimeo, iconSrc: homeAssets.social.vimeo },
    { label: "YouTube", href: social.youtube, iconSrc: homeAssets.social.youtube },
  ];
}
