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
        },
        border: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        return () => (
            <section class={`py-8 px-4 bg-gray-50 ${props.border ? 'border-t-2 border-green-700 border-b-2 border-green-200' : ''}`} >

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
