import { Client } from '@notionhq/client/build/src'

const notion = new Client({
  auth: process.env.NOTION_SECRET,
})

export const parseEvent = async (pageObject) => {
  const { properties } = pageObject

  const content = await parseChildBlocks(pageObject.id)

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

export const parseChildBlocks = async (parentBlockId) => {
  // Fetch child blocks
  const data = await notion.blocks.children.list({
    block_id: parentBlockId,
  })

  const result = await Promise.all(data.results.map(parseBlock))

  return listifyBlocks(result)
}

export const listifyBlocks = (blocks) => {
  const listItemTypes = ['numbered_list_item', 'bulleted_list_item']
  const listTypes = ['numbered_list', 'bulleted_list']

  return blocks
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
    .reduce((acc, value) => {
      if (listItemTypes.includes(value[0].type)) {
        const itemType = value[0].type
        const listType = listTypes[listItemTypes.indexOf(itemType)]
        acc.push({
          type: listType,
          listItems: value,
        })
      } else {
        acc.push(value[0])
      }
      return acc
    }, [])
}

export const parseBlock = (block) => {
  switch (block.type) {
    case 'paragraph':
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return parseTextTypeBlock(block)
    default:
      return block
  }
}

// export const parseChildren = async
export const parseIdAndType = ({ id, type }) => ({ id, type })

export const parseTextContent = (block) => ({ text: block[block.type].text })

export const parseTextTypeBlock = async (block) => {
  const children = block.has_children ? await parseChildBlocks(block.id) : []

  return {
    ...parseIdAndType(block),
    ...parseTextContent(block),
    children,
  }
}
