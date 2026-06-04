import {defineComponent} from 'vue'

export default defineComponent({
    name: 'PageTitle',
    props: {
        title: {
            type: String,
            required: true
        },
        desc: {
            type: String,
            required: true
        }
    },
    setup(props) {
        return () => (
            <section class="py-8 px-4 bg-gray-50">

                <div class="max-w-6xl mx-auto">
                    <div class="two alt-two">
                        <h1>{props.title}

                            <span>{props.desc}</span>
                        </h1>
                        </div>
                </div>
            </section>
        )
    }
})
