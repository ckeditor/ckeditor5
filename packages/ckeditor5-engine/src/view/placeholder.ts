/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/placeholder
 */

import '../../theme/placeholder.css';

import type Document from './document.js';
import type DowncastWriter from './downcastwriter.js';
import type EditableElement from './editableelement.js';
import type Element from './element.js';
import type View from './view.js';

import { logWarning, type ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';

// Each document stores information about its placeholder elements and check functions.
const documentPlaceholders = new WeakMap<Document, Map<Element, PlaceholderConfig>>();

let hasDisplayedPlaceholderDeprecationWarning = false;

/**
 * A helper that enables a placeholder on the provided view element (also updates its visibility).
 * The placeholder is a CSS pseudo–element (with a text content) attached to the element.
 *
 * To change the placeholder text, change value of the `placeholder` property in the provided `element`.
 *
 * To disable the placeholder, use {@link module:engine/view/placeholder~disablePlaceholder `disablePlaceholder()`} helper.
 *
 * @param options Configuration options of the placeholder.
 * @param options.view Editing view instance.
 * @param options.element Element that will gain a placeholder. See `options.isDirectHost` to learn more.
 * @param options.isDirectHost If set `false`, the placeholder will not be enabled directly
 * in the passed `element` but in one of its children (selected automatically, i.e. a first empty child element).
 * Useful when attaching placeholders to elements that can host other elements (not just text), for instance,
 * editable root elements.
 * @param options.text Placeholder text. It's **deprecated** and will be removed soon. Use
 * {@link module:engine/view/placeholder~PlaceholderableElement#placeholder `options.element.placeholder`} instead.
 * @param options.keepOnFocus If set `true`, the placeholder stay visible when the host element is focused.
 */
export function enablePlaceholder( { view, element, text, isDirectHost = true, keepOnFocus = false }: {
	view: View;
	element: PlaceholderableElement | EditableElement;
	isDirectHost?: boolean;
	text?: string;
	keepOnFocus?: boolean;
} ): void {
	const doc = view.document;

	// Use a single post fixer per—document to update all placeholders.
	if ( !documentPlaceholders.has( doc ) ) {
		documentPlaceholders.set( doc, new Map() );

		// If a post-fixer callback makes a change, it should return `true` so other post–fixers
		// can re–evaluate the document again.
		doc.registerPostFixer( writer => updateDocumentPlaceholders( documentPlaceholders.get( doc )!, writer ) );

		// Update placeholders on isComposing state change since rendering is disabled while in composition mode.
		doc.on<ObservableChangeEvent>( 'change:isComposing', () => {
			view.change( writer => updateDocumentPlaceholders( documentPlaceholders.get( doc )!, writer ) );
		}, { priority: 'high' } );
	}

	if ( element.is( 'editableElement' ) ) {
		element.on( 'change:placeholder', ( evtInfo, evt, text ) => setPlaceholder( text ) );
	}

	if ( element.placeholder ) {
		setPlaceholder( element.placeholder );
	} else if ( text ) {
		setPlaceholder( text );
	}

	if ( text ) {
		showPlaceholderTextDeprecationWarning();
	}

	function setPlaceholder( text: string ) {
		const config = {
			text,
			isDirectHost,
			keepOnFocus,
			hostElement: isDirectHost ? element : null
		};

		// Store information about the element placeholder under its document.
		documentPlaceholders.get( doc )!.set( element, config );

		// Update the placeholders right away.
		view.change( writer => updateDocumentPlaceholders( [ [ element, config ] ], writer ) );
	}
}

/**
 * Disables the placeholder functionality from a given element.
 *
 * See {@link module:engine/view/placeholder~enablePlaceholder `enablePlaceholder()`} to learn more.
 */
export function disablePlaceholder( view: View, element: Element ): void {
	const doc = element.document;

	if ( !documentPlaceholders.has( doc ) ) {
		return;
	}

	view.change( writer => {
		const placeholders = documentPlaceholders.get( doc )!;
		const config = placeholders.get( element )!;

		writer.removeAttribute( 'data-placeholder', config.hostElement! );
		hidePlaceholder( writer, config.hostElement! );

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
 * @returns `true`, if any changes were made to the `element`.
 */
export function showPlaceholder( writer: DowncastWriter, element: Element ): boolean {
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
 * @returns `true`, if any changes were made to the `element`.
 */
export function hidePlaceholder( writer: DowncastWriter, element: Element ): boolean {
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
 * @param element Element that holds the placeholder.
 * @param keepOnFocus Focusing the element will keep the placeholder visible.
 */
export function needsPlaceholder( element: Element, keepOnFocus: boolean ): boolean {
	if ( !element.isAttached() ) {
		return false;
	}

	if ( hasContent( element ) ) {
		return false;
	}

	const doc = element.document;
	const viewSelection = doc.selection;
	const selectionAnchor = viewSelection.anchor;

	if ( doc.isComposing && selectionAnchor && selectionAnchor.parent === element ) {
		return false;
	}

	// Skip the focus check and make the placeholder visible already regardless of document focus state.
	if ( keepOnFocus ) {
		return true;
	}

	// If the document is blurred.
	if ( !doc.isFocused ) {
		return true;
	}

	// If document is focused and the element is empty but the selection is not anchored inside it.
	return !!selectionAnchor && selectionAnchor.parent !== element;
}

/**
 * Anything but uiElement(s) counts as content.
 */
function hasContent( element: Element ): boolean {
	for ( const child of element.getChildren() ) {
		if ( !child.is( 'uiElement' ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Updates all placeholders associated with a document in a post–fixer callback.
 *
 * @returns True if any changes were made to the view document.
 */
function updateDocumentPlaceholders(
	placeholders: Iterable<[ Element, PlaceholderConfig ]>,
	writer: DowncastWriter
): boolean {
	const directHostElements: Array<Element> = [];
	let wasViewModified = false;

	// First set placeholders on the direct hosts.
	for ( const [ element, config ] of placeholders ) {
		if ( config.isDirectHost ) {
			directHostElements.push( element );

			if ( updatePlaceholder( writer, element, config ) ) {
				wasViewModified = true;
			}
		}
	}

	// Then set placeholders on the indirect hosts but only on those that does not already have an direct host placeholder.
	for ( const [ element, config ] of placeholders ) {
		if ( config.isDirectHost ) {
			continue;
		}

		const hostElement = getChildPlaceholderHostSubstitute( element );

		// When not a direct host, it could happen that there is no child element
		// capable of displaying a placeholder.
		if ( !hostElement ) {
			continue;
		}

		// Don't override placeholder if the host element already has some direct placeholder.
		if ( directHostElements.includes( hostElement ) ) {
			continue;
		}

		// Update the host element (used for setting and removing the placeholder).
		config.hostElement = hostElement;

		if ( updatePlaceholder( writer, element, config ) ) {
			wasViewModified = true;
		}
	}

	return wasViewModified;
}

/**
 * Updates a single placeholder in a post–fixer callback.
 *
 * @returns True if any changes were made to the view document.
 */
function updatePlaceholder( writer: DowncastWriter, element: Element, config: PlaceholderConfig ) {
	const { text, isDirectHost, hostElement } = config;

	let wasViewModified = false;

	// This may be necessary when updating the placeholder text to something else.
	if ( hostElement!.getAttribute( 'data-placeholder' ) !== text ) {
		writer.setAttribute( 'data-placeholder', text, hostElement! );
		wasViewModified = true;
	}

	// If the host element is not a direct host then placeholder is needed only when there is only one element.
	const isOnlyChild = isDirectHost || element.childCount == 1;

	if ( isOnlyChild && needsPlaceholder( hostElement!, config.keepOnFocus ) ) {
		if ( showPlaceholder( writer, hostElement! ) ) {
			wasViewModified = true;
		}
	} else if ( hidePlaceholder( writer, hostElement! ) ) {
		wasViewModified = true;
	}

	return wasViewModified;
}

/**
 * Gets a child element capable of displaying a placeholder if a parent element can host more
 * than just text (for instance, when it is a root editable element). The child element
 * can then be used in other placeholder helpers as a substitute of its parent.
 */
function getChildPlaceholderHostSubstitute( parent: Element ): Element | null {
	if ( parent.childCount ) {
		const firstChild = parent.getChild( 0 )!;

		if ( firstChild.is( 'element' ) && !firstChild.is( 'uiElement' ) && !firstChild.is( 'attributeElement' ) ) {
			return firstChild;
		}
	}

	return null;
}

/**
 * Displays a deprecation warning message in the console, but only once per page load.
 */
function showPlaceholderTextDeprecationWarning() {
	if ( !hasDisplayedPlaceholderDeprecationWarning ) {
		/**
		 * The "text" option in the {@link module:engine/view/placeholder~enablePlaceholder `enablePlaceholder()`}
		 * function is deprecated and will be removed soon.
		 *
		 * See the {@glink updating/guides/update-to-39#view-element-placeholder Migration to v39} guide for
		 * more information on how to apply this change.
		 *
		 * @error enableplaceholder-deprecated-text-option
		 */
		logWarning( 'enableplaceholder-deprecated-text-option' );
	}

	hasDisplayedPlaceholderDeprecationWarning = true;
}

/**
 * Configuration of the placeholder.
 */
interface PlaceholderConfig {
	text: string;
	isDirectHost: boolean;
	keepOnFocus: boolean;
	hostElement: Element | null;
}

/**
 * Element that could have a placeholder.
 */
export interface PlaceholderableElement extends Element {

	/**
	 * The text of element's placeholder.
	 */
	placeholder?: string;
}
