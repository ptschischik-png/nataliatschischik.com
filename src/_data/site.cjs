const site = {
  "url": "https://nataliatschischik.com",
  "language": "de",
  "locale": "de_DE",
  "twitterSite": "@natalia_photography",
  "contact": {
    "displayName": "Natalia Tschischik",
    "businessName": "Hochzeitsfotograf Natalia Tschischik",
    "phoneDisplay": "+49 176 34948598",
    "phoneHref": "tel:+4917634948598",
    "email": "natalia@nataliatschischik.com",
    "emailHref": "mailto:natalia@nataliatschischik.com",
    "addressLines": [
      "Harleshäuser Str. 38, 34246 Vellmar"
    ],
    "mapsUrl": "https://maps.app.goo.gl/ak2VVrbKNQpdYCc16?g_st=ic",
    "whatsappUrl": "https://wa.me/4917634948598?text=Hallo%20Natalia%2C%20ich%20interessiere%20mich%20f%C3%BCr%20eure%20Hochzeitsfotografie."
  },
  "social": {
    "instagram": "https://www.instagram.com/hochzeitsfotografin.natalia",
    "googleMaps": "https://maps.app.goo.gl/ak2VVrbKNQpdYCc16?g_st=ic"
  },
  "tracking": {
    "measurementId": "G-4WTB03GDRG",
    "pixelId": "1083293176093427",
    "capiWorkerUrl": "https://meta-capi.nataliatschischik.com",
    "formHandlerUrl": "https://form-handler.nataliatschischik.com",
    "googleAdsConversion": {
      "id": "AW-993521489",
      "label": "lauZCJGOhpwcENHe39kD"
    },
    "debugQueryParam": "debug_tracking"
  },
  "verifications": {
    "google": "VdwJ2n6jCGWsFH_AE7-wwXYc8crrWTDp-kNba3mWOP4",
    "facebook": "5e2jspggv55xycs247egl8diamhup4",
    "appleDomain": "A4Lq3sdot5vt-8ubmaLnH3czieipD2VbFth9KijInbI"
  },
  "clientConfig": {
    "siteUrl": "https://nataliatschischik.com",
    "contact": {
      "displayName": "Natalia Tschischik",
      "businessName": "Hochzeitsfotograf Natalia Tschischik",
      "phoneDisplay": "+49 176 34948598",
      "phoneHref": "tel:+4917634948598",
      "email": "natalia@nataliatschischik.com",
      "emailHref": "mailto:natalia@nataliatschischik.com",
      "addressLines": [
        "Harleshäuser Str. 38, 34246 Vellmar"
      ],
      "mapsUrl": "https://maps.app.goo.gl/ak2VVrbKNQpdYCc16?g_st=ic",
      "whatsappUrl": "https://wa.me/4917634948598?text=Hallo%20Natalia%2C%20ich%20interessiere%20mich%20f%C3%BCr%20eure%20Hochzeitsfotografie."
    },
    "tracking": {
      "measurementId": "G-4WTB03GDRG",
      "pixelId": "1083293176093427",
      "capiWorkerUrl": "https://meta-capi.nataliatschischik.com",
      "formHandlerUrl": "https://form-handler.nataliatschischik.com",
      "googleAdsConversion": {
        "id": "AW-993521489",
        "label": "lauZCJGOhpwcENHe39kD"
      },
      "debugQueryParam": "debug_tracking"
    },
    "workers": {
      "formHandler": "https://form-handler.nataliatschischik.com",
      "metaCapi": "https://meta-capi.nataliatschischik.com"
    }
  }
};
site.clientConfigJson = JSON.stringify(site.clientConfig);
module.exports = site;

site.schema = {
  websiteId: site.url + '/#website',
  businessId: site.url + '/#business',
  personId: site.url + '/#person',
  serviceId: site.url + '/#service',
  defaultImage: site.url + '/assets/images/shared/natalia/gd-15zAiT52byizm3F.webp',
  profileImage: site.url + '/assets/images/shared/natalia/gd-15zAiT52byizm3F.webp',
  sameAs: [site.social.instagram, site.social.googleMaps],
  areaServed: [
    { '@type': 'City', name: 'Kassel' },
    { '@type': 'City', name: 'Baunatal' },
    { '@type': 'City', name: 'Göttingen' },
    { '@type': 'City', name: 'Duderstadt' },
    { '@type': 'City', name: 'Eschwege' },
    { '@type': 'City', name: 'Marburg' },
    { '@type': 'City', name: 'Gießen' },
    { '@type': 'City', name: 'Fulda' },
    { '@type': 'City', name: 'Neustadt (Hessen)' },
    { '@type': 'City', name: 'Fritzlar' },
    { '@type': 'City', name: 'Frankenberg (Eder)' },
    { '@type': 'City', name: 'Schwalmstadt' },
    { '@type': 'City', name: 'Kirchheim (Hessen)' },
    { '@type': 'City', name: 'Paderborn' },
    { '@type': 'City', name: 'Hildesheim' },
    { '@type': 'City', name: 'Northeim' },
    { '@type': 'City', name: 'Warburg' },
    { '@type': 'City', name: 'Bad Hersfeld' },
    { '@type': 'City', name: 'Bad Arolsen' },
    { '@type': 'City', name: 'Borken (Hessen)' },
    { '@type': 'City', name: 'Hofgeismar' },
    { '@type': 'AdministrativeArea', name: 'Nordhessen' },
    { '@type': 'AdministrativeArea', name: 'Hessen' },
    { '@type': 'AdministrativeArea', name: 'Niedersachsen' }
  ],
  graph: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': site.url + '/#website',
        url: site.url,
        name: site.contact.businessName,
        inLanguage: site.language,
        publisher: { '@id': site.url + '/#business' }
      },
      {
        '@type': ['LocalBusiness', 'ProfessionalService', 'Photographer'],
        '@id': site.url + '/#business',
        name: site.contact.businessName,
        alternateName: site.contact.displayName,
        description: 'Hochzeitsfotografie in Kassel, Baunatal, Nordhessen, Göttingen, Duderstadt, Eschwege, Marburg, Gießen, Fulda, Neustadt, Fritzlar, Frankenberg, Schwalmstadt, Kirchheim, Paderborn, Hildesheim, Northeim, Warburg, Bad Hersfeld, Bad Arolsen, Borken, Hofgeismar und darüber hinaus mit dokumentarischen, zeitlosen Reportagen.',
        url: site.url,
        image: site.url + '/assets/images/shared/natalia/gd-15zAiT52byizm3F.webp',
        logo: site.url + '/apple-touch-icon.png',
        telephone: site.contact.phoneDisplay,
        email: site.contact.email,
        hasMap: site.contact.mapsUrl,
        priceRange: '€€',
        areaServed: [
          { '@type': 'City', name: 'Kassel' },
          { '@type': 'City', name: 'Baunatal' },
          { '@type': 'City', name: 'Göttingen' },
          { '@type': 'City', name: 'Duderstadt' },
          { '@type': 'City', name: 'Eschwege' },
          { '@type': 'City', name: 'Marburg' },
          { '@type': 'City', name: 'Gießen' },
          { '@type': 'City', name: 'Fulda' },
          { '@type': 'City', name: 'Neustadt (Hessen)' },
          { '@type': 'City', name: 'Fritzlar' },
          { '@type': 'City', name: 'Frankenberg (Eder)' },
          { '@type': 'City', name: 'Schwalmstadt' },
          { '@type': 'City', name: 'Kirchheim (Hessen)' },
          { '@type': 'City', name: 'Paderborn' },
          { '@type': 'City', name: 'Hildesheim' },
          { '@type': 'City', name: 'Northeim' },
          { '@type': 'City', name: 'Warburg' },
          { '@type': 'City', name: 'Bad Hersfeld' },
          { '@type': 'City', name: 'Bad Arolsen' },
          { '@type': 'City', name: 'Borken (Hessen)' },
          { '@type': 'City', name: 'Hofgeismar' },
          { '@type': 'AdministrativeArea', name: 'Nordhessen' },
          { '@type': 'AdministrativeArea', name: 'Hessen' },
          { '@type': 'AdministrativeArea', name: 'Niedersachsen' }
        ],
        sameAs: [site.social.instagram, site.social.googleMaps],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Harleshäuser Str. 38',
          addressLocality: 'Vellmar',
          postalCode: '34246',
          addressRegion: 'Hessen',
          addressCountry: 'DE'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 51.3127,
          longitude: 9.4797
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'booking',
            telephone: site.contact.phoneDisplay,
            email: site.contact.email,
            areaServed: 'DE',
            availableLanguage: ['de', 'en']
          }
        ],
        founder: { '@id': site.url + '/#person' },
        serviceType: [
          'Hochzeitsfotografie',
          'Standesamtbegleitung',
          'Ganztagesreportagen',
          'Brautpaarshootings'
        ]
      },
      {
        '@type': 'Person',
        '@id': site.url + '/#person',
        name: site.contact.displayName,
        jobTitle: 'Hochzeitsfotografin',
        description: 'Hochzeitsfotografin aus Kassel mit dokumentarischem, editorial geprägtem Blick.',
        url: site.url + '/ueber-mich',
        image: site.url + '/assets/images/shared/natalia/gd-15zAiT52byizm3F.webp',
        sameAs: [site.social.instagram],
        worksFor: { '@id': site.url + '/#business' }
      }
    ]
  }
};
site.schemaGraphJson = JSON.stringify(site.schema.graph, null, 2);
