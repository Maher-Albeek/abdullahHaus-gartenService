import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type ContentItem = Record<string, string | number | boolean>

export type WebsiteSection = {
  id: string
  label: string
  description: string
  enabled: boolean
  content: ContentItem
  items: ContentItem[]
}

export type WebsiteContent = {
  brand: {
    businessName: string
    logoUrl: string
    primaryColor: string
    accentColor: string
  }
  contact: {
    phone: string
    email: string
    address: string
    whatsapp: string
    instagram: string
    facebook: string
  }
  sections: WebsiteSection[]
}

const STORAGE_KEY = 'ahg-website-content'

const defaultServiceItems: ContentItem[] = [
  {
    icon: 'fa-solid fa-snowflake',
    title: 'Winterdienst',
    desc: 'Schneeräumung und Streudienst – damit Sie sicher unterwegs sind.',
    details: 'Gehwege und Zufahrten räumen\nStreudienst nach Bedarf',
    grad: '#1a6b8b, #85c1e9',
    featured: false,
  },
  {
    icon: 'fa-solid fa-window-maximize',
    title: 'Fensterreinigung innen & außen',
    desc: 'Streifenfreie Fenster – innen wie außen, auch in großen Höhen.',
    details: 'Rahmen und Fensterbänke\nPrivat- und Gewerbeobjekte',
    grad: '#8B1A2B, #c0392b',
    featured: true,
  },
  {
    icon: 'fa-solid fa-building',
    title: 'Büro- & Arbeitsplatzreinigung',
    desc: 'Regelmäßige Reinigung von Büros und gewerblichen Arbeitsflächen.',
    details: 'Flexible Reinigungsintervalle\nSanitär- und Gemeinschaftsräume',
    grad: '#4D8B23, #62af2d',
    featured: false,
  },
  {
    icon: 'fa-solid fa-broom',
    title: 'Standardreinigung',
    desc: 'Gründliche Reinigung aller Räume – zuverlässig und termingerecht.',
    details: 'Böden und Oberflächen\nKüche und Sanitärbereiche',
    grad: '#8B1A2B, #c0392b',
    featured: false,
  },
  {
    icon: 'fa-solid fa-house',
    title: 'Hauswirtschaft',
    desc: 'Hauswirtschaftliche Dienstleistungen für ein gepflegtes Zuhause.',
    details: 'Individuelle Unterstützung\nRegelmäßige feste Termine',
    grad: '#4D8B23, #2ecc71',
    featured: false,
  },
  {
    icon: 'fa-solid fa-glass-water',
    title: 'Glasreinigung',
    desc: 'Kristallklare Glasflächen – für Schaufenster, Fassaden und Trennwände.',
    details: 'Schaufenster und Glasfassaden\nGlastrennwände und Türen',
    grad: '#1a6b8b, #5dade2',
    featured: false,
  },
  {
    icon: 'fa-solid fa-leaf',
    title: 'Gartenpflege',
    desc: 'Rasenmähen, Heckenschnitt, Bepflanzung und saisonale Gartenpflege.',
    details: 'Rasen- und Heckenschnitt\nSaisonale Pflegearbeiten',
    grad: '#4D8B23, #a8e063',
    featured: false,
  },
  {
    icon: 'fa-solid fa-truck-moving',
    title: 'Umzugsreinigung',
    desc: 'Professionelle Reinigung beim Ein- oder Auszug – besenrein bis makellos sauber.',
    details: 'Endreinigung leerer Räume\nKüche, Bad und Fenster',
    grad: '#1a6b8b, #3498db',
    featured: false,
  },
  {
    icon: 'fa-solid fa-wrench',
    title: 'Kleine Schönheitsreparaturen',
    desc: 'Streichen, Spachteln und kleine Ausbesserungsarbeiten für ein frisches Erscheinungsbild.',
    details: 'Kleine Ausbesserungen\nStreich- und Spachtelarbeiten',
    grad: '#8B1A2B, #f39c12',
    featured: false,
  },
]

const defaultBenefitsContent: ContentItem = {
  kicker: 'Ihre Vorteile',
  title: 'Ein Service, auf den Sie sich verlassen können',
  intro:
    'Von der ersten Anfrage bis zur erledigten Arbeit sorgen wir für klare Absprachen, saubere Ergebnisse und einen unkomplizierten Ablauf.',
  concernsKicker: 'Gut zu wissen',
  concernsTitle: 'Häufige Anliegen, klar beantwortet',
  concernsIntro:
    'Gute Zusammenarbeit beginnt mit offenen Antworten. Diese Punkte klären wir bereits vor dem ersten Termin.',
  buttonLabel: 'Persönlich beraten lassen',
}

const defaultBenefitItems: ContentItem[] = [
  {
    kind: 'benefit',
    icon: 'fa-solid fa-file-signature',
    title: 'Transparentes Angebot',
    text: 'Sie erhalten vor Beginn eine klare Leistungsübersicht und einen nachvollziehbaren Preis.',
  },
  {
    kind: 'benefit',
    icon: 'fa-solid fa-calendar-check',
    title: 'Verlässliche Termine',
    text: 'Wir stimmen den Einsatz verbindlich mit Ihnen ab und informieren Sie bei Änderungen frühzeitig.',
  },
  {
    kind: 'benefit',
    icon: 'fa-solid fa-list-check',
    title: 'Passend zu Ihrem Bedarf',
    text: 'Einmaliger Auftrag oder regelmäßige Pflege: Umfang und Rhythmus richten sich nach Ihrem Objekt.',
  },
  {
    kind: 'benefit',
    icon: 'fa-solid fa-comments',
    title: 'Direkter Kontakt',
    text: 'Ihre Fragen und Wünsche klären Sie direkt mit einem persönlichen Ansprechpartner.',
  },
  {
    kind: 'concern',
    question: 'Bleiben die Kosten überschaubar?',
    answer: 'Ja. Wir besprechen den gewünschten Umfang vorab und erstellen darauf basierend Ihr Angebot.',
  },
  {
    kind: 'concern',
    question: 'Kann ich einzelne Leistungen kombinieren?',
    answer: 'Ja. Reinigung, Gartenpflege und kleinere Reparaturen können passend zusammengefasst werden.',
  },
  {
    kind: 'concern',
    question: 'Muss ich während des Termins vor Ort sein?',
    answer: 'Nicht zwingend. Zugang, Aufgaben und Abnahme können individuell mit Ihnen vereinbart werden.',
  },
]

export const defaultWebsiteContent: WebsiteContent = {
  brand: {
    businessName: 'AHG Haus-Gartenservice',
    logoUrl: '/AHG.webp',
    primaryColor: '#4d8b23',
    accentColor: '#8b1a2b',
  },
  contact: {
    phone: '0176 32093451',
    email: 'info@ahg-service.de',
    address: 'Ludwigsburger Str. 49, 71332 Waiblingen',
    whatsapp: '4917632093451',
    instagram: '',
    facebook: '',
  },
  sections: [
    {
      id: 'hero',
      label: 'Hero',
      description: 'First impression, headline and key figures.',
      enabled: true,
      content: {
        eyebrow: 'Haus & Garten in besten Händen',
        title: 'Abdullah für Haus & Garten',
        subtitle:
          'Ihr zuverlässiger Partner für professionelle Pflege und Instandhaltung von Haus und Garten.',
        teamCount: 8,
        yearsCount: 12,
        projectsCount: 350,
        backgroundVideo: '/hero-bg.mp4',
      },
      items: [],
    },
    {
      id: 'services',
      label: 'Leistungen',
      description: 'Service cards shown on the homepage.',
      enabled: true,
      content: {
        kicker: 'Unsere Leistungen',
        title: 'Alles rund um Haus und Garten',
        intro: 'Von der Grundreinigung bis zum Winterdienst – zuverlässig aus einer Hand.',
        buttonLabel: 'Jetzt Angebot anfragen',
      },
      items: defaultServiceItems,
    },
    {
      id: 'benefits',
      label: 'Vorteile',
      description: 'Trust-building benefits and service promises.',
      enabled: true,
      content: defaultBenefitsContent,
      items: defaultBenefitItems,
    },
    {
      id: 'gallery',
      label: 'Galerie',
      description: 'Project images and captions.',
      enabled: true,
      content: {
        kicker: 'Referenzen',
        title: 'Einblicke in unsere Arbeit',
        intro: 'Abgeschlossene Projekte rund um Haus und Garten.',
      },
      items: [
        { imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900', alt: 'Gartenpflege' },
        { imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900', alt: 'Gartenprojekt' },
      ],
    },
    {
      id: 'about',
      label: 'Über uns',
      description: 'Company story and about image.',
      enabled: true,
      content: {
        kicker: 'Über uns',
        title: 'Persönlich. Gründlich. Zuverlässig.',
        text: 'AHG Haus-Gartenservice ist Ihr zuverlässiger Partner für professionelle Pflege und Instandhaltung von Haus und Garten.',
        imageUrl: '/about.jpg',
      },
      items: [],
    },
    {
      id: 'testimonials',
      label: 'Bewertungen',
      description: 'Customer testimonials and ratings.',
      enabled: true,
      content: {
        kicker: 'Kundenstimmen',
        title: 'Was unsere Kunden sagen',
      },
      items: [
        { name: 'Maria S.', service: 'Gartenpflege', rating: 5, text: 'Absolut professioneller Service!' },
        { name: 'Thomas K.', service: 'Winterdienst', rating: 5, text: 'Sehr zuverlässig und pünktlich.' },
      ],
    },
    {
      id: 'faq',
      label: 'FAQ',
      description: 'Frequently asked questions.',
      enabled: true,
      content: {
        kicker: 'FAQ',
        title: 'Häufig gestellte Fragen',
        intro: 'Schnelle Antworten zum Ablauf und zu unseren Leistungen.',
      },
      items: [
        { question: 'Wie erhalte ich ein Angebot?', answer: 'Kontaktieren Sie uns telefonisch oder über das Kontaktformular.' },
        { question: 'Kann ich Leistungen kombinieren?', answer: 'Ja, wir stellen Leistungen passend zu Ihrem Bedarf zusammen.' },
      ],
    },
    {
      id: 'contact',
      label: 'Kontakt',
      description: 'Contact form heading and call to action.',
      enabled: true,
      content: {
        kicker: 'Kontakt',
        title: 'Wie können wir Ihnen helfen?',
        intro: 'Haben Sie Fragen oder möchten Sie ein individuelles Angebot? Wir freuen uns auf Ihre Nachricht!',
        buttonLabel: 'Nachricht senden',
      },
      items: [],
    },
  ],
}

const cloneDefaults = () => JSON.parse(JSON.stringify(defaultWebsiteContent)) as WebsiteContent

const migrateServices = (websiteContent: WebsiteContent) => {
  const services = websiteContent.sections.find((section) => section.id === 'services')
  if (!services) return websiteContent

  const hasOldStarterServices =
    services.items.length <= 3 &&
    services.items.every((item) => item.details === undefined && item.grad === undefined)

  if (hasOldStarterServices) {
    services.items = JSON.parse(JSON.stringify(defaultServiceItems)) as ContentItem[]
    return websiteContent
  }

  services.items = services.items.map((item) => {
    const migrated: ContentItem = {
      ...item,
      icon: String(item.icon ?? 'fa-solid fa-broom'),
      desc: String(item.desc ?? item.description ?? ''),
      details: String(item.details ?? ''),
      grad: String(item.grad ?? item.gradient ?? '#4D8B23, #62af2d'),
      featured: item.featured === true || Number(item.featured ?? 0) === 1,
    }
    delete migrated.description
    delete migrated.gradient
    return migrated
  })

  return websiteContent
}

const migrateBenefits = (websiteContent: WebsiteContent) => {
  const benefits = websiteContent.sections.find((section) => section.id === 'benefits')
  if (!benefits) return websiteContent

  benefits.content = { ...defaultBenefitsContent, ...benefits.content }

  const hasOldStarterBenefits =
    benefits.items.length <= 2 &&
    benefits.items.every((item) => item.kind === undefined && item.icon === undefined)

  if (hasOldStarterBenefits) {
    benefits.items = JSON.parse(JSON.stringify(defaultBenefitItems)) as ContentItem[]
    return websiteContent
  }

  benefits.items = benefits.items.map((item) => {
    const kind = String(item.kind ?? (item.question !== undefined ? 'concern' : 'benefit'))
    if (kind === 'concern') return { ...item, kind }

    const migrated: ContentItem = { ...item, kind, text: String(item.text ?? item.description ?? '') }
    delete migrated.description
    return migrated
  })

  if (!benefits.items.some((item) => item.kind === 'concern')) {
    benefits.items.push(
      ...(JSON.parse(JSON.stringify(defaultBenefitItems.filter((item) => item.kind === 'concern'))) as ContentItem[]),
    )
  }

  return websiteContent
}

export const useWebsiteContentStore = defineStore('websiteContent', () => {
  const content = ref<WebsiteContent>(cloneDefaults())
  const lastSaved = ref<Date | null>(null)

  const load = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) content.value = migrateBenefits(migrateServices(JSON.parse(stored) as WebsiteContent))
    } catch {
      content.value = cloneDefaults()
    }
  }

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content.value))
    lastSaved.value = new Date()
  }

  const reset = () => {
    content.value = cloneDefaults()
    save()
  }

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= content.value.sections.length) return
    const sections = content.value.sections
    ;[sections[index], sections[target]] = [sections[target]!, sections[index]!]
  }

  const enabledSections = computed(() => content.value.sections.filter((section) => section.enabled))

  load()
  watch(content, save, { deep: true })

  return { content, enabledSections, lastSaved, save, reset, moveSection }
})
