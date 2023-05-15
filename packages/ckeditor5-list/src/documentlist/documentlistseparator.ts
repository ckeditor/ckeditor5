/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistutils
 */
import type { GetCallback } from 'ckeditor5/src/utils';
import { Plugin } from 'ckeditor5/src/core';

import type {	UpcastElementEvent, ViewElement } from 'ckeditor5/src/engine';

export default class DocumentListSeparator extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'DocumentListSeparator' {
		return 'DocumentListSeparator';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;

		model.schema.register( 'listSeparator', {
			allowWhere: '$block'
		} );

		editor.conversion.for( 'upcast' )
			.add( dispatcher => {
				// dispatcher.on<UpcastElementEvent>( 'element:li', liHandler() );
				dispatcher.on<UpcastElementEvent>( 'element:ol', handler() );
				dispatcher.on<UpcastElementEvent>( 'element:ul', handler() );
			} )
			.elementToElement( {
				model: 'listSeparator',
				view: 'ck-list-separator'
			} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'listSeparator',
			view: {
				name: 'div',
				classes: [ 'ck-list-separator', 'ck-hidden' ]
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'listSeparator',
			view: ( modelElement, conversionApi ) => {
				const viewElement = conversionApi.writer.createEmptyElement( 'ck-list-separator' );

				conversionApi.writer.setCustomProperty( 'dataPipeline:transparentRendering', true, viewElement );

				return viewElement;
			}
		} );
	}
}

function handler(): GetCallback<UpcastElementEvent> {
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

			if ( !data.modelRange ) {
				return;
			}
		}

		const writer = conversionApi.writer;
		const modelElement = writer.createElement( 'listSeparator' );

		if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
			return;
		}

		const parts = conversionApi.getSplitParts( modelElement );

		data.modelRange = data.modelRange.getJoined( writer.createRange(
			writer.createPositionBefore( modelElement ),
			writer.createPositionAfter( parts[ parts.length - 1 ] )
		) );

		conversionApi.updateConversionResult( modelElement, data );
	};
}

function liHandler(): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const element: ViewElement = data.viewItem;

		if ( element.previousSibling ) {
			return;
		}

		const parent = element.parent as ViewElement | null;
		const siblingParent = parent!.previousSibling as ViewElement | null;

		if ( !siblingParent ) {
			return;
		}

		if ( parent!.name !== siblingParent.name ) {
			return;
		}

		const writer = conversionApi.writer;
		const modelElement = writer.createElement( 'paragraph' );
		writer.insertText( 'XXX', modelElement );
		const position = writer.createPositionAt( data.modelCursor, 'before' );

		if ( !conversionApi.safeInsert( modelElement, position ) ) {
			return;
		}

		conversionApi.updateConversionResult( modelElement, data );
	};
}
