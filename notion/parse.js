import Image from 'next/image'
import React from 'react'

export const parseBlocks = (blocks) => {
  return <>{blocks.map((block) => parseBlock(block))}</>
}

export const parseBlock = (block) => {
  switch (block.type) {
    case 'heading_1':
      return parseHeading1(block)
    case 'heading_2':
      return parseHeading2(block)
    case 'heading_3':
      return parseHeading3(block)
    case 'paragraph':
      return parseParagraph(block)
    case 'image':
      return parseImage(block)
    case 'code':
      return parseCode(block)
    case 'rich_text':
      return parseRichText(block)
    case 'numbered_list':
      return parseNumberedList(block)
    case 'bulleted_list':
      return parseBulletedList(block)
    default:
      console.log(block.type)
      throw 'Could not parse'
  }
}

const parseListItems = (blocks) => <>{blocks.map(parseListItem)}</>

const parseListItem = (block) => (
  <li key={block.id}>
    {block.text.map(parseText)}
    {parseBlocks(block.children)}
  </li>
)

const parseNumberedList = (block) => (
  <ol key={block.id}>{parseListItems(block.listItems)}</ol>
)

const parseBulletedList = (block) => (
  <ul key={block.id}>{parseListItems(block.listItems)}</ul>
)

const parseHeading1 = (block) => (
  <h2 key={block.id}>{block.text.map(parseText)}</h2>
)

const parseHeading2 = (block) => (
  <h3 key={block.id}>{block.text.map(parseText)}</h3>
)

const parseHeading3 = (block) => (
  <h4 key={block.id}>{block.text.map(parseText)}</h4>
)

const parseParagraph = (block) => (
  <p key={block.id}>
    {block.text.map((text, index) => {
      let element = parseText(text)
      if (typeof element !== 'string') {
        element = React.cloneElement(element, { key: index })
      }
      return element
    })}
  </p>
)

const parseRichText = (block) => (
  <p key={block.id}>
    {block.rich_text.map((text, index) => {
      let element = parseText(text)
      if (typeof element !== 'string') {
        element = React.cloneElement(element, { key: index })
      }
      return element
    })}
  </p>
)

const parseImage = (block) => {
  const { id, dimensions, caption } = block
  return (
    <Image
      key={id}
      src={`/images/${id}.jpg`}
      width={dimensions.width}
      height={dimensions.height}
      alt={parsePlainText(caption)}
    />
  )
}

const parseCode = ({ id, code }) => (
  <pre key={id}>
    <code className={`language-${code.language}`}>
      {parsePlainText(code.text)}
    </code>
  </pre>
)

export const parsePlainText = (texts) =>
  texts.map((text) => text.plain_text).join('')

const parseText = (text) => wrapAnnotations(text.text.content, text.annotations)

const wrapAnnotations = (content, annotations) => {
  let element = content
  if (annotations.bold) {
    element = <strong>{element}</strong>
  }
  if (annotations.italic) {
    element = <em>{element}</em>
  }
  if (annotations.strikethrough) {
    element = <span className="strikethrough">{element}</span>
  }
  if (annotations.underline) {
    element = <span className="underline">{element}</span>
  }
  if (annotations.code) {
    element = <code>{element}</code>
  }
  return element
}
