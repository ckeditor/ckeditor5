/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaptioning/utils
 */

import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';

const captionSymbol = Symbol( 'imageCaption' );

/**
 * Returns function that creates caption editable element for given {@link module:engine/view/document~Document}.
 *
 * @param {module:engine/view/document~Document} viewDocument
 * @return {Function}
 */
export function captionEditableCreator( viewDocument ) {
	return () => {
		const editable = new ViewEditableElement( 'figcaption', { contenteditable: true } ) ;
		editable.document = viewDocument;
		editable.setCustomProperty( captionSymbol, true );

		editable.on( 'change:isFocused', ( evt, property, is ) => {
			if ( is ) {
				editable.addClass( 'focused' );
			} else {
				editable.removeClass( 'focused' );
			}
		} );

		return editable;
	};
}

/**
 * Returns `true` if given view element is image's caption editable.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @return {Boolean}
 */
export function isCaptionEditable( viewElement ) {
	return !!viewElement.getCustomProperty( captionSymbol );
}

/**
 * Returns caption's model element from given image element. Returns `null` if no caption is found.
 *
 * @param {module:engine/model/element~Element} imageModelElement
 * @return {module:engine/model/element~Element|null}
 */
export function getCaptionFromImage( imageModelElement ) {
	for ( let node of imageModelElement.getChildren() ) {
		if ( node instanceof ModelElement && node.name == 'caption' ) {
			return node;
		}
	}

	return null;
}
