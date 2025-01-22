/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/emptyblock
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type {
	UpcastElementEvent,
	Element,
	Schema,
	DowncastDispatcher,
	UpcastDispatcher,
	DowncastAttributeEvent
} from 'ckeditor5/src/engine.js';

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
export default class EmptyBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'EmptyBlock' as const;
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
		const { model, conversion } = this.editor;
		const schema = model.schema;

		schema.extend( '$block', { allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ] } );
		schema.extend( '$container', { allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ] } );

		if ( schema.isRegistered( 'tableCell' ) ) {
			schema.extend( 'tableCell', { allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ] } );
		}

		conversion.for( 'downcast' ).add( createEmptyBlockDowncastConverter() );
		conversion.for( 'upcast' ).add( createEmptyBlockUpcastConverter( schema ) );
	}
}

/**
 * Creates a downcast converter for handling empty blocks.
 * This converter prevents filler elements from being added to elements marked as empty blocks.
 */
function createEmptyBlockDowncastConverter() {
	return ( dispatcher: DowncastDispatcher ) => {
		dispatcher.on<DowncastAttributeEvent<Element>>( `attribute:${ EMPTY_BLOCK_MODEL_ATTRIBUTE }`, ( evt, data, conversionApi ) => {
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
 * Creates an upcast converter for handling empty blocks.
 * The converter detects empty elements and marks them with the empty block attribute.
 */
function createEmptyBlockUpcastConverter( schema: Schema ) {
	return ( dispatcher: UpcastDispatcher ) => {
		dispatcher.on<UpcastElementEvent>( 'element', ( evt, data, conversionApi ) => {
			const { viewItem, modelRange } = data;

			if ( !viewItem.is( 'element' ) || !viewItem.isEmpty || viewItem.getCustomProperty( '$hasBlockFiller' ) ) {
				return;
			}

			// Handle element itself.
			const modelElement = modelRange && modelRange.start.nodeAfter as Element;

			if ( !modelElement || !schema.checkAttribute( modelElement, EMPTY_BLOCK_MODEL_ATTRIBUTE ) ) {
				return;
			}

			conversionApi.writer.setAttribute( EMPTY_BLOCK_MODEL_ATTRIBUTE, true, modelElement );

			// Handle an auto-paragraphed bogus paragraph inside empty element.
			if ( modelElement.childCount != 1 ) {
				return;
			}

			const firstModelChild = modelElement.getChild( 0 )!;

			if (
				firstModelChild.is( 'element', 'paragraph' ) &&
				schema.checkAttribute( firstModelChild, EMPTY_BLOCK_MODEL_ATTRIBUTE )
			) {
				conversionApi.writer.setAttribute( EMPTY_BLOCK_MODEL_ATTRIBUTE, true, firstModelChild );
			}
		}, { priority: 'lowest' } );
	};
}
