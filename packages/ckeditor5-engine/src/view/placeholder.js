/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/placeholder
 */

import '../../theme/placeholder.css';

// Each document stores information about its placeholder elements and check functions.
const documentPlaceholders = new WeakMap();

/**
 * Adds a placeholder to the provided view element and updates it's visibility. To change the placeholder,
 * simply call this method again with new parameters.
 *
 * @param {module:engine/view/view~View} view View controller.
 * @param {module:engine/view/element~Element|Function} element Element to add placeholder to or a function
 * that returns such an element when an {@link module:engine/view/rooteditableelement~RootEditableElement root editable}
 * instance is passed into it.
 * @param {String} placeholderText Placeholder text to use.
 * @param {Function} [checkFunction] If provided it will be called before checking if placeholder should be displayed.
 * If function returns `false` placeholder will not be showed.
 */
export function addPlaceholder( view, element, placeholderText, checkFunction ) {
	const document = view.document;

	// Single listener per document.
	if ( !documentPlaceholders.has( document ) ) {
		documentPlaceholders.set( document, new Map() );

		// Create view post-fixer that will add placeholder where needed.
		document.registerPostFixer( writer => updateAllPlaceholders( document, writer ) );
	}

	// Store information about element with placeholder.
	documentPlaceholders.get( document ).set( element, {
		placeholderText,
		checkFunction
	} );

	// Update view right away.
	view.render();
}

/**
 * Removes the placeholder functionality from a given element.
 *
 * @param {module:engine/view/view~View} view
 * @param {module:engine/view/element~Element} element
 */
export function removePlaceholder( view, element ) {
	if ( typeof element == 'function' ) {
		element = element();
	}

	const doc = element.document;

	view.change( writer => {
		if ( documentPlaceholders.has( doc ) ) {
			documentPlaceholders.get( doc ).delete( element );
		}

		writer.removeClass( 'ck-placeholder', element );
		writer.removeAttribute( 'data-placeholder', element );
	} );
}

// Updates all placeholders of given document.
//
// @private
// @param {module:engine/view/document~Document} view
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
function updateAllPlaceholders( document, writer ) {
	const placeholders = documentPlaceholders.get( document );
	let changed = false;

	for ( const [ element, info ] of placeholders ) {
		if ( updateSinglePlaceholder( writer, element, info ) ) {
			changed = true;
		}
	}

	return changed;
}

// Updates placeholder class of given element.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {module:engine/view/element~Element} element
// @param {Object} info
function updateSinglePlaceholder( writer, element, info ) {
	if ( typeof element == 'function' ) {
		element = element();

		if ( !element ) {
			return false;
		}
	}

	const document = element.document;
	const text = info.placeholderText;
	let changed = false;

	// Element was removed from document.
	if ( !document ) {
		return false;
	}

	// Update data attribute if needed.
	if ( element.getAttribute( 'data-placeholder' ) !== text ) {
		writer.setAttribute( 'data-placeholder', text, element );
		changed = true;
	}

	const viewSelection = document.selection;
	const anchor = viewSelection.anchor;
	const checkFunction = info.checkFunction;

	// If checkFunction is provided and returns false - remove placeholder.
	if ( checkFunction && !checkFunction() ) {
		if ( element.hasClass( 'ck-placeholder' ) ) {
			writer.removeClass( 'ck-placeholder', element );
			changed = true;
		}

		return changed;
	}

	// Element is empty for placeholder purposes when it has no children or only ui elements.
	// This check is taken from `view.ContainerElement#getFillerOffset`.
	const isEmptyish = !Array.from( element.getChildren() ).some( element => !element.is( 'uiElement' ) );

	// If element is empty and editor is blurred.
	if ( !document.isFocused && isEmptyish ) {
		if ( !element.hasClass( 'ck-placeholder' ) ) {
			writer.addClass( 'ck-placeholder', element );
			changed = true;
		}

		return changed;
	}

	// It there are no child elements and selection is not placed inside element.
	if ( isEmptyish && anchor && anchor.parent !== element ) {
		if ( !element.hasClass( 'ck-placeholder' ) ) {
			writer.addClass( 'ck-placeholder', element );
			changed = true;
		}
	} else {
		if ( element.hasClass( 'ck-placeholder' ) ) {
			writer.removeClass( 'ck-placeholder', element );
			changed = true;
		}
	}

	return changed;
}

/**
 * Returns a view element the placeholder can be added to inside a view editing root.
 *
 * Even if empty, the editing root usually hosts at least one empty element (paragraph, heading, etc.).
 * Because of that, the placeholder cannot be added directly to the root and doing so would mean both
 * a CSS pseudo–element (with a placeholder text) and an empty element are displayed next to each other.
 *
 * Instead, the placeholder must be added to that empty element and this helper returns it, if there
 * is one.
 *
 * @param {module:engine/view/rooteditableelement~RootEditableElement} root The root editable view that
 * is to have a placeholder.
 * @returns {module:engine/view/element~Element|null} An element the placeholder can be added to.
 */
export function getRootPlaceholderElement( root ) {
	return () => {
		if ( root.childCount === 1 ) {
			const firstRootChild = root.getChild( 0 );

			if ( firstRootChild.is( 'element' ) ) {
				return firstRootChild;
			}
		}

		return null;
	};
}
