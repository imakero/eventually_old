import { Client } from '@notionhq/client'
import { parseEvent } from '../server/notion'

export default function Home() {
  return <div>Landing page</div>
}

export const getStaticProps = async () => {
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  })

  const data = await notion.databases.query({
    database_id: 'ab590e2e54ce459cb570d0acccfb72da',
  })

  const events = await Promise.all(
    data.results.map((pageObject) => parseEvent(pageObject))
  )

  // console.log(JSON.stringify(events, null, 2))
  //console.log(events)

  //console.log(JSON.stringify(data, null, 2))
}
