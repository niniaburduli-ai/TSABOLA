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
    images: ['/HERO RTVELI.png', '/HERO VENAXI.png'],
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
    images: ['/gallery white.png', '/gallery red.png', '/GALLERY RTVELI .png', '', '', ''],
  },
  about: {
    title: {
      ka: '"ცაბო" — ტრადიცია ქართლის გულიდან',
      en: '"Tsabo" — A Tradition from the Heart of Kartli',
    },
    body: {
      ka: (
        '2018 წლიდან, შიდა ქართლის გულში, კასპის რაიონის სოფელ ' +
        'ზემო ხანდაკში, „ცაბოს" ისტორია სიყვარულით, შრომითა და ' +
        'ქართული მეღვინეობის ტრადიციების პატივისცემით იქმნება.\n\n' +
        '„ცაბო" ოჯახური ბრენდია, რომელიც ხარისხიან ღვინოს ' +
        'ბუნებრივი მიდგომით ქმნის. გვჯერა, რომ საუკეთესო შედეგი ' +
        'მიიღწევა მაშინ, როდესაც ყურძნის ბუნებრივ თვისებებს პატივს ' +
        'ვცემთ და წარმოების პროცესში მხოლოდ აუცილებელ ჩარევას ' +
        'ვიყენებთ. სწორედ ამიტომ, ჩვენი ღვინო ინარჩუნებს ' +
        'ჯიშისთვის დამახასიათებელ არომატს, გემოსა და ხასიათს.\n\n' +
        'ჩვენი ვენახები ზემო ხანდაკის ნოყიერ მიწაზეა გაშენებული, ' +
        'სადაც ქართლის უნიკალური კლიმატი და ტრადიცია ' +
        'თითოეულ მოსავალს განსაკუთრებულ იდენტობას სძენს. ' +
        'ყოველი ბოთლი ასახავს იმ შრომას, გამოცდილებასა და ' +
        'სიყვარულს, რომელიც ვენახიდან იწყება და თქვენს ' +
        'სუფრამდე აღწევს.\n\n' +
        '„ცაბო" — ქართული ღვინო, შექმნილი სიყვარულით, ' +
        'ქართლის გულიდან.'
      ),
      en: (
        'Since 2018, in the heart of Shida Kartli, in the village of ' +
        'Zemo Khandaki, Kaspi district, the story of "Tsabo" is being ' +
        'written with love, dedication, and deep respect for the ' +
        'traditions of Georgian winemaking.\n\n' +
        '"Tsabo" is a family brand that creates quality wine through ' +
        'a natural approach. We believe that the best results are ' +
        'achieved when we respect the natural qualities of the grape ' +
        'and use only the necessary intervention in the production ' +
        'process. That is why our wine preserves the aroma, taste, and ' +
        'character characteristic of each variety.\n\n' +
        'Our vineyards are planted on the fertile land of Zemo ' +
        'Khandaki, where the unique climate and tradition of Kartli ' +
        'give each harvest a special identity. Every bottle reflects ' +
        'the labor, experience, and love that begins in the vineyard ' +
        'and reaches your table.\n\n' +
        '"Tsabo" — Georgian wine, made with love, from the heart of Kartli.'
      ),
    },
    imageAlt: { ka: 'რთველი — ყურძნის კრეფა', en: 'Rtveli — grape harvest' },
    image: '/VAZI.png',
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
