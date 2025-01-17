/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/list/adjacentlistssupport
 */

import type { GetCallback } from 'ckeditor5/src/utils.js';
import { Plugin } from 'ckeditor5/src/core.js';

import type { UpcastElementEvent, ViewElement } from 'ckeditor5/src/engine.js';

export default class AdjacentListsSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'AdjacentListsSupport' as const;
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
		const model = editor.model;

		model.schema.register( 'listSeparator', {
			allowWhere: '$block',
			isBlock: true
		} );

		editor.conversion.for( 'upcast' )
			// Add a list separator element between similar list elements on upcast.
			.add( dispatcher => {
				dispatcher.on<UpcastElementEvent>( 'element:ol', listSeparatorUpcastConverter() );
				dispatcher.on<UpcastElementEvent>( 'element:ul', listSeparatorUpcastConverter() );
			} )
			// View-to-model transformation.
			.elementToElement( {
				model: 'listSeparator',
				view: 'ck-list-separator'
			} );

		// The list separator element should exist in the view, but should be invisible (hidden).
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'listSeparator',
			view: {
				name: 'div',
				classes: [ 'ck-list-separator', 'ck-hidden' ]
			}
		} );

		// The list separator element should not exist in the output data.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'listSeparator',
			view: ( modelElement, conversionApi ) => {
				const viewElement = conversionApi.writer.createContainerElement( 'ck-list-separator' );

				conversionApi.writer.setCustomProperty( 'dataPipeline:transparentRendering', true, viewElement );

				viewElement.getFillerOffset = () => null;

				return viewElement;
			}
		} );
	}
}

/**
 * Inserts a list separator element between two lists of the same type (`ol` + `ol` or `ul` + `ul`).
 */
function listSeparatorUpcastConverter(): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const element: ViewElement = data.viewItem;
		const nextSibling = element.nextSibling as ViewElement | null;

		if ( !nextSibling ) {
			return;
		}

		if ( element.name !== nextSibling.name ) {
			return;
		}

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		const writer = conversionApi.writer;
		const modelElement = writer.createElement( 'listSeparator' );

		// Try to insert a list separator element on the current model cursor position.
		if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
			return;
		}

		const parts = conversionApi.getSplitParts( modelElement );

		// Extend the model range with the range of the created list separator element.
		data.modelRange = writer.createRange(
			data.modelRange!.start,
			writer.createPositionAfter( parts[ parts.length - 1 ] )
		);

		conversionApi.updateConversionResult( modelElement, data );
	};
}
