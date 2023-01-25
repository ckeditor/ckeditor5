/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/utils
 */

import { first } from 'ckeditor5/src/utils';

/**
 * Creates a view element representing the inline image.
 *
 *		<span class="image-inline"><img></img></span>
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createInlineImageViewElement( writer ) {
	return writer.createContainerElement( 'span', { class: 'image-inline' },
		writer.createEmptyElement( 'img' )
	);
}

/**
 * Creates a view element representing the block image.
 *
 *		<figure class="image"><img></img></figure>
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createBlockImageViewElement( writer ) {
	return writer.createContainerElement( 'figure', { class: 'image' }, [
		writer.createEmptyElement( 'img' ),
		writer.createSlot()
	] );
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
	const imageUtils = editor.plugins.get( 'ImageUtils' );
	const areBothImagePluginsLoaded = editor.plugins.has( 'ImageInlineEditing' ) && editor.plugins.has( 'ImageBlockEditing' );

	return element => {
		// Check if the matched view element is an <img>.
		if ( !imageUtils.isInlineImageView( element ) ) {
			return null;
		}

		// If just one of the plugins is loaded (block or inline), it will match all kinds of images.
		if ( !areBothImagePluginsLoaded ) {
			return getPositiveMatchPattern( element );
		}

		// The <img> can be standalone, wrapped in <figure>...</figure> (ImageBlock plugin) or
		// wrapped in <figure><a>...</a></figure> (LinkImage plugin).
		const imageType = element.getStyle( 'display' ) == 'block' || element.findAncestor( imageUtils.isBlockImageView ) ?
			'imageBlock' :
			'imageInline';

		if ( imageType !== matchImageType ) {
			return null;
		}

		return getPositiveMatchPattern( element );
	};

	function getPositiveMatchPattern( element ) {
		const pattern = {
			name: true
		};

		// This will trigger src consumption (See https://github.com/ckeditor/ckeditor5/issues/11530).
		if ( element.hasAttribute( 'src' ) ) {
			pattern.attributes = [ 'src' ];
		}

		return pattern;
	}
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
