import { defineComponent, type PropType } from 'vue'
import type { ContentItem, WebsiteSection } from '../stores/websiteContent'

const blockStyle = (item: ContentItem) => ({
  left: `${Number(item.x ?? 5)}%`,
  top: `${Number(item.y ?? 30)}%`,
  width: `${Number(item.width ?? 28)}%`,
  backgroundColor: String(item.backgroundColor ?? '#ffffff'),
  color: String(item.textColor ?? '#20251e'),
})

export default defineComponent({
  name: 'CustomSection',
  props: { section: { type: Object as PropType<WebsiteSection>, required: true } },
  setup(props) {
    return () => {
      const content = props.section.content
      if (!props.section.enabled) return null
      return (
        <section
          id={props.section.id}
          class="custom-content-section"
          style={{
            backgroundColor: String(content.backgroundColor ?? '#f5f7f3'),
            color: String(content.textColor ?? '#20251e'),
            minHeight: `${Number(content.minHeight ?? 560)}px`,
            backgroundImage: content.imageUrl ? `linear-gradient(#0003, #0003), url(${content.imageUrl})` : undefined,
          }}
        >
          <div class="custom-content-heading">
            <p>{String(content.kicker ?? '')}</p>
            <h2>{String(content.title ?? '')}</h2>
            <span>{String(content.description ?? '')}</span>
          </div>
          {props.section.items.map((item, index) =>
            item.type === 'button'
              ? <a key={index} class="custom-content-block custom-content-button" href={String(item.url ?? '#contact')} style={blockStyle(item)}>{String(item.label ?? '')}</a>
              : <article key={index} class="custom-content-block custom-content-card" style={blockStyle(item)}>
                  <strong>{String(item.title ?? '')}</strong><span>{String(item.description ?? '')}</span>
                </article>,
          )}
        </section>
      )
    }
  },
})
