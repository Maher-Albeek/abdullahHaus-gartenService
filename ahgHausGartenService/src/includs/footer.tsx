import {defineComponent} from 'vue'

export default defineComponent({
    name: 'Footer',
    setup() {
        return () => (
            <footer class="bg-brand-dark text-white py-6 mt-20">
                <div class="max-w-6xl mx-auto px-4 text-center text-sm">
                    &copy; {new Date().getFullYear()} AHG Haus-Gartenservice. Alle Rechte vorbehalten.
                </div>
            </footer>
        )
    }
})