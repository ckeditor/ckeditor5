/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/emptyblocks
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { UpcastElementEvent, Element, DowncastDispatcher } from 'ckeditor5/src/engine.js';

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
	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Register the attribute for block and container elements.
		schema.extend( '$block', {
			allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ]
		} );

		schema.extend( '$container', {
			allowAttributes: [ EMPTY_BLOCK_MODEL_ATTRIBUTE ]
		} );

		// Upcast conversion - detect empty elements.
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element', ( evt, data, conversionApi ) => {
				const { viewItem, modelRange } = data;

				if ( !viewItem.is( 'element' ) || !viewItem.isEmpty ) {
					return;
				}

				const modelElement = modelRange && modelRange.start.nodeAfter as Element;

				if ( modelElement && schema.checkAttribute( modelElement, EMPTY_BLOCK_MODEL_ATTRIBUTE ) ) {
					conversionApi.writer.setAttribute( EMPTY_BLOCK_MODEL_ATTRIBUTE, true, modelElement );
				}
			} );
		} );

		// Data downcast conversion - prevent filler in empty elements.
		const downcastDispatcher = ( dispatcher: DowncastDispatcher ) => {
			dispatcher.on( `attribute:${ EMPTY_BLOCK_MODEL_ATTRIBUTE }`, ( evt, data, conversionApi ) => {
				const { item } = data;
				const viewElement = conversionApi.mapper.toViewElement( item as Element );

				if ( viewElement && data.attributeNewValue ) {
					viewElement.getFillerOffset = () => null;
				}
			} );
		};

		editor.conversion.for( 'dataDowncast' ).add( downcastDispatcher );
		editor.conversion.for( 'editingDowncast' ).add( downcastDispatcher );
	}
}
