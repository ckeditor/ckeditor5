/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/emptyblocks
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type {
	UpcastElementEvent,
	Element,
	DowncastDispatcher,
	UpcastDispatcher,
	DowncastAttributeEvent,
	ElementCreatorFunction,
	Node
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
		const { model, conversion } = this.editor;
		const schema = model.schema;

		schema.extend( '$block', {
			allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ]
		} );

		schema.extend( '$container', {
			allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ]
		} );

		// Downcasts.
		conversion.for( 'dataDowncast' ).add( createEmptyBlocksDowncastConverter() );
		conversion.for( 'editingDowncast' ).add( createEmptyBlocksDowncastConverter() );

		// Upcasts.
		conversion.for( 'upcast' ).add( createEmptyBlocksUpcastConverter( this.editor ) );

		// Table related converters.
		if ( schema.isRegistered( 'tableCell' ) ) {
			schema.extend( 'tableCell', {
				allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ]
			} );

			conversion.for( 'dataDowncast' ).elementToElement( {
				model: 'paragraph',
				view: convertEmptyBlockParagraphInTableCell(),
				converterPriority: 'highest'
			} );
		}
	}
}

/**
 * Converts paragraphs in empty table cells during the downcast conversion.
 */
function convertEmptyBlockParagraphInTableCell(): ElementCreatorFunction {
	return ( modelElement, { writer } ) => {
		const parentCell = modelElement.parent;

		if ( !parentCell!.is( 'element', 'tableCell' ) ) {
			return null;
		}

		if ( parentCell.childCount != 1 ||
			!parentCell.hasAttribute( EMPTY_BLOCK_MODEL_ATTRIBUTE ) ||
			hasAnyAttribute( modelElement )
		) {
			return null;
		}

		const viewElement = writer.createContainerElement( 'p' );

		viewElement.getFillerOffset = () => null;
		writer.setCustomProperty( 'dataPipeline:transparentRendering', true, viewElement );

		return viewElement;
	};
}

/**
 * Creates a downcast converter for handling empty blocks.
 * The dispatcher prevents filler elements from being added to elements marked as empty blocks.
 *
 * @returns A function that sets up the downcast conversion dispatcher.
 */
function createEmptyBlocksDowncastConverter() {
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
 * The dispatcher detects empty elements and marks them with the empty block attribute.
 *
 * @param editor The editor instance.
 * @returns A function that sets up the upcast converter.
 */
function createEmptyBlocksUpcastConverter( editor: Editor ) {
	const { schema } = editor.model;

	return ( dispatcher: UpcastDispatcher ) => {
		dispatcher.on<UpcastElementEvent>( 'element', ( evt, data, conversionApi ) => {
			const { viewItem, modelRange } = data;

			if ( !viewItem.is( 'element' ) || !viewItem.isEmpty ) {
				return;
			}

			const modelElement = modelRange && modelRange.start.nodeAfter as Element;

			if ( modelElement && schema.checkAttribute( modelElement, EMPTY_BLOCK_MODEL_ATTRIBUTE ) ) {
				conversionApi.writer.setAttribute( EMPTY_BLOCK_MODEL_ATTRIBUTE, true, modelElement );
			}
		}, { priority: 'lowest' } );
	};
}

/**
 * Checks if an element has any attributes set.
 */
function hasAnyAttribute( element: Node ): boolean {
	const iteratorItem = element.getAttributeKeys().next();

	return !iteratorItem.done;
}
