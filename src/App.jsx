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
        {
      id: 16,
      content: "item 16",
      parent_id: null,
      type: "container",
      children: [
        {
          id: 17,
          content: "item 17",
          type: "container",
          parent_id: 16,
          children: [
            { id: 18, content: "item 18", type: "text", parent_id: 17 },
            { id: 19, content: "item 19", type: "text", parent_id: 17 },
          ],
        },
        { id: 20, content: "item 20", type: "text", parent_id: 16 },
      ],
    },
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

  // Function to deeply clone and find an item in the blocks tree
  const findAndRemoveItem = (blocks, itemId) => {
    let removedItem = null;
    
    const traverse = (items) => {
      const result = [];
      
      for (const item of items) {
        if (item.id === itemId) {
          removedItem = { ...item };
          continue;
        }
        
        const newItem = { ...item };
        if (item.children) {
          newItem.children = traverse(item.children);
        }
        result.push(newItem);
      }
      
      return result;
    };
    
    const newBlocks = traverse(blocks);
    return { newBlocks, removedItem };
  };

  // Function to update block structure when items are moved
  const handleBlockUpdate = (updatedList, parentId = null) => {
    setBlocks(prevBlocks => {
      let newBlocks = [...prevBlocks];
      
      // Process each item in the updated list
      updatedList = updatedList.map(item => {
        // If the item exists elsewhere in the tree, remove it first
        const searchResult = findAndRemoveItem(newBlocks, item.id);
        
        if (searchResult.removedItem) {
          newBlocks = searchResult.newBlocks;
          // Preserve the original item's properties while updating parent_id
          return {
            ...searchResult.removedItem,
            parent_id: parentId
          };
        }
        
        // If item wasn't found elsewhere, it's new to this location
        return {
          ...item,
          parent_id: parentId
        };
      });
      
      // If this is a top-level update, return the new list
      if (parentId === null) {
        return updatedList;
      }
      
      // Otherwise, find the parent container and update its children
      const updateChildren = (blocks) => {
        return blocks.map(block => {
          if (block.id === parentId) {
            return { ...block, children: updatedList };
          }
          if (block.children) {
            return {
              ...block,
              children: updateChildren(block.children)
            };
          }
          return block;
        });
      };
      
      return updateChildren(newBlocks);
    });
  };

  return (
    <div className="p-4">
      <ReactSortable
        list={blocks}
        setList={(newState) => handleBlockUpdate(newState)}
        {...sortableOptions}
      >
        {blocks.map((block) => (
          <BlockWrapper
            key={block.id}
            block={block}
            handleBlockUpdate={handleBlockUpdate}
          />
        ))}
      </ReactSortable>
      <pre className="mt-8 p-4 bg-gray-100 rounded overflow-auto">
        <code>{JSON.stringify(blocks, null, 2)}</code>
      </pre>
    </div>
  );
}

function Container({ block, handleBlockUpdate }) {
  return (
    <ReactSortable
      list={block.children}
      setList={(newState) => handleBlockUpdate(newState, block.id)}
      {...sortableOptions}
    >
      {block.children.map((child) => (
        <BlockWrapper
          key={child.id}
          block={child}
          handleBlockUpdate={handleBlockUpdate}
        />
      ))}
    </ReactSortable>
  );
}

function BlockWrapper({ block, handleBlockUpdate }) {
  if (!block) return null;

  return (
    <div className="relative bg-white p-4 mb-2 border border-gray-200 rounded cursor-move hover:border-blue-300">
      <div className="mb-2">
        <strong>Type:</strong> {block.type}
        <strong className="ml-4">ID:</strong> {block.id}
        <strong className="ml-4">Parent:</strong> {block.parent_id ?? "null"}
      </div>
      <div className="mb-2">{block.content}</div>
      {block.type === "container" && (
        <div className="pl-4 border-l-2 border-gray-200">
          <Container block={block} handleBlockUpdate={handleBlockUpdate} />
        </div>
      )}
    </div>
  );
}