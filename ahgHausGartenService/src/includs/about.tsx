import { defineComponent } from 'vue'
const aboutImage = '../public/about.jpg'
export default defineComponent({
  name: 'About',
  setup() {
    return () => (
      <section id="about" class="py-20 px-4 bg-white">
        <div class="max-w-6xl mx-auto grid grid-flow-col grid-rows-3 gap-4">
         <div class=" row-span-3  items-center justify-center">
            <img src={aboutImage} alt="Unser Team bei der Arbeit" class="w-full h-auto max-h-[600px] object-cover rounded-lg shadow-md" />
        </div>
        <div class=" col-span-2 row-span-2  ">
            
            <p class="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-6">
                AHG Haus-Gartenservice ist Ihr zuverlässiger Partner für professionelle Pflege und Instandhaltung von Haus und Garten. Mit über 10 Jahren Erfahrung bieten wir maßgeschneiderte Lösungen für Privat- und Geschäftskunden in der Region.
            </p>
            <p class="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-6">
                Unser Team aus erfahrenen Fachkräften kümmert sich mit Leidenschaft um Ihren Außenbereich – von der Rasenpflege über den Heckenschnitt bis hin zur Gartengestaltung. Wir legen großen Wert auf Qualität, Zuverlässigkeit und Kundenzufriedenheit.
            </p>
            <p class="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
                Bei AHG Haus-Gartenservice stehen Sie als Kunde im Mittelpunkt. Wir beraten Sie individuell, erstellen transparente Angebote und setzen Ihre Wünsche professionell um. Vertrauen Sie auf unsere Expertise und lassen Sie uns gemeinsam Ihren Traumgarten verwirklichen!
            </p>
        </div>
        </div>
      </section>
    )
  }
})
