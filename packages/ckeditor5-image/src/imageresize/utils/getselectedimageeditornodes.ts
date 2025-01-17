/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module image/imageresize/utils/getselectedimageeditornodes
 */

import type { ViewElement, Element } from 'ckeditor5/src/engine.js';
import type { Editor } from 'ckeditor5/src/core.js';

/**
 * Finds model, view and DOM element for selected image element. Returns `null` if there is no image selected.
 *
 * @param editor Editor instance.
 */
export function getSelectedImageEditorNodes( editor: Editor ): ImageEditorNodes | null {
	const { editing } = editor;

	const imageUtils = editor.plugins.get( 'ImageUtils' );
	const imageModelElement = imageUtils.getClosestSelectedImageElement( editor.model.document.selection );

	if ( !imageModelElement ) {
		return null;
	}

	const imageViewElement = editing.mapper.toViewElement( imageModelElement )!;
	const imageDOMElement = editing.view.domConverter.mapViewToDom( imageViewElement )!;

	return {
		model: imageModelElement,
		view: imageViewElement,
		dom: imageDOMElement
	};
}

/**
 * @internal;
 */
type ImageEditorNodes = {
	model: Element;
	view: ViewElement;
	dom: HTMLElement;
};
