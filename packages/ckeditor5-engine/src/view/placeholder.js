/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/placeholder
 */

import extend from '@ckeditor/ckeditor5-utils/src/lib/lodash/extend';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import '../../theme/placeholder.css';

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
export function attachPlaceholder( view, element, placeholderText, checkFunction ) {
	const document = view.document;

	// Detach placeholder if was used before.
	detachPlaceholder( view, element );

	// Single listener per document.
	if ( !documentPlaceholders.has( document ) ) {
		documentPlaceholders.set( document, new Map() );

		// Attach listener just before rendering and update placeholders.
		listener.listenTo( view.renderer, 'render', () => updateAllPlaceholders( view ), { priority: 'highest' } );
	}

	// Store text in element's data attribute.
	// This data attribute is used in CSS class to show the placeholder.
	view.change( writer => {
		writer.setAttribute( 'data-placeholder', placeholderText, element );
	} );

	// Store information about placeholder.
	documentPlaceholders.get( document ).set( element, checkFunction );

	// Update right away too.
	updateSinglePlaceholder( view, element, checkFunction );
}

/**
 * Removes placeholder functionality from given element.
 *
 * @param {module:engine/view/view~View} view
 * @param {module:engine/view/element~Element} element
 */
export function detachPlaceholder( view, element ) {
	const document = element.document;

	if ( documentPlaceholders.has( document ) ) {
		documentPlaceholders.get( document ).delete( element );
	}

	view.change( writer => {
		writer.removeClass( 'ck-placeholder', element );
		writer.removeAttribute( 'data-placeholder', element );
	} );
}

// Updates all placeholders of given document.
//
// @private
// @param {module:engine/view/view~View} view
function updateAllPlaceholders( view ) {
	const placeholders = documentPlaceholders.get( view.document );

	for ( const [ element, checkFunction ] of placeholders ) {
		updateSinglePlaceholder( view, element, checkFunction );
	}
}

// Updates placeholder class of given element.
//
// @private
// @param {module:engine/view/view~View} view
// @param {module:engine/view/element~Element} element
// @param {Function} checkFunction
function updateSinglePlaceholder( view, element, checkFunction ) {
	const document = element.document;

	// Element was removed from document.
	if ( !document ) {
		return;
	}

	const viewSelection = document.selection;
	const anchor = viewSelection.anchor;

	// If checkFunction is provided and returns false - remove placeholder.
	if ( checkFunction && !checkFunction() ) {
		view.change( writer => {
			writer.removeClass( 'ck-placeholder', element );
		} );

		return;
	}

	// Element is empty for placeholder purposes when it has no children or only ui elements.
	// This check is taken from `view.ContainerElement#getFillerOffset`.
	const isEmptyish = !Array.from( element.getChildren() ).some( element => !element.is( 'uiElement' ) );

	// If element is empty and editor is blurred.
	if ( !document.isFocused && isEmptyish ) {
		view.change( writer => {
			writer.addClass( 'ck-placeholder', element );
		} );

		return;
	}

	// It there are no child elements and selection is not placed inside element.
	if ( isEmptyish && anchor && anchor.parent !== element ) {
		view.change( writer => {
			writer.addClass( 'ck-placeholder', element );
		} );
	} else {
		view.change( writer => {
			writer.removeClass( 'ck-placeholder', element );
		} );
	}
}
