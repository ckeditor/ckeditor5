/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/image/imagetypecommand
 */

import { type ModelElement } from '@ckeditor/ckeditor5-engine';
import { Command, type Editor } from '@ckeditor/ckeditor5-core';
import { type ImageUtils } from '../imageutils.js';
import { isImageTypePlaceable } from './utils.js';

/**
 * The image type command. It changes the type of a selected image, depending on the configuration.
 */
export class ImageTypeCommand extends Command {
	/**
	 * Model element name the command converts to.
	 */
	private readonly _modelElementName: 'imageBlock' | 'imageInline';

	/**
	 * @inheritDoc
	 *
	 * @param modelElementName Model element name the command converts to.
	 */
	constructor( editor: Editor, modelElementName: 'imageBlock' | 'imageInline' ) {
		super( editor );

		this._modelElementName = modelElementName;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const element = imageUtils.getClosestSelectedImageElement( model.document.selection );

		// The command converts the opposite image type into `_modelElementName`, so a matching source image
		// must be selected.
		const hasSourceImage = this._modelElementName === 'imageBlock' ?
			imageUtils.isInlineImage( element ) :
			imageUtils.isBlockImage( element );

		if ( !hasSourceImage ) {
			this.isEnabled = false;

			return;
		}

		// The target type must also be placeable at the image's position. Otherwise the conversion would call
		// `model.insertContent` with no valid landing spot (e.g. switching to `imageBlock` inside an `$inlineRoot`,
		// or to `imageInline` inside a container that only accepts block images).
		const position = model.createPositionBefore( element! );

		this.isEnabled = isImageTypePlaceable( schema, position, this._modelElementName );
	}

	/**
	 * Executes the command and changes the type of a selected image.
	 *
	 * @fires execute
	 * @param options.setImageSizes Specifies whether the image `width` and `height` attributes should be set automatically.
	 * The default is `true`.
	 * @returns An object containing references to old and new model image elements
	 * (for before and after the change) so external integrations can hook into the decorated
	 * `execute` event and handle this change. `null` if the type change failed.
	 */
	public override execute( options: { setImageSizes?: boolean } = {} ): { oldElement: ModelElement; newElement: ModelElement } | null {
		const editor = this.editor;
		const model = this.editor.model;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const oldElement = imageUtils.getClosestSelectedImageElement( model.document.selection )!;
		const attributes = Object.fromEntries( oldElement.getAttributes() );

		// Don't change image type if "src" is missing (a broken image), unless there's "uploadId" set.
		// This state may happen during image upload (before it finishes) and it should be possible to change type
		// of the image in the meantime.
		if ( !attributes.src && !attributes.uploadId ) {
			return null;
		}

		return model.change( writer => {
			const { setImageSizes = true } = options;

			// Get all markers that contain the old image element.
			const markers = Array.from( model.markers )
				.filter( marker => marker.getRange().containsItem( oldElement ) );

			const newElement = imageUtils.insertImage(
				attributes,
				model.createSelection( oldElement, 'on' ),
				this._modelElementName,
				{ setImageSizes }
			);

			if ( !newElement ) {
				return null;
			}

			const newElementRange = writer.createRangeOn( newElement );

			// Expand the previously intersecting markers' ranges to include the new image element.
			for ( const marker of markers ) {
				const markerRange = marker.getRange();

				// Join the survived part of the old marker range with the new element range
				// (loosely because there could be some new paragraph or the existing one might got split).
				const range = markerRange.root.rootName != '$graveyard' ?
					markerRange.getJoined( newElementRange, true )! : newElementRange;

				writer.updateMarker( marker, { range } );
			}

			return {
				oldElement,
				newElement
			};
		} );
	}
}
