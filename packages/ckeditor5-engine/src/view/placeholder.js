/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/placeholder
 */

const CSS_CLASS = 'ck-placeholder';
const DATA_ATTRIBUTE = 'data-placeholder';

/**
 * Attaches placeholder to provided element and updates it's visibility.
 *
 * @param {module:engine/view/document~Document} document View document containing given element.
 * @param {module:engine/view/element~Element} element Element to attach placeholder to.
 * @param {String} [placeholderText] Placeholder text, if not provided it will be loaded from placeholder data attribute.
 */
export default function attachPlaceholder( document, element, placeholderText ) {
	element.setAttribute( DATA_ATTRIBUTE, placeholderText );

	// Add/remove placeholder before each rendering.
	document.on( 'render', () => {
		updateCSSClass( document, element );
	}, { priority: 'highest' } );

	// Add checking on focus event separately because for now FocusObserver is not re-rendering view after `focus` event.
	// Re render the view - see https://github.com/ckeditor/ckeditor5-engine/issues/795.
	document.on( 'focus', () => {
		updateCSSClass( document, element );

		document.render();
	} );
}

// Updates placeholder class of given element
//
// @private
function updateCSSClass( document, element ) {
	const viewSelection = document.selection;
	const anchor = viewSelection.anchor;

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
