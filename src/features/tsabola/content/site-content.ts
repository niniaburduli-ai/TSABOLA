import type { SiteContent, ThemeConfig, SectionVisibility } from '../types'

export const DEFAULT_CONTENT: SiteContent = {
  site: {
    name: { ka: 'ცაბო', en: 'TSABO' },
    slogan: { ka: 'ტრადიცია ქართლის გულიდან', en: 'Tradition from the Heart of Kartli' },
  },
  nav: {
    wines: { ka: 'ღვინოები', en: 'Wines' },
    gallery: { ka: 'გალერეა', en: 'Gallery' },
    about: { ka: 'ჩვენ შესახებ', en: 'About' },
    contact: { ka: 'კონტაქტი', en: 'Contact' },
    news: { ka: 'სიახლეები', en: 'News' },
  },
  hero: {
    headline: { ka: 'კახეთის სულისკვეთება', en: 'The Spirit of Kakheti' },
    subline: {
      ka: 'ოჯახური მარნის ტრადიცია სამი თაობის განმავლობაში',
      en: 'A family winery tradition spanning three generations',
    },
    cta: { ka: 'ღვინოები აღმოაჩინე', en: 'Discover Our Wines' },
    images: ['/TSABO WHITE.png', '/TSABO RED.png'],
  },
  wines: [
    {
      id: 'white',
      name: { ka: 'თეთრი ღვინო', en: 'White Wine' },
      type: { ka: 'თეთრი', en: 'White' },
      typeBadge: { ka: 'თეთრი', en: 'White' },
      price: '30₾',
      description: {
        ka: 'სუფთა, ყვავილოვანი. ატმის, ჟასმინის ნოტებით.',
        en: 'Crisp and floral. Hints of white peach and jasmine.',
      },
      image: '/white wine.png',
      details: {
        ka: 'ღვინო: თეთრი მშრალი | ყურძენი: ჩინებული\nრეგიონი: ზემო ხანდაკი; შიდა ქართლი.',
        en: 'Wine: White Dry | Grape: Chinebuli\nRegion: Zemo Khandaki; Shida Kartli.',
      },
    },
    {
      id: 'red',
      name: { ka: 'წითელი ღვინო', en: 'Red Wine' },
      type: { ka: 'წითელი', en: 'Red' },
      typeBadge: { ka: 'წითელი', en: 'Red' },
      price: '50₾',
      description: {
        ka: 'მუხის კასრში დავარგებული. მუქი კენკრა, შავი ალუბალი, ტყავი.',
        en: 'Oak-aged full body. Dark berry, black cherry, leather.',
      },
      image: '/red wine.png',
      details: {
        ka: 'ღვინო: წითელი მშრალი | ყურძენი: დანახარული\nრეგიონი: ზემო ხანდაკი; შიდა ქართლი.',
        en: 'Wine: Red Dry | Grape: Danakharuli\nRegion: Zemo Khandaki; Shida Kartli.',
      },
    },
  ],
  news: {
    title: { ka: 'სიახლეები', en: 'News' },
    subtitle: { ka: 'განახლებები', en: 'Updates' },
    items: [
      {
        id: 'news-1',
        title: {
          ka: '2024 ყვავება — ახალი მოსავალი',
          en: '2024 Harvest — New Vintage',
        },
        date: 'January 2025',
        body: {
          ka: 'ჩვენი 2024 წლის მოსავალი მზადაა. ' +
            'ახალი ბოთლები ხელმისაწვდომია.',
          en: 'Our 2024 harvest vintage is ready. ' +
            'New bottles are now available.',
        },
        image: '',
      },
      {
        id: 'news-2',
        title: {
          ka: 'სეზონური ფასდაკლება',
          en: 'Seasonal Discount',
        },
        date: 'December 2024',
        body: {
          ka: 'ყველა თეთრ ღვინოზე 15% ფასდაკლება. ' +
            'შეთავაზება 31 დეკემბრამდე.',
          en: '15% off all white wines. ' +
            'Offer valid until December 31.',
        },
        image: '',
      },
    ],
  },
  gallery: {
    title: { ka: 'გალერეა', en: 'Gallery' },
    subtitle: { ka: 'ვენახი, მარანი, ხელოვნება', en: 'Vineyard, Cellar, Craft' },
    images: ['/gallery white.png', '/gallery red.png', '/GALLERY RTVELI.png', '', '', ''],
  },
  about: {
    title: {
      ka: '"ცაბო" — ტრადიცია ქართლის გულიდან',
      en: '"Tsabo" — A Tradition from the Heart of Kartli',
    },
    body: {
      ka: '2018 წლიდან შიდა ქართლის გულში, კასპის მადლიან მიწაზე, ' +
        'სოფელ ზემო ხანდაკში ახალი, თუმცა უძველეს ფესვებზე ' +
        'აღმოცენებული ამბავი იწერება. „ცაბო" ოჯახური სახელია, ' +
        'რომელიც ღვინის უდიდეს სიყვარულს აერთიანებს. ჩვენ გვჯერა ' +
        'მინიმალური ჩარევის: ღვინო თავად იწმინდება, თავად იბადება და ' +
        'ვენახიდან პირდაპირ თქვენს მაგიდაზე ხვდება. გაუზიარეთ ' +
        'ერთმანეთს ხელნაკეთი სიყვარული.',
      en: 'Since 2018, in the heart of Shida Kartli, on the blessed land ' +
        'of Kaspi, in the village of Zemo Khandaki, a new yet ' +
        'ancient-rooted story is being written. "Tsabo" is a family name ' +
        'that embodies a deep love for wine. We believe in minimal ' +
        'intervention: the wine purifies itself, is born on its own, and ' +
        'travels directly from the vineyard to your table. Share this ' +
        'handcrafted love with one another.',
    },
    imageAlt: { ka: 'რთველი — ყურძნის კრეფა', en: 'Rtveli — grape harvest' },
    image: '/GALLERY RTVELI.png',
  },
  contact: {
    title: { ka: 'კონტაქტი', en: 'Contact' },
    subtitle: { ka: 'დაგვიკავშირდით', en: 'Get in touch' },
    email: 'tsabowinery@gmail.com',
    phone: '+995 599 615 438',
    whatsapp: '+995599615438',
    address: { ka: 'ზემო ხანდაკი, შიდა ქართლი, საქართველო', en: 'Zemo Khandaki, Shida Kartli, Georgia' },
  },
  footer: {
    copy: { ka: '© 2018 ცაბო. ყველა უფლება დაცულია.', en: '© 2018 TSABO. All rights reserved.' },
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
  news: true,
  gallery: true,
  about: true,
  contact: true,
}
