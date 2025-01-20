/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/emptyblocks
 */

import { priorities, type PriorityString } from 'ckeditor5/src/utils.js';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { UpcastElementEvent, Element, DowncastDispatcher, UpcastDispatcher } from 'ckeditor5/src/engine.js';

const EMPTY_BLOCK_MODEL_ATTRIBUTE = 'htmlEmptyBlock';

/**
 * This plugin allows for preserving empty block elements in the editor content instead of
 * automatically filling them with block fillers (`&nbsp;`).
 *
 * This is useful when you want to:
 *
 *	* Preserve empty block elements exactly as they were in the source HTML
 *	* Allow for styling empty blocks with CSS (block fillers can interfere with height/margin)
 *	* Maintain compatibility with external systems that expect empty blocks to remain empty
 *
 * For example, this allows for HTML like:
 *
 * ```html
 * <p></p>
 * <p class="spacer"></p>
 * <td></td>
 * ```
 * to remain empty instead of being converted to:
 *
 * ```html
 * <p>&nbsp;</p>
 * <p class="spacer">&nbsp;</p>
 * <td>&nbsp;</td>
 * ```
 */
export default class EmptyBlocks extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmptyBlocks' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		this._registerDowncastConverters();
		this._registerUpcastConverters();
	}

	/**
	 * Registers downcast converters for empty blocks handling.
	 * Sets up converters for both data and editing pipelines to prevent fillers in empty elements.
	 */
	private _registerDowncastConverters(): void {
		const { editor } = this;

		editor.conversion.for( 'dataDowncast' ).add( createEmptyBlocksDowncastDispatcher() );
		editor.conversion.for( 'editingDowncast' ).add( createEmptyBlocksDowncastDispatcher() );
	}

	/**
	 * Registers upcast converters for empty blocks handling.
	 * Extends schema to allow empty block attributes and sets up conversion for empty elements and table cells.
	 */
	private _registerUpcastConverters(): void {
		const { editor } = this;
		const schema = editor.model.schema;

		schema.extend( '$block', {
			allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ]
		} );

		schema.extend( '$container', {
			allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ]
		} );

		editor.conversion
			.for( 'upcast' )
			.add( createEmptyBlocksUpcastDispatcher( editor, 'element', 'lowest' ) );

		if ( schema.isRegistered( 'tableCell' ) ) {
			schema.extend( 'tableCell', {
				allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ]
			} );

			editor.conversion
				.for( 'upcast' )
				.add( createEmptyBlocksUpcastDispatcher( editor, 'element:td', priorities.low + 1 ) )
				.add( createEmptyBlocksUpcastDispatcher( editor, 'element:th', priorities.low + 1 ) );
		}
	}
}

/**
 * Creates a downcast dispatcher for handling empty blocks.
 * The dispatcher prevents filler elements from being added to elements marked as empty blocks.
 *
 * @returns A function that sets up the downcast conversion dispatcher.
 */
function createEmptyBlocksDowncastDispatcher() {
	return ( dispatcher: DowncastDispatcher ) => {
		dispatcher.on( `attribute:${ EMPTY_BLOCK_MODEL_ATTRIBUTE }`, ( evt, data, conversionApi ) => {
			const { mapper, consumable } = conversionApi;
			const { item } = data;

			if ( !consumable.consume( item, evt.name ) ) {
				return;
			}

			const viewElement = mapper.toViewElement( item as Element );

			if ( viewElement && data.attributeNewValue ) {
				viewElement.getFillerOffset = () => null;
			}
		} );
	};
}

/**
 * Creates an upcast dispatcher for handling empty blocks.
 * The dispatcher detects empty elements and marks them with the empty block attribute.
 *
 * @param editor - The editor instance.
 * @param eventName - The event name to listen to during upcast conversion.
 * @param priority - The priority of the conversion callback.
 * @returns A function that sets up the upcast conversion dispatcher.
 */
function createEmptyBlocksUpcastDispatcher(
	editor: Editor,
	eventName: 'element' | `element:${ string }`,
	priority: PriorityString
) {
	const { schema } = editor.model;

	return ( dispatcher: UpcastDispatcher ) => {
		dispatcher.on<UpcastElementEvent>( eventName, ( evt, data, conversionApi ) => {
			const { viewItem, modelRange } = data;

			if ( !viewItem.is( 'element' ) || !viewItem.isEmpty ) {
				return;
			}

			const modelElement = modelRange && modelRange.start.nodeAfter as Element;

			if ( modelElement && schema.checkAttribute( modelElement, EMPTY_BLOCK_MODEL_ATTRIBUTE ) && viewItem.isEmpty ) {
				conversionApi.writer.setAttribute( EMPTY_BLOCK_MODEL_ATTRIBUTE, true, modelElement );
			}
		}, { priority } );
	};
}
