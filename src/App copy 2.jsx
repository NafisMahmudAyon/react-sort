import React, { useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import {
	ChevronUp,
	ChevronDown,
	Type,
	Box,
	Image,
	FileText,
	Layout,
} from "lucide-react";

const sortableOptions = {
	animation: 150,
	fallbackOnBody: true,
	swapThreshold: 0.65,
	group: "shared",
};

const elementTemplates = [
	{
		template_id: "text-template",
		type: "text",
		content: "New Text Element",
		icon: Type,
		label: "Text Block",
	},
	{
		template_id: "container-template",
		type: "container",
		content: "New Container",
		children: [],
		icon: Box,
		label: "Container",
	},
	{
		template_id: "image-template",
		type: "image",
		content: "Image Placeholder",
		icon: Image,
		label: "Image",
	},
	{
		template_id: "heading-template",
		type: "heading",
		content: "New Heading",
		icon: FileText,
		label: "Heading",
	},
	{
		template_id: "section-template",
		type: "section",
		content: "New Section",
		children: [],
		icon: Layout,
		label: "Section",
	},
];

export default function App() {
	const [blocks, setBlocks] = useState([
		{
			id: 1,
			type: "container",
			content: "New Container",
			children: [
				{
					id: 2,
					type: "container",
					content: "New Container",
					children: [
						{
							id: 3,
							type: "text",
							content: "New Text Element",
						},
					],
					parent_id: 1,
				},
			],
			parent_id: null,
		},
	]);

  console.log(blocks)

	const [draggedTemplate, setDraggedTemplate] = useState(null);

	const generateUniqueId = () => {
		const ids = [];
		const collectIds = (items) => {
			items.forEach((item) => {
				ids.push(item.id);
				if (item.children) collectIds(item.children);
			});
		};
		collectIds(blocks);
		return ids.length > 0 ? Math.max(...ids) + 1 : 1;
	};

	const handleTemplateAdd = (template, parentId = null) => {
		const newItem = {
			id: generateUniqueId(),
			type: template.type,
			content: template.content,
			parent_id: parentId,
			children: template.children ? [] : undefined,
		};

		setBlocks((prev) => {
			const addToParent = (items) =>
				items.map((item) => {
					if (item.id === parentId) {
						return {
							...item,
							children: [...(item.children || []), newItem],
						};
					}
					if (item.children) {
						return {
							...item,
							children: addToParent(item.children),
						};
					}
					return item;
				});

			return parentId === null ? [...prev, newItem] : addToParent(prev);
		});
	};

  const findAndRemoveItem = (blocks, id) => {
		let removedItem = null;

		const newBlocks = blocks.filter((block) => {
			if (block.id === id) {
				removedItem = block; // Found the block to remove
				return false; // Remove it from the list
			}
			if (block.children) {
				const { newBlocks: updatedChildren, removedItem: childRemoved } =
					findAndRemoveItem(block.children, id);
				block.children = updatedChildren;
				if (childRemoved) {
					removedItem = childRemoved; // Found the block in children
				}
			}
			return true;
		});

		return { newBlocks, removedItem };
	};


	const handleBlockUpdate = (updatedList, parentId = null) => {
		setBlocks((prevBlocks) => {
			const updateTree = (blocks) =>
				blocks.map((block) => {
					if (block.id === parentId) {
						return {
							...block,
							children: updatedList,
						};
					}
					if (block.children) {
						return {
							...block,
							children: updateTree(block.children),
						};
					}
					return block;
				});

			const moveExistingBlocks = (updatedList) =>
				updatedList.map((item) => {
					// If the block exists elsewhere, remove it and update its parent_id
					const { newBlocks, removedItem } = findAndRemoveItem(
						prevBlocks,
						item.id
					);
					if (removedItem) {
						return {
							...removedItem,
							parent_id: parentId,
						};
					}
					// If it's a new block, just update its parent_id
					return {
						...item,
						parent_id: parentId,
					};
				});

			// Handle root-level updates or nested container updates
			if (parentId === null) {
				return moveExistingBlocks(updatedList);
			} else {
				return updateTree(prevBlocks, moveExistingBlocks(updatedList));
			}
		});
	};


	return (
		<div className="h-screen flex bg-gray-100">
			<div className="w-64 bg-white border-r border-gray-200 p-4">
				<h2 className="text-lg font-semibold mb-4">Elements</h2>
				<div className="space-y-2">
					{elementTemplates.map((template, index) => {
						const Icon = template.icon;
						return (
							<div
								key={template.template_id}
								className="flex items-center p-3 bg-white border border-gray-200 rounded cursor-move hover:border-blue-500 hover:bg-blue-50"
								draggable
								onDragStart={() => setDraggedTemplate(template)}
								onDragEnd={() => setDraggedTemplate(null)}>
								<Icon className="w-5 h-5 mr-2 text-gray-600" />
								<span>{template.label}</span>
							</div>
						);
					})}
				</div>
			</div>

			<div className="flex-1 p-6 overflow-auto">
				<div className="bg-white rounded-lg shadow-sm min-h-full p-6">
					<ReactSortable
						list={blocks}
						setList={(newState) => handleBlockUpdate(newState)}
						{...sortableOptions}>
						{blocks.map((block) => (
							<BlockWrapper
								key={block.id}
								block={block}
								handleBlockUpdate={handleBlockUpdate}
								onTemplateDrop={handleTemplateAdd}
								draggedTemplate={draggedTemplate}
							/>
						))}
					</ReactSortable>
				</div>
			</div>
		</div>
	);
}

function BlockWrapper({
	block,
	handleBlockUpdate,
	onTemplateDrop,
	draggedTemplate,
}) {
	return (
		<div className="relative bg-white p-4 mb-2 border rounded">
			<div className="pl-6">
				<div className="text-sm text-gray-500 mb-1">
					{block.type.charAt(0).toUpperCase() + block.type.slice(1)} ID:{" "}
					{block.id}
				</div>
				<div>{block.content}</div>
			</div>
			{block.type === "container" && (
				<Container
					block={block}
					handleBlockUpdate={handleBlockUpdate}
					onTemplateDrop={onTemplateDrop}
					draggedTemplate={draggedTemplate}
				/>
			)}
		</div>
	);
}


function Container({
	block,
	handleBlockUpdate,
	onTemplateDrop,
	draggedTemplate,
}) {
	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (draggedTemplate) {
			onTemplateDrop(draggedTemplate, block.id); // Add a new block
		}
	};

	return (
		<div
			className="pl-4 mt-2 min-h-[50px] border-2 border-dashed rounded-lg"
			onDragOver={(e) => e.preventDefault()}
			onDrop={handleDrop}>
			<ReactSortable
				list={block.children || []}
				setList={(newState) => handleBlockUpdate(newState, block.id)}
				{...sortableOptions}>
				{block.children?.map((child) => (
					<BlockWrapper
						key={child.id}
						block={child}
						handleBlockUpdate={handleBlockUpdate}
						onTemplateDrop={onTemplateDrop}
						draggedTemplate={draggedTemplate}
					/>
				))}
			</ReactSortable>
		</div>
	);
}

