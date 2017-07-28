/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaption/utils
 */

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import { attachPlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

const captionSymbol = Symbol( 'imageCaption' );

/**
 * Returns a function that creates a caption editable element for the given {@link module:engine/view/document~Document}.
 *
 * @param {module:engine/view/document~Document} viewDocument
 * @param {String} placeholderText The text to be displayed when the caption is empty.
 * @return {Function}
 */
export function captionElementCreator( viewDocument, placeholderText ) {
	return () => {
		const editable = new ViewEditableElement( 'figcaption' );
		editable.document = viewDocument;
		editable.setCustomProperty( captionSymbol, true );
		attachPlaceholder( editable, placeholderText );

		return toWidgetEditable( editable );
	};
}

/**
 * Returns `true` if a given view element is the image caption editable.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @return {Boolean}
 */
export function isCaption( viewElement ) {
	return !!viewElement.getCustomProperty( captionSymbol );
}

/**
 * Returns the caption model element from a given image element. Returns `null` if no caption is found.
 *
 * @param {module:engine/model/element~Element} imageModelElement
 * @return {module:engine/model/element~Element|null}
 */
export function getCaptionFromImage( imageModelElement ) {
	for ( const node of imageModelElement.getChildren() ) {
		if ( node instanceof ModelElement && node.name == 'caption' ) {
			return node;
		}
	}

	return null;
}

/**
 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a `<figcaption>` element that is placed
 * inside the image `<figure>` element.
 *
 * @param {module:engine/view/element~Element} element
 * @returns {Object|null} Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
 * cannot be matched.
 */
export function matchImageCaption( element ) {
	const parent = element.parent;

	// Convert only captions for images.
	if ( element.name == 'figcaption' && parent && parent.name == 'figure' && parent.hasClass( 'image' ) ) {
		return { name: true };
	}

	return null;
}
