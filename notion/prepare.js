import { Client } from '@notionhq/client/build/src'
import { v4 as uuidv4 } from 'uuid'

const notion = new Client({
  auth: process.env.NOTION_SECRET,
})

export const prepareEvents = async () => {
  const notion = new Client({
    auth: process.env.NOTION_SECRET,
  })

  const data = await notion.databases.query({
    database_id: 'ab590e2e54ce459cb570d0acccfb72da',
  })

  return await Promise.all(
    data.results.map((pageObject) => prepareEvent(pageObject))
  )
}

export const prepareEvent = async (pageObject) => {
  const { properties } = pageObject

  const content = await prepareChildBlocks(pageObject.id)

  return {
    id: pageObject.id,
    date: properties.date.date.start,
    category: properties.category.select.name,
    description: properties.description.rich_text,
    name: properties.name.title,
    featured: properties.featured.checkbox,
    content,
  }
}

export const prepareChildBlocks = async (parentBlockId) => {
  // Fetch child blocks from api
  const data = await notion.blocks.children.list({
    block_id: parentBlockId,
  })

  const result = await Promise.all(data.results.map(prepareBlock))

  return listifyBlocks(result)
}

export const listifyBlocks = (blocks) => {
  const listItemTypes = ['numbered_list_item', 'bulleted_list_item']
  const listTypes = ['numbered_list', 'bulleted_list']

  return (
    blocks
      // First group all elements that are list items resulting in e.g
      // [[other], [other], [li, li, li], [other]]
      .reduce((acc, block) => {
        if (
          listItemTypes.includes(block.type) &&
          acc.length &&
          acc[acc.length - 1][0].type === block.type
        ) {
          acc[acc.length - 1].push(block)
        } else {
          acc.push([block])
        }
        return acc
      }, [])
      // Flatten the array and warp list items in a list element. Resulting in:
      // [other, other, {type: listType, listItems: [li, li, li]}, other]
      .reduce((acc, value) => {
        if (listItemTypes.includes(value[0].type)) {
          const itemType = value[0].type
          const listType = listTypes[listItemTypes.indexOf(itemType)]
          acc.push({
            id: uuidv4(),
            type: listType,
            listItems: value,
          })
        } else {
          acc.push(value[0])
        }
        return acc
      }, [])
  )
}

export const prepareBlock = (block) => {
  switch (block.type) {
    case 'paragraph':
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return prepareTextTypeBlock(block)
    default:
      return block
  }
}

export const prepareIdAndType = ({ id, type }) => ({ id, type })

export const prepareTextContent = (block) => ({ text: block[block.type].text })

export const prepareTextTypeBlock = async (block) => {
  const children = block.has_children ? await prepareChildBlocks(block.id) : []

  return {
    ...prepareIdAndType(block),
    ...prepareTextContent(block),
    children,
  }
}
