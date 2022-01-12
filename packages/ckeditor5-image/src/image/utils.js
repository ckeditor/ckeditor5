/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/utils
 */

import { first } from 'ckeditor5/src/utils';

/**
 * Creates a view element representing the image of provided image type.
 *
 * An 'imageBlock' type (block image):
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
 * @param {'imageBlock'|'imageInline'} imageType The type of created image.
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createImageViewElement( writer, imageType ) {
	const emptyElement = writer.createEmptyElement( 'img' );

	const container = imageType === 'imageBlock' ?
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
 * @param {'imageBlock'|'imageInline'} matchImageType The type of created image.
 * @returns {module:engine/view/matcher~MatcherPattern}
 */
export function getImgViewElementMatcher( editor, matchImageType ) {
	if ( editor.plugins.has( 'ImageInlineEditing' ) !== editor.plugins.has( 'ImageBlockEditing' ) ) {
		return { name: 'img' };
	}

	const imageUtils = editor.plugins.get( 'ImageUtils' );

	return element => {
		// Check if view element is an `img`.
		if ( !imageUtils.isInlineImageView( element ) ) {
			return null;
		}

		// The <img> can be standalone, wrapped in <figure>...</figure> (ImageBlock plugin) or
		// wrapped in <figure><a>...</a></figure> (LinkImage plugin).
		const imageType = element.findAncestor( imageUtils.isBlockImageView ) ? 'imageBlock' : 'imageInline';

		if ( imageType !== matchImageType ) {
			return null;
		}

		return { name: true };
	};
}

/**
 * Considering the current model selection, it returns the name of the model image element
 * (`'imageBlock'` or `'imageInline'`) that will make most sense from the UX perspective if a new
 * image was inserted (also: uploaded, dropped, pasted) at that selection.
 *
 * The assumption is that inserting images into empty blocks or on other block widgets should
 * produce block images. Inline images should be inserted in other cases, e.g. in paragraphs
 * that already contain some text.
 *
 * @protected
 * @param {module:engine/model/schema~Schema} schema
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * @returns {'imageBlock'|'imageInline'}
 */
export function determineImageTypeForInsertionAtSelection( schema, selection ) {
	const firstBlock = first( selection.getSelectedBlocks() );

	// Insert a block image if the selection is not in/on block elements or it's on a block widget.
	if ( !firstBlock || schema.isObject( firstBlock ) ) {
		return 'imageBlock';
	}

	// A block image should also be inserted into an empty block element
	// (that is not an empty list item so the list won't get split).
	if ( firstBlock.isEmpty && firstBlock.name != 'listItem' ) {
		return 'imageBlock';
	}

	// Otherwise insert an inline image.
	return 'imageInline';
}
