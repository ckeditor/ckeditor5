/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/placeholder
 */

import '../../theme/placeholder.css';

// Each document stores information about its placeholder elements and check functions.
const documentPlaceholders = new WeakMap();

/**
 * A helper that enables a placeholder on the provided view element (also updates its visibility).
 * The placeholder is a CSS pseudo–element (with a text content) attached to the element.
 *
 * To change the placeholder text, simply call this method again with new options.
 *
 * To disable the placeholder, use {@link module:engine/view/placeholder~disablePlaceholder `disablePlaceholder()`} helper.
 *
 * @param {Object} [options] Configuration options of the placeholder.
 * @param {module:engine/view/view~View} options.view Editing view instance.
 * @param {module:engine/view/element~Element} options.element Element that will gain a placeholder.
 * See `options.isDirectHost` to learn more.
 * @param {String} options.text Placeholder text.
 * @param {Boolean} [options.isDirectHost=true] If set `false`, the placeholder will not be enabled directly
 * in the passed `element` but in one of its children (selected automatically, i.e. a first empty child element).
 * Useful when attaching placeholders to elements that can host other elements (not just text), for instance,
 * editable root elements.
 */
export function enablePlaceholder( options ) {
	const { view, element, text, isDirectHost = true } = options;
	const doc = view.document;

	// Use a single a single post fixer per—document to update all placeholders.
	if ( !documentPlaceholders.has( doc ) ) {
		documentPlaceholders.set( doc, new Map() );

		// If a post-fixer callback makes a change, it should return `true` so other post–fixers
		// can re–evaluate the document again.
		doc.registerPostFixer( writer => updateDocumentPlaceholders( doc, writer ) );
	}

	// Store information about the element placeholder under its document.
	documentPlaceholders.get( doc ).set( element, {
		text,
		isDirectHost
	} );

	// Update the placeholders right away.
	view.change( writer => updateDocumentPlaceholders( doc, writer ) );
}

/**
 * Disables the placeholder functionality from a given element.
 *
 * See {@link module:engine/view/placeholder~enablePlaceholder `enablePlaceholder()`} to learn more.
 *
 * @param {module:engine/view/view~View} view
 * @param {module:engine/view/element~Element} element
 */
export function disablePlaceholder( view, element ) {
	const doc = element.document;

	view.change( writer => {
		if ( !documentPlaceholders.has( doc ) ) {
			return;
		}

		const placeholders = documentPlaceholders.get( doc );
		const config = placeholders.get( element );

		writer.removeAttribute( 'data-placeholder', config.hostElement );
		hidePlaceholder( writer, config.hostElement );

		placeholders.delete( element );
	} );
}

/**
 * Shows a placeholder in the provided element by changing related attributes and CSS classes.
 *
 * **Note**: This helper will not update the placeholder visibility nor manage the
 * it in any way in the future. What it does is a one–time state change of an element. Use
 * {@link module:engine/view/placeholder~enablePlaceholder `enablePlaceholder()`} and
 * {@link module:engine/view/placeholder~disablePlaceholder `disablePlaceholder()`} for full
 * placeholder functionality.
 *
 * **Note**: This helper will blindly show the placeholder directly in the root editable element if
 * one is passed, which could result in a visual clash if the editable element has some children
 * (for instance, an empty paragraph). Use {@link module:engine/view/placeholder~enablePlaceholder `enablePlaceholder()`}
 * in that case or make sure the correct element is passed to the helper.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {module:engine/view/element~Element} element
 * @returns {Boolean} `true`, if any changes were made to the `element`.
 */
export function showPlaceholder( writer, element ) {
	if ( !element.hasClass( 'ck-placeholder' ) ) {
		writer.addClass( 'ck-placeholder', element );

		return true;
	}

	return false;
}

/**
 * Hides a placeholder in the element by changing related attributes and CSS classes.
 *
 * **Note**: This helper will not update the placeholder visibility nor manage the
 * it in any way in the future. What it does is a one–time state change of an element. Use
 * {@link module:engine/view/placeholder~enablePlaceholder `enablePlaceholder()`} and
 * {@link module:engine/view/placeholder~disablePlaceholder `disablePlaceholder()`} for full
 * placeholder functionality.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {module:engine/view/element~Element} element
 * @returns {Boolean} `true`, if any changes were made to the `element`.
 */
export function hidePlaceholder( writer, element ) {
	if ( element.hasClass( 'ck-placeholder' ) ) {
		writer.removeClass( 'ck-placeholder', element );

		return true;
	}

	return false;
}

/**
 * Checks if a placeholder should be displayed in the element.
 *
 * **Note**: This helper will blindly check the possibility of showing a placeholder directly in the
 * root editable element if one is passed, which may not be the expected result. If an element can
 * host other elements (not just text), most likely one of its children should be checked instead
 * because it will be the final host for the placeholder. Use
 * {@link module:engine/view/placeholder~enablePlaceholder `enablePlaceholder()`} in that case or make
 * sure the correct element is passed to the helper.
 *
 * @param {module:engine/view/element~Element} element
 * @returns {Boolean}
 */
export function needsPlaceholder( element ) {
	if ( !element.isAttached() ) {
		return false;
	}

	// The element is empty only as long as it contains nothing but uiElements.
	const isEmptyish = !Array.from( element.getChildren() )
		.some( element => !element.is( 'uiElement' ) );

	const doc = element.document;

	// If the element is empty and the document is blurred.
	if ( !doc.isFocused && isEmptyish ) {
		return true;
	}

	const viewSelection = doc.selection;
	const selectionAnchor = viewSelection.anchor;

	// If document is focused and the element is empty but the selection is not anchored inside it.
	if ( isEmptyish && selectionAnchor && selectionAnchor.parent !== element ) {
		return true;
	}

	return false;
}

// Updates all placeholders associated with a document in a post–fixer callback.
//
// @private
// @param { module:engine/view/document~Document} doc
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @returns {Boolean} True if any changes were made to the view document.
function updateDocumentPlaceholders( doc, writer ) {
	const placeholders = documentPlaceholders.get( doc );
	let wasViewModified = false;

	for ( const [ element, config ] of placeholders ) {
		if ( updatePlaceholder( writer, element, config ) ) {
			wasViewModified = true;
		}
	}

	return wasViewModified;
}

// Updates a single placeholder in a post–fixer callback.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {module:engine/view/element~Element} element
// @param {Object} config Configuration of the placeholder
// @param {String} config.text
// @param {Boolean} config.isDirectHost
// @returns {Boolean} True if any changes were made to the view document.
function updatePlaceholder( writer, element, config ) {
	const { text, isDirectHost } = config;

	const hostElement = isDirectHost ? element : getChildPlaceholderHostSubstitute( element );
	let wasViewModified = false;

	// When not a direct host, it could happen that there is no child element
	// capable of displaying a placeholder.
	if ( !hostElement ) {
		return false;
	}

	// Cache the host element. It will be necessary for disablePlaceholder() to know
	// which element should have class and attribute removed because, depending on
	// the config.isDirectHost value, it could be the element or one of its descendants.
	config.hostElement = hostElement;

	// This may be necessary when updating the placeholder text to something else.
	if ( hostElement.getAttribute( 'data-placeholder' ) !== text ) {
		writer.setAttribute( 'data-placeholder', text, hostElement );
		wasViewModified = true;
	}

	if ( needsPlaceholder( hostElement ) ) {
		if ( showPlaceholder( writer, hostElement ) ) {
			wasViewModified = true;
		}
	} else if ( hidePlaceholder( writer, hostElement ) ) {
		wasViewModified = true;
	}

	return wasViewModified;
}

// Gets a child element capable of displaying a placeholder if a parent element can host more
// than just text (for instance, when it is a root editable element). The child element
// can then be used in other placeholder helpers as a substitute of its parent.
//
// @private
// @param {module:engine/view/element~Element} parent
// @returns {module:engine/view/element~Element|null}
function getChildPlaceholderHostSubstitute( parent ) {
	if ( parent.childCount === 1 ) {
		const firstChild = parent.getChild( 0 );

		if ( firstChild.is( 'element' ) && !firstChild.is( 'uiElement' ) ) {
			return firstChild;
		}
	}

	return null;
}
