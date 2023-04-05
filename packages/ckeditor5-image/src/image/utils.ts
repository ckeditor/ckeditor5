/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/utils
 */

import type {
	DocumentSelection,
	MatcherPattern,
	Schema,
	Selection,
	ViewContainerElement,
	DowncastWriter,
	ViewElement
} from 'ckeditor5/src/engine';
import type { Editor } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';

import type ImageUtils from '../imageutils';

/**
 * Creates a view element representing the inline image.
 *
 * ```html
 * <span class="image-inline"><img></img></span>
 * ```
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @internal
 */
export function createInlineImageViewElement( writer: DowncastWriter ): ViewContainerElement {
	return writer.createContainerElement( 'span', { class: 'image-inline' },
		writer.createEmptyElement( 'img' )
	);
}

/**
 * Creates a view element representing the block image.
 *
 * ```html
 * <figure class="image"><img></img></figure>
 * ```
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @internal
 */
export function createBlockImageViewElement( writer: DowncastWriter ): ViewContainerElement {
	return writer.createContainerElement( 'figure', { class: 'image' }, [
		writer.createEmptyElement( 'img' ),
		writer.createSlot( 'children' )
	] );
}

/**
 * A function returning a `MatcherPattern` for a particular type of View images.
 *
 * @internal
 * @param matchImageType The type of created image.
 */
export function getImgViewElementMatcher( editor: Editor, matchImageType: 'imageBlock' | 'imageInline' ): MatcherPattern {
	const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
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

	function getPositiveMatchPattern( element: ViewElement ) {
		const pattern: Record<string, unknown> = {
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
 * @internal
 */
export function determineImageTypeForInsertionAtSelection(
	schema: Schema,
	selection: Selection | DocumentSelection
): 'imageBlock' | 'imageInline' {
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
