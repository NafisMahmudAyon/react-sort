import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";

const sortableOptions = {
  animation: 150,
  fallbackOnBody: true,
  swapThreshold: 0.65,
  group: "shared",
};

export default function App() {
  const [blocks, setBlocks] = useState([
    {
      id: 1,
      content: "item 1",
      parent_id: null,
      type: "container",
      children: [
        {
          id: 12,
          content: "item 12",
          type: "container",
          parent_id: 1,
          children: [
            { id: 13, content: "item 13", type: "text", parent_id: 12 },
            { id: 14, content: "item 14", type: "text", parent_id: 12 },
          ],
        },
        { id: 15, content: "item 15", type: "text", parent_id: 1 },
      ],
    },
    {
      id: 4,
      content: "item 2",
      parent_id: null,
      type: "container",
      children: [
        {
          id: 5,
          content: "item 5",
          type: "container",
          parent_id: 4,
          children: [
            { id: 6, content: "item 6", type: "text", parent_id: 5 },
            { id: 9, content: "item 9", type: "text", parent_id: 5 },
          ],
        },
        { id: 8, content: "item 8", type: "text", parent_id: 4 },
      ],
    },
    {
      id: 10,
      content: "item 3",
      parent_id: null,
      type: "container",
      children: [
        { id: 11, content: "item 11", type: "text", parent_id: 10 },
      ],
    },
  ]);

  return (
    <div>
      <ReactSortable list={blocks} setList={setBlocks} {...sortableOptions}>
        {blocks.map((block, index) => (
          <BlockWrapper
            key={block.id}
            block={block}
            blockIndex={[index]}
            setBlocks={setBlocks}
          />
        ))}
      </ReactSortable>
      <pre style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}>
        <code>{JSON.stringify(blocks, null, 2)}</code>
      </pre>
    </div>
  );
}

function Container({ block, blockIndex, setBlocks }) {
  const handleUpdate = (updatedList) => {
    setBlocks((prevBlocks) => {
      const newBlocks = JSON.parse(JSON.stringify(prevBlocks));
      let target = newBlocks;

      // Traverse to the correct nested `children` array using blockIndex
      for (let i = 0; i < blockIndex.length - 1; i++) {
        target = target[blockIndex[i]].children;
      }

      const targetBlock = target[blockIndex[blockIndex.length - 1]];

      // Update children and their parent_id
      targetBlock.children = updatedList.map((child) => ({
        ...child,
        parent_id: targetBlock.id,
      }));

      return newBlocks;
    });
  };

  return (
    <ReactSortable
      list={block.children}
      setList={handleUpdate}
      {...sortableOptions}
    >
      {block.children.map((child, index) => (
        <BlockWrapper
          key={child.id}
          block={child}
          blockIndex={[...blockIndex, index]}
          setBlocks={setBlocks}
        />
      ))}
    </ReactSortable>
  );
}

function BlockWrapper({ block, blockIndex, setBlocks }) {
  if (!block) return null;

  const blockStyle = {
    position: "relative",
    background: "white",
    padding: "20px",
    marginBottom: "10px",
    border: "1px solid lightgray",
    borderRadius: "4px",
    cursor: "move",
  };

  if (block.type === "container") {
    return (
      <div style={blockStyle}>
        <strong>Container:</strong> {block.content} <strong>ID:</strong> {block.id} <strong>Parent:</strong> {block.parent_id ?? "null"}
        <Container block={block} blockIndex={blockIndex} setBlocks={setBlocks} />
      </div>
    );
  }

  return (
    <div style={blockStyle}>
      <strong>Text:</strong> {block.content} <strong>ID:</strong> {block.id} <strong>Parent:</strong> {block.parent_id ?? "null"}
    </div>
  );
}
