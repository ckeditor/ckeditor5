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

const CSS_CLASS = 'ck-placeholder';
const DATA_ATTRIBUTE = 'data-placeholder';

const listener = {};
extend( listener, EmitterMixin );

// Each document stores information about its placeholder elements and check functions.
const documentPlaceholders = new Map();

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
	// Detach placeholder if was used before.
	detachPlaceholder( element );

	const document = element.document;

	if ( !document ) {
		/**
		 * Provided element is not placed in any {@link module:engine/view/document~Document}.
		 *
		 * @error view-placeholder-element-is-detached
		 */
		throw new CKEditorError( 'view-placeholder-element-is-detached: Provided element is not placed in document.' );
	}

	// Single listener per document.
	if ( !documentPlaceholders.has( document ) ) {
		documentPlaceholders.set( document, new Map() );
		listener.listenTo( document, 'render', () => updateAllPlaceholders( document ), { priority: 'high' } );
	}

	// Store text in element's data attribute.
	// This data attribute is used in CSS class to show the placeholder.
	element.setAttribute( DATA_ATTRIBUTE, placeholderText );

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
	element.removeClass( CSS_CLASS );
	element.removeAttribute( DATA_ATTRIBUTE );

	for ( let placeholders of documentPlaceholders.values() ) {
		placeholders.delete( element );
	}
}

// Updates all placeholders of given document.
//
// @private
// @param {module:engine/view/document~Document} document
function updateAllPlaceholders( document ) {
	const placeholders = documentPlaceholders.get( document );

	for ( let [ element, checkFunction ] of placeholders ) {
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
		element.removeClass( CSS_CLASS );

		return;
	}

	// If element is empty and editor is blurred.
	if ( !document.isFocused && !element.childCount ) {
		element.addClass( CSS_CLASS );

		return;
	}

	// It there are no child elements and selection is not placed inside element.
	// TODO: check if selection is not deeper inside.
	if ( !element.childCount && anchor && anchor.parent !== element ) {
		element.addClass( CSS_CLASS );
	} else {
		element.removeClass( CSS_CLASS );
	}
}
