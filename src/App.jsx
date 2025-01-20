import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { ChevronUp, ChevronDown } from "lucide-react";

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
			children: [{ id: 11, content: "item 11", type: "text", parent_id: 10 }],
		},
	]);

	const [selectedIds, setSelectedIds] = useState(new Set());

	const toggleSelection = (id) => {
		setSelectedIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	const selectAll = () => {
		const allIds = new Set();
		const collectIds = (items) => {
			items.forEach((item) => {
				allIds.add(item.id);
				if (item.children) {
					collectIds(item.children);
				}
			});
		};
		collectIds(blocks);
		setSelectedIds(allIds);
	};

	const clearSelection = () => {
		setSelectedIds(new Set());
	};

	const deleteSelected = () => {
		const removeSelectedItems = (items) => {
			return items.filter((item) => {
				if (selectedIds.has(item.id)) return false;
				if (item.children) {
					item.children = removeSelectedItems(item.children);
				}
				return true;
			});
		};

		setBlocks((prev) => removeSelectedItems([...prev]));
		clearSelection();
	};

	const generateUniqueId = () => {
		const ids = [];
		const collectIds = (items) => {
			items.forEach((item) => {
				ids.push(item.id);
				if (item.children) {
					collectIds(item.children);
				}
			});
		};
		collectIds(blocks);
		return Math.max(...ids) + 1;
	};

	const addNewItem = (parentId = null, type = "text") => {
		const newId = generateUniqueId();
		const newItem = {
			id: newId,
			content: `New ${type} ${newId}`,
			type: type,
			parent_id: parentId,
		};

		if (type === "container") {
			newItem.children = [];
		}

		if (parentId === null) {
			setBlocks((prev) => [...prev, newItem]);
		} else {
			setBlocks((prev) => {
				const updateChildren = (items) => {
					return items.map((item) => {
						if (item.id === parentId) {
							return {
								...item,
								children: [...(item.children || []), newItem],
							};
						}
						if (item.children) {
							return {
								...item,
								children: updateChildren(item.children),
							};
						}
						return item;
					});
				};
				return updateChildren(prev);
			});
		}
	};

	const moveItem = (itemId, direction) => {
		setBlocks((prevBlocks) => {
			const moveInArray = (array) => {
				const index = array.findIndex((item) => item.id === itemId);
				if (index === -1) {
					return array.map((item) => {
						if (item.children) {
							return { ...item, children: moveInArray(item.children) };
						}
						return item;
					});
				}

				const newIndex = direction === "up" ? index - 1 : index + 1;
				if (newIndex < 0 || newIndex >= array.length) return array;

				const newArray = [...array];
				[newArray[index], newArray[newIndex]] = [
					newArray[newIndex],
					newArray[index],
				];
				return newArray;
			};

			return moveInArray([...prevBlocks]);
		});
	};

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

	const handleBlockUpdate = (updatedList, parentId = null) => {
		setBlocks((prevBlocks) => {
			let newBlocks = [...prevBlocks];

			updatedList = updatedList.map((item) => {
				const searchResult = findAndRemoveItem(newBlocks, item.id);

				if (searchResult.removedItem) {
					newBlocks = searchResult.newBlocks;
					return {
						...searchResult.removedItem,
						parent_id: parentId,
					};
				}

				return {
					...item,
					parent_id: parentId,
				};
			});

			if (parentId === null) {
				return updatedList;
			}

			const updateChildren = (blocks) => {
				return blocks.map((block) => {
					if (block.id === parentId) {
						return { ...block, children: updatedList };
					}
					if (block.children) {
						return {
							...block,
							children: updateChildren(block.children),
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
			<div className="mb-4 space-y-2">
				<div className="flex justify-between items-center">
					<div className="space-x-2">
						<button
							onClick={() => addNewItem(null, "text")}
							className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
							Add Text Item
						</button>
						<button
							onClick={() => addNewItem(null, "container")}
							className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
							Add Container
						</button>
					</div>
					<div className="space-x-2">
						<button
							onClick={selectAll}
							className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
							Select All
						</button>
						<button
							onClick={clearSelection}
							className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
							disabled={selectedIds.size === 0}>
							Clear Selection
						</button>
						<button
							onClick={deleteSelected}
							className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
							disabled={selectedIds.size === 0}>
							Delete Selected ({selectedIds.size})
						</button>
					</div>
				</div>
				{selectedIds.size > 0 && (
					<div className="text-sm bg-gray-100 px-4 py-2 rounded">
						Selected Items: {Array.from(selectedIds).join(", ")}
					</div>
				)}
			</div>
			<ReactSortable
				list={blocks}
				setList={(newState) => handleBlockUpdate(newState)}
				{...sortableOptions}>
				{blocks.map((block, index) => (
					<BlockWrapper
						key={block.id}
						block={block}
						handleBlockUpdate={handleBlockUpdate}
						onAddItem={addNewItem}
						onMove={moveItem}
						isFirst={index === 0}
						isLast={index === blocks.length - 1}
						isSelected={selectedIds.has(block.id)}
						onToggleSelect={toggleSelection}
					/>
				))}
			</ReactSortable>
			<pre className="mt-8 p-4 bg-gray-100 rounded overflow-auto">
				<code>{JSON.stringify(blocks, null, 2)}</code>
			</pre>
		</div>
	);
}

function Container({
	block,
	handleBlockUpdate,
	onAddItem,
	onMove,
	onToggleSelect,
	selectedIds,
}) {
	return (
		<div>
			<div className="mb-2 space-x-2">
				<button
					onClick={() => onAddItem(block.id, "text")}
					className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
					Add Text
				</button>
				<button
					onClick={() => onAddItem(block.id, "container")}
					className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
					Add Container
				</button>
			</div>
			<ReactSortable
				list={block.children}
				setList={(newState) => handleBlockUpdate(newState, block.id)}
				{...sortableOptions}>
				{block.children.map((child, index) => (
					<BlockWrapper
						key={child.id}
						block={child}
						handleBlockUpdate={handleBlockUpdate}
						onAddItem={onAddItem}
						onMove={onMove}
						isFirst={index === 0}
						isLast={index === block.children.length - 1}
						isSelected={selectedIds && selectedIds.has(child.id)}
						onToggleSelect={onToggleSelect}
					/>
				))}
			</ReactSortable>
		</div>
	);
}

function BlockWrapper({
	block,
	handleBlockUpdate,
	onAddItem,
	onMove,
	isFirst,
	isLast,
	isSelected,
	onToggleSelect,
}) {
	if (!block) return null;

	return (
		<div
			className={`relative bg-white p-4 mb-2 border rounded cursor-pointer transition-all
        ${
					isSelected
						? "border-blue-500 ring-2 ring-blue-200"
						: "border-gray-200 hover:border-gray-300"
				}`}>
			<div className="absolute left-2 top-2">
				<input
					type="checkbox"
					checked={isSelected}
					onChange={(e) => {
						e.stopPropagation();
						onToggleSelect(block.id);
					}}
					className="h-4 w-4 rounded border-gray-300"
				/>
			</div>
			<div className="absolute right-2 top-2 flex flex-col gap-1">
				<button
					onClick={(e) => {
						e.stopPropagation();
						onMove(block.id, "up");
					}}
					disabled={isFirst}
					className={`p-1 rounded ${
						isFirst ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"
					}`}>
					<ChevronUp size={16} />
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onMove(block.id, "down");
					}}
					disabled={isLast}
					className={`p-1 rounded ${
						isLast ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"
					}`}>
					<ChevronDown size={16} />
				</button>
			</div>
			<div className="pl-6 mb-2">
				<strong>Type:</strong> {block.type}
				<strong className="ml-4">ID:</strong> {block.id}
				<strong className="ml-4">Parent:</strong> {block.parent_id ?? "null"}
			</div>
			<div className="pl-6 mb-2">{block.content}</div>
			{block.type === "container" && (
				<div className="pl-4 border-l-2 border-gray-200">
					<Container
						block={block}
						handleBlockUpdate={handleBlockUpdate}
						onAddItem={onAddItem}
						onMove={onMove}
						onToggleSelect={onToggleSelect}
						selectedIds={isSelected ? new Set([block.id]) : null}
					/>
				</div>
			)}
		</div>
	);
}
