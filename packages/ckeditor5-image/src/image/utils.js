/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/utils
 */

import { first } from 'ckeditor5/src/utils';

/**
 * Creates a view element representing the image of provided image type.
 *
 * An 'image' type (block image):
 *
 *		<figure class="image"><img></img></figure>
 *
 * An 'imageInline' type (inline image):
 *
 *		<span class="image-inline"><img></img></span>
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {'image'|'imageInline'} imageType The type of created image.
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createImageViewElement( writer, imageType ) {
	const emptyElement = writer.createEmptyElement( 'img' );

	const container = imageType === 'image' ?
		writer.createContainerElement( 'figure', { class: 'image' } ) :
		writer.createContainerElement( 'span', { class: 'image-inline' }, { isAllowedInsideAttributeElement: true } );

	writer.insert( writer.createPositionAt( container, 0 ), emptyElement );

	return container;
}

/**
 * A function returning a `MatcherPattern` for a particular type of View images.
 *
 * @protected
 * @param {module:core/editor/editor~Editor} editor
 * @param {'image'|'imageInline'} matchImageType The type of created image.
 * @returns {module:engine/view/matcher~MatcherPattern}
 */
export function getImageTypeMatcher( editor, matchImageType ) {
	if ( editor.plugins.has( 'ImageInlineEditing' ) !== editor.plugins.has( 'ImageBlockEditing' ) ) {
		return {
			name: 'img',
			attributes: {
				src: true
			}
		};
	}

	const imageUtils = editor.plugins.get( 'ImageUtils' );

	return element => {
		// Convert only images with src attribute.
		if ( !imageUtils.isInlineImageView( element ) || !element.hasAttribute( 'src' ) ) {
			return null;
		}

		// The <img> can be standalone, wrapped in <figure>...</figure> (ImageBlock plugin) or
		// wrapped in <figure><a>...</a></figure> (LinkImage plugin).
		const imageType = element.findAncestor( imageUtils.isBlockImageView ) ? 'image' : 'imageInline';

		if ( imageType !== matchImageType ) {
			return null;
		}

		return { name: true, attributes: [ 'src' ] };
	};
}

/**
 * Considering the current model selection, it returns the name of the model image element
 * (`'image'` or `'imageInline'`) that will make most sense from the UX perspective if a new
 * image was inserted (also: uploaded, dropped, pasted) at that selection.
 *
 * The assumption is that inserting images into empty blocks or on other block widgets should
 * produce block images. Inline images should be inserted in other cases, e.g. in paragraphs
 * that already contain some text.
 *
 * @protected
 * @param {module:engine/model/schema~Schema} schema
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * @returns {'image'|'imageInline'}
 */
export function determineImageTypeForInsertionAtSelection( schema, selection ) {
	const firstBlock = first( selection.getSelectedBlocks() );

	// Insert a block image if the selection is not in/on block elements or it's on a block widget.
	if ( !firstBlock || schema.isObject( firstBlock ) ) {
		return 'image';
	}

	// A block image should also be inserted into an empty block element
	// (that is not an empty list item so the list won't get split).
	if ( firstBlock.isEmpty && firstBlock.name != 'listItem' ) {
		return 'image';
	}

	// Otherwise insert an inline image.
	return 'imageInline';
}
