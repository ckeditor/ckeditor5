/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/placeholder
 */

import extend from '@ckeditor/ckeditor5-utils/src/lib/lodash/extend';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import '../../theme/placeholder.scss';

const listener = {};
extend( listener, EmitterMixin );

// Each document stores information about its placeholder elements and check functions.
const documentPlaceholders = new WeakMap();

/**
 * Attaches placeholder to provided element and updates it's visibility. To change placeholder simply call this method
 * once again with new parameters.
 *
 * @param {module:engine/view/element~Element} element Element to attach placeholder to.
 * @param {String} placeholderText Placeholder text to use.
 * @param {Function} [checkFunction] If provided it will be called before checking if placeholder should be displayed.
 * If function returns `false` placeholder will not be showed.
 */
export function attachPlaceholder( element, placeholderText, checkFunction ) {
	const document = element.document;

	if ( !document ) {
		/**
		 * Provided element is not placed in any {@link module:engine/view/document~Document}.
		 *
		 * @error view-placeholder-element-is-detached
		 */
		throw new CKEditorError( 'view-placeholder-element-is-detached: Provided element is not placed in document.' );
	}

	// Detach placeholder if was used before.
	detachPlaceholder( element );

	// Single listener per document.
	if ( !documentPlaceholders.has( document ) ) {
		documentPlaceholders.set( document, new Map() );
		listener.listenTo( document, 'render', () => updateAllPlaceholders( document ), { priority: 'high' } );
	}

	// Store text in element's data attribute.
	// This data attribute is used in CSS class to show the placeholder.
	element.setAttribute( 'data-placeholder', placeholderText );

	// Store information about placeholder.
	documentPlaceholders.get( document ).set( element, checkFunction );

	// Update right away too.
	updateSinglePlaceholder( element, checkFunction );
}

/**
 * Removes placeholder functionality from given element.
 *
 * @param {module:engine/view/element~Element} element
 */
export function detachPlaceholder( element ) {
	const document = element.document;

	element.removeClass( 'ck-placeholder' );
	element.removeAttribute( 'data-placeholder' );

	if ( documentPlaceholders.has( document ) ) {
		documentPlaceholders.get( document ).delete( element );
	}
}

// Updates all placeholders of given document.
//
// @private
// @param {module:engine/view/document~Document} document
function updateAllPlaceholders( document ) {
	const placeholders = documentPlaceholders.get( document );

	for ( const [ element, checkFunction ] of placeholders ) {
		updateSinglePlaceholder( element, checkFunction );
	}
}

// Updates placeholder class of given element.
//
// @private
// @param {module:engine/view/element~Element} element
// @param {Function} checkFunction
function updateSinglePlaceholder( element, checkFunction ) {
	const document = element.document;

	// Element was removed from document.
	if ( !document ) {
		return;
	}

	const viewSelection = document.selection;
	const anchor = viewSelection.anchor;

	// If checkFunction is provided and returns false - remove placeholder.
	if ( checkFunction && !checkFunction() ) {
		element.removeClass( 'ck-placeholder' );

		return;
	}

	// Element is empty for placeholder purposes when it has no children or only ui elements.
	// This check is taken from `view.ContainerElement#getFillerOffset`.
	const isEmptyish = !Array.from( element.getChildren() ).some( element => !element.is( 'uiElement' ) );

	// If element is empty and editor is blurred.
	if ( !document.isFocused && isEmptyish ) {
		element.addClass( 'ck-placeholder' );

		return;
	}

	// It there are no child elements and selection is not placed inside element.
	if ( isEmptyish && anchor && anchor.parent !== element ) {
		element.addClass( 'ck-placeholder' );
	} else {
		element.removeClass( 'ck-placeholder' );
	}
}
