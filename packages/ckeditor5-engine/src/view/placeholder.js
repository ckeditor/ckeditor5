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

const elements = new WeakSet();

/**
 * Attaches placeholder to provided element and updates it's visibility.
 *
 * @param {module:engine/view/element~Element} element Element to attach placeholder to.
 * @param {String} placeholderText Placeholder text to use.
 * @param {Function} [checkFunction] If provided it will be called before checking if placeholder should be displayed.
 * If function returns `false` placeholder will not be showed.
 */
export default function attachPlaceholder( element, placeholderText, checkFunction ) {
	const document = element.document;

	if ( !document ) {
		/**
		 * Provided element is not placed in any {@link module:engine/view/document~Document}.
		 *
		 * @error view-placeholder-element-is-detached
		 */
		throw new CKEditorError( 'view-placeholder-element-is-detached: Provided element is not placed in document.' );
	}

	element.setAttribute( DATA_ATTRIBUTE, placeholderText );

	// If element was not used already - add listener to it.
	if ( !elements.has( element ) ) {
		listener.listenTo( document, 'render', () => updateCSSClass( element, checkFunction ), { priority: 'high' } );
		elements.add( element );
	}

	// Update right away too.
	updateCSSClass( element, checkFunction );
}

// Updates placeholder class of given element.
//
// @private
function updateCSSClass( element, checkFunction ) {
	// TODO: when element is removedfrom document this should not be executed.
	const document = element.document;
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
	if ( !element.childCount && anchor && anchor.parent !== element ) {
		element.addClass( CSS_CLASS );
	} else {
		element.removeClass( CSS_CLASS );
	}
}
