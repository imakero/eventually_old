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
    default:
      console.log(block.type)
      throw 'Could not parse'
  }
}

const parseListItems = (blocks) => <>{blocks.map(parseListItem)}</>

const parseListItem = (block) => {
  return <li key={block.id}>{block.text.map(parseText)}</li>
}

const parseNumberedList = (block) => {
  return <ol key={block.id}>{parseListItems(block.listItems)}</ol>
}

const parseHeading1 = (block) => {
  return <h2 key={block.id}>{block.heading_1.text.map(parseText)}</h2>
}

const parseHeading2 = (block) => {
  return <h3 key={block.id}>{block.heading_2.text.map(parseText)}</h3>
}

const parseHeading3 = (block) => {
  return <h4 key={block.id}>{block.heading_3.text.map(parseText)}</h4>
}

const parseParagraph = (block) => {
  return (
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
}

const parseRichText = (block) => {
  return (
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
}

const parseImage = ({ id, dimensions, image }) => {
  return (
    <Image
      key={id}
      src={`/images/${id}.jpg`}
      width={dimensions.width}
      height={dimensions.height}
      alt={parsePlainText(image.caption)}
    />
  )
}

const parseCode = ({ id, code }) => {
  return (
    <pre key={id}>
      <code className={`language-${code.language}`}>
        {parsePlainText(code.text)}
      </code>
    </pre>
  )
}

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
