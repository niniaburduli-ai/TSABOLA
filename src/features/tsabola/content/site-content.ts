import type { SiteContent, ThemeConfig, SectionVisibility } from '../types'

export const DEFAULT_CONTENT: SiteContent = {
  site: {
    name: { ka: 'ცაბოლა', en: 'TSABOLA' },
    slogan: { ka: 'კახეთის სული ბოთლში', en: 'The Soul of Kakheti in Every Bottle' },
  },
  nav: {
    wines: { ka: 'ღვინოები', en: 'Wines' },
    gallery: { ka: 'გალერეა', en: 'Gallery' },
    about: { ka: 'ჩვენ შესახებ', en: 'About' },
    contact: { ka: 'კონტაქტი', en: 'Contact' },
  },
  hero: {
    headline: { ka: 'კახეთის სულისკვეთება', en: 'The Spirit of Kakheti' },
    subline: {
      ka: 'ოჯახური მარნის ტრადიცია სამი თაობის განმავლობაში',
      en: 'A family winery tradition spanning three generations',
    },
    cta: { ka: 'ღვინოები აღმოაჩინე', en: 'Discover Our Wines' },
  },
  wines: [
    {
      id: 'rkatsiteli',
      name: { ka: 'რქაწითელი', en: 'Rkatsiteli' },
      type: { ka: 'ანბერი', en: 'Amber' },
      typeBadge: { ka: 'ანბერი', en: 'Amber' },
      price: '45₾',
      description: {
        ka: 'ქვევრში დავარგებული, ხაჭოზე ნამყოფი. კომშის და ყვავილის ნოტებით.',
        en: 'Qvevri-aged on skins. Notes of quince and dried flowers.',
      },
      image: '',
    },
    {
      id: 'saperavi',
      name: { ka: 'საფერავი', en: 'Saperavi' },
      type: { ka: 'წითელი', en: 'Red' },
      typeBadge: { ka: 'წითელი', en: 'Red' },
      price: '55₾',
      description: {
        ka: 'მუხის კასრში დავარგებული. მუქი კენკრა, შავი ალუბალი, ტყავი.',
        en: 'Oak-aged full body. Dark berry, black cherry, leather.',
      },
      image: '',
    },
    {
      id: 'mtsvane',
      name: { ka: 'მწვანე', en: 'Mtsvane' },
      type: { ka: 'თეთრი', en: 'White' },
      typeBadge: { ka: 'თეთრი', en: 'White' },
      price: '40₾',
      description: {
        ka: 'სუფთა, ყვავილოვანი. ატმის, ჟასმინის ნოტებით.',
        en: 'Crisp and floral. Hints of white peach and jasmine.',
      },
      image: '',
    },
    {
      id: 'rose',
      name: { ka: 'კახური როზე', en: 'Kakhuri Rosé' },
      type: { ka: 'როზე', en: 'Rosé' },
      typeBadge: { ka: 'როზე', en: 'Rosé' },
      price: '48₾',
      description: {
        ka: 'ნახევრად მშრალი. ზაფხულის კენკრა, ნარინჯი, სიახლე.',
        en: 'Semi-dry. Summer berries, orange zest, bright finish.',
      },
      image: '',
    },
  ],
  gallery: {
    title: { ka: 'გალერეა', en: 'Gallery' },
    subtitle: { ka: 'ვენახი, მარანი, ხელოვნება', en: 'Vineyard, Cellar, Craft' },
    images: ['', '', '', '', '', ''],
  },
  about: {
    title: { ka: 'ჩვენ შესახებ', en: 'Our Story' },
    body: {
      ka: 'ცაბოლა — ოჯახური სახელი, თაობების ერთგულება. კახეთის გულში, ' +
        'სამი თაობის განმავლობაში, ჩვენ ვაგრძელებთ ქართული ღვინის ' +
        'ტრადიციას ქვევრით, სიყვარულით და მიწის პატივისცემით.\n\n' +
        'ჩვენი ყოველი ბოთლი — ეს არის ხელნაკეთი ამბავი. მინიმალური ' +
        'ჩარევა, ბუნებრივი ვარდნა, ვენახიდან პირდაპირ მაგიდაზე.',
      en: 'TSABOLA is a family name and a promise of terroir. Rooted in ' +
        'the vineyards of Kakheti for three generations, we carry Georgian ' +
        'wine culture forward — one qvevri, one harvest, one story at a ' +
        'time.\n\nEach bottle is handcrafted with minimal intervention. ' +
        'Nature-first. From our vineyard to your table.',
    },
    imageAlt: { ka: 'ოჯახური მარანი', en: 'Family winery' },
    image: '',
  },
  contact: {
    title: { ka: 'კონტაქტი', en: 'Contact' },
    subtitle: { ka: 'დაგვიკავშირდით', en: 'Get in touch' },
    email: 'info@tsabola.ge',
    phone: '+995 555 000 000',
    address: { ka: 'კახეთი, საქართველო', en: 'Kakheti, Georgia' },
  },
  footer: {
    copy: { ka: '© 2024 ცაბოლა. ყველა უფლება დაცულია.', en: '© 2024 TSABOLA. All rights reserved.' },
  },
}

export const DEFAULT_THEME: ThemeConfig = {
  colorWine: '#722F37',
  colorCharcoal: '#1a1a1a',
  colorCream: '#faf8f5',
  headingSize: 'lg',
  bodySize: 'md',
}

export const DEFAULT_VISIBILITY: SectionVisibility = {
  hero: true,
  wines: true,
  gallery: true,
  about: true,
  contact: true,
}
