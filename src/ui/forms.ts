import { Player } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { typeIdToDataId, typeIdToID } from './typeIds';

// Set to false if you don’t want to include inventory items in UI rendering
const inventory_enabled = true;

type CustomContentEntry = {
	type: 'item' | 'block';
	texture: string;
};

const custom_content: Record<string, CustomContentEntry> = {
	'tm:admin_console': {
		texture: 'textures/items/admin_console',
		type: 'item'
	}
};

const number_of_custom_items = Object
	.values(custom_content)
	.filter((v) => v.type === 'item').length;

const custom_content_keys = new Set(Object.keys(custom_content));

const sizes: Map<string, [string, number]> = new Map([
	['single', ['§c§h§e§s§t§2§7§r', 27]],
	['small', ['§c§h§e§s§t§2§7§r', 27]],
	['double', ['§c§h§e§s§t§5§4§r', 54]],
	['large', ['§c§h§e§s§t§5§4§r', 54]],
	['1', ['§c§h§e§s§t§0§1§r', 1]],
	['5', ['§c§h§e§s§t§0§5§r', 5]],
	['9', ['§c§h§e§s§t§0§9§r', 9]],
	['18', ['§c§h§e§s§t§1§8§r', 18]],
	['27', ['§c§h§e§s§t§2§7§r', 27]],
	['36', ['§c§h§e§s§t§3§6§r', 36]],
	['45', ['§c§h§e§s§t§4§5§r', 45]],
	['54', ['§c§h§e§s§t§5§4§r', 54]]
]);


export class ChestFormData {
	private titleText: { rawtext: { text: string }[] };
	private buttonArray: [any, string | number | undefined][];
	public readonly slotCount: number;

	constructor(size: string | number = 'small') {
		const sizing = sizes.get(String(size)) ?? ['§c§h§e§s§t§2§7§r', 27];
		this.titleText = { rawtext: [{ text: sizing[0] }] };
		this.buttonArray = Array(sizing[1]).fill(['', undefined]);
		this.slotCount = sizing[1];
	}

	public title(text: string | { rawtext: { text: string }[] } | { text: string }): this {
		if (typeof text === 'string') {
			this.titleText.rawtext.push({ text: text });
		} else if ('rawtext' in text) {
			this.titleText.rawtext.push(...text.rawtext);
		} else {
			this.titleText.rawtext.push(text);
		}
		return this;
	}

	public button(
		slot: number,
		itemName: string | { rawtext: { text: string }[] },
		itemDesc: string[] | undefined,
		texture: string,
		stackSize = 1,
		durability = 0,
		enchanted = false
	): this {
		const targetTexture = custom_content_keys.has(texture)
			? custom_content[texture]?.texture
			: texture;

		const ID = typeIdToDataId.get(targetTexture) ?? typeIdToID.get(targetTexture);

		const buttonRawtext = {
			rawtext: [
				{ text: `stack#${String(Math.min(Math.max(stackSize, 1), 99)).padStart(2, '0')}dur#${String(Math.min(Math.max(durability, 0), 99)).padStart(2, '0')}§r` }
			]
		};

		if (typeof itemName === 'string') {
			buttonRawtext.rawtext.push({ text: itemName ? `${itemName}§r` : '§r' });
		} else if ('rawtext' in itemName) {
			buttonRawtext.rawtext.push(...itemName.rawtext, { text: '§r' });
		} else {
			return this;
		}

		if (Array.isArray(itemDesc) && itemDesc.length > 0) {
			for (const obj of itemDesc) {
				if (typeof obj === 'string') {
					buttonRawtext.rawtext.push({ text: `\n${obj}` });
				}
			}
		}

		this.buttonArray.splice(
			Math.max(0, Math.min(slot, this.slotCount - 1)),
			1,
			[
				buttonRawtext,
				ID === undefined
					? targetTexture
					: ((ID + (ID < 256 ? 0 : number_of_custom_items)) * 65536) + (enchanted ? 32768 : 0)
			]
		);

		return this;
	}

	public show(player: Player) {
		const form = new ActionFormData().title(this.titleText);

		this.buttonArray.forEach(button => {
			form.button(button[0], button[1]?.toString());
		});

		// If inventory-based buttons are disabled, just show the form
		if (!inventory_enabled) return form.show(player);

		const container = player.getComponent('inventory')?.container;
		if (!container) return form.show(player);

		for (let i = 0; i < container.size; i++) {
			const item = container.getItem(i);
			if (!item) continue;

			const typeId = item.typeId;
			const targetTexture = custom_content_keys.has(typeId)
				? custom_content[typeId]?.texture
				: typeId;

			const ID = typeIdToDataId.get(targetTexture) ?? typeIdToID.get(targetTexture);
			const durability = item.getComponent('durability');
			const durDamage = durability
				? Math.round((durability.maxDurability - durability.damage) / durability.maxDurability * 99)
				: 0;
			const amount = item.amount;

			const formattedItemName = typeId
				.replace(/.*(?<=:)/, '')
				.replace(/_/g, ' ')
				.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

			let buttonRawtext = {
				rawtext: [
					{
						text: `stack#${String(amount).padStart(2, '0')}dur#${String(durDamage).padStart(2, '0')}§r${formattedItemName}`
					}
				]
			};

			const loreText = item.getLore().join('\n');
			if (loreText) {
				buttonRawtext.rawtext.push({ text: loreText });
			}

			const finalID =
				ID === undefined
					? targetTexture
					: ((ID + (ID < 256 ? 0 : number_of_custom_items)) * 65536);

			form.button(buttonRawtext, finalID.toString());
		}

		return form.show(player);
	}
}
