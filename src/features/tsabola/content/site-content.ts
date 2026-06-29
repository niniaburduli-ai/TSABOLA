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
      name: { ka: 'თეთრი მშრალი', en: 'White Dry' },
      type: { ka: 'თეთრი', en: 'White' },
      typeBadge: { ka: 'თეთრი', en: 'White' },
      price: '30₾',
      description: {
        ka: 'ღია ჩალისფერი. ნაზი არომატი, სიხალისე, ჰარმონიული დაბოლოება.',
        en: 'Light straw. Delicate aroma, pleasant freshness, harmonious finish.',
      },
      image: '/white wine.png',
      details: {
        ka: 'ღვინო: მშრალი | ყურძენი: ჩინებული\nრეგიონი: ზემო ხანდაკი, შიდა ქართლი',
        en: 'Wine: Dry | Grape: Chinebuli\nRegion: Zemo Khandaki, Shida Kartli',
      },
      longDescription: {
        ka: '„ცაბოს" თეთრი მშრალი ღვინო დამზადებულია შიდა ქართლის, სოფელ ზემო ხანდაკში ' +
          'მოწეული ჩინებულის ჯიშის რჩეული ყურძნისგან. ღვინო გამოირჩევა ღია ჩალისფერი ' +
          'შეფერილობით, ნაზი არომატით, სასიამოვნო სიხალისითა და ჰარმონიული, ხანგრძლივი დაბოლოებით.',
        en: 'Tsabo\'s White Dry wine is made from selected Chinebuli variety grapes grown in ' +
          'the village of Zemo Khandaki, Shida Kartli. The wine stands out for its light straw ' +
          'color, delicate aroma, pleasant freshness, and a harmonious, lingering finish.',
      },
      serveTemp: '10–12°C',
      alcohol: '13.5%',
      volume: '750 მლ',
    },
    {
      id: 'red',
      name: { ka: 'წითელი მშრალი', en: 'Red Dry' },
      type: { ka: 'წითელი', en: 'Red' },
      typeBadge: { ka: 'წითელი', en: 'Red' },
      price: '50₾',
      description: {
        ka: 'ღრმა ლალისფერი. ხავერდოვანი სტრუქტურა, მწიფე კენკრა, დაბალანსებული დაბოლოება.',
        en: 'Deep ruby. Velvety structure, ripe berry aromas, balanced finish.',
      },
      image: '/red wine.png',
      details: {
        ka: 'ღვინო: მშრალი | ყურძენი: დანახარული\nრეგიონი: ზემო ხანდაკი, შიდა ქართლი',
        en: 'Wine: Dry | Grape: Danakharuli\nRegion: Zemo Khandaki, Shida Kartli',
      },
      longDescription: {
        ka: '„ცაბოს" წითელი მშრალი ღვინო დამზადებულია შიდა ქართლის, სოფელ ზემო ხანდაკში ' +
          'მოწეული დანახარულის ჯიშის რჩეული ყურძნისგან. ღვინო გამოირჩევა ღრმა ლალისფერი ' +
          'შეფერილობით, მწიფე მტევნის ნაზი არომატებით, ხავერდოვანი სტრუქტურით და ' +
          'დაბალანსებული, ხანგრძლივი დაბოლოებით.',
        en: 'Tsabo\'s Red Dry wine is made from selected Danakharuli variety grapes grown in ' +
          'the village of Zemo Khandaki, Shida Kartli. The wine stands out for its deep ruby ' +
          'color, delicate aromas of ripe clusters, velvety structure, and a balanced, lingering finish.',
      },
      serveTemp: '16–18°C',
      alcohol: '12.5%',
      volume: '750 მლ',
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
      ka: '„ცაბო" — ტრადიცია ქართლის გულიდან',
      en: '"Tsabo" — A Tradition from the Heart of Kartli',
    },
    body: {
      ka:
        '2018 წლიდან, შიდა ქართლის გულში, კასპის რაიონის სოფელ ზემო ხანდაკში, ' +
        '„ცაბოს" ისტორია სიყვარულით, შრომითა და ქართული მეღვინეობის ტრადიციების პატივისცემით იქმნება.\n\n' +
        '„ცაბო" ოჯახური ბრენდია, რომელიც ქვევრის ღვინის ბუნებრივ ხასიათს ინარჩუნებს. ' +
        'გვჯერა, რომ საუკეთესო ღვინო იქმნება მაშინ, როდესაც ბუნებას თავისი საქმის კეთების საშუალებას ვაძლევთ. ' +
        'სწორედ ამიტომ, ღვინო მინიმალური ჩარევით იწარმოება — ის ბუნებრივად იწმინდება, ' +
        'მწიფდება და ინარჩუნებს ყურძნის ნამდვილ არომატსა და გემოს.\n\n' +
        'ჩვენი ვენახები ზემო ხანდაკის ნოყიერ მიწაზეა გაშენებული, სადაც თითოეული მტევანი ' +
        'მზის, ნიადაგისა და ტრადიციის უნიკალურ ისტორიას ატარებს. ყოველი ბოთლი არის ' +
        'პატივისცემა ქართული მეღვინეობის მრავალსაუკუნოვანი მემკვიდრეობისადმი და ' +
        'მოწვევა, რომ ეს ისტორია თქვენც გაიზიაროთ.\n\n' +
        '„ცაბო" — ხელნაკეთი ღვინო, შექმნილი სიყვარულით, ქართლის გულიდან.',
      en:
        'Since 2018, in the heart of Shida Kartli, in the village of Zemo Khandaki ' +
        'in the Kaspi district, Tsabo\'s story has been written with love, dedication, ' +
        'and deep respect for Georgian winemaking traditions.\n\n' +
        'Tsabo is a family brand that preserves the natural character of qvevri wine. ' +
        'We believe that the finest wine is made when we allow nature to do its work. ' +
        'That is why our wine is produced with minimal intervention — it clarifies ' +
        'naturally, matures in its own time, and retains the true aroma and taste of the grape.\n\n' +
        'Our vineyards are planted on the fertile soil of Zemo Khandaki, where every ' +
        'cluster carries the unique story of sun, earth, and tradition. Each bottle is ' +
        'a tribute to the centuries-old heritage of Georgian winemaking and an invitation ' +
        'for you to share in that story.\n\n' +
        '"Tsabo" — a handcrafted wine, made with love, from the heart of Kartli.',
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
