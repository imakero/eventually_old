import { parseBlocks } from '../notion/parse'
import { prepareEvents } from '../notion/prepare'

export default function Home({ events }) {
  // console.log(JSON.stringify(events[0].content, null, 2))
  return <div>{parseBlocks(events[0].content)}</div>
}

export const getStaticProps = async () => {
  const events = await prepareEvents()
  events.filter((event) => event.featured)

  return {
    props: {
      events,
    },
  }
}
