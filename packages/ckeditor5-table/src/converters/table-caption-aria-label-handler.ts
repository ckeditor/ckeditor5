/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/table-caption-aria-label-handler
 */

import type { Editor } from 'ckeditor5/src/core.js';
import type { DowncastInsertEvent, ModelElement } from 'ckeditor5/src/engine.js';
import { uid } from 'ckeditor5/src/utils.js';

/**
 * Handles `aria-labelledby` attribute on the table element in the editing view to
 * make sure it always points to the caption of the table if there is one.
 *
 * @internal
 */
export function injectTableCaptionAriaLabelHandler( editor: Editor ): void {
	const captionIdsMapping = new WeakMap<ModelElement, string>();

	editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
		dispatcher.on<DowncastInsertEvent<ModelElement>>( 'insert:table', ( evt, data, { writer, mapper } ) => {
			const modelTable = data.item;
			const viewFigure = mapper.toViewElement( modelTable );

			if ( !viewFigure ) {
				return;
			}

			const modelCaption = Array
				.from( modelTable.getChildren() )
				.find( child => child.is( 'element', 'caption' ) ) as ModelElement | undefined;

			// Remove `aria-labelledby` from the table if there is no caption.
			if ( !modelCaption ) {
				writer.removeAttribute( 'aria-labelledby', viewFigure );
				return;
			}

			const viewCaption = mapper.toViewElement( modelCaption );

			if ( !viewCaption ) {
				return;
			}

			// Try reusing the same id for the caption if it was already created for the given model caption.
			// If it was not created before, generate a new one and save it in the mapping to reuse it in the future if needed.
			let captionId: string;

			if ( viewCaption.hasAttribute( 'id' ) ) {
				captionId = viewCaption.getAttribute( 'id' )!;
			} else {
				captionId = captionIdsMapping.get( modelCaption ) ?? `ck-editor__caption_${ uid() }`;
			}

			captionIdsMapping.set( modelCaption, captionId );

			writer.setAttribute( 'id', captionId, viewCaption );
			writer.setAttribute( 'aria-labelledby', captionId, viewFigure );
		}, { priority: 'low' } );
	} );
}
