/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/widget/utils
 */

const widgetSymbol = Symbol( 'isWidget' );
const fakeSelectionLabelSymbol = Symbol( 'fakeSelectionLabel' );

/**
 * CSS class added to each widget element.
 *
 * @const {String}
 */
export const WIDGET_CLASS_NAME = 'ck-widget';

/**
 * CSS class added to currently selected widget element.
 *
 * @const {String}
 */
export const WIDGET_SELECTED_CLASS_NAME = 'ck-widget_selected';

/**
 * Returns `true` if given {@link module:engine/view/element~Element} is a widget.
 *
 * @param {module:engine/view/element~Element} element
 * @returns {Boolean}
 */
export function isWidget( element ) {
	return !!element.getCustomProperty( widgetSymbol );
}

/**
 * "Widgetizes" given {@link module:engine/view/element~Element}:
 * * sets `contenteditable` attribute to `true`,
 * * adds custom `getFillerOffset` method returning `null`,
 * * adds `ck-widget` CSS class,
 * * adds custom property allowing to recognize widget elements by using {@link ~isWidget}.
 *
 * @param {module:engine/view/element~Element} element
 * @returns {module:engine/view/element~Element} Returns same element.
 */
export function widgetize( element ) {
	element.setAttribute( 'contenteditable', false );
	element.getFillerOffset = getFillerOffset;
	element.addClass( WIDGET_CLASS_NAME );
	element.setCustomProperty( widgetSymbol, true );

	return element;
}

/**
 * Sets fake selection label for given element.
 * It can be passed as a plain string or a function returning a string. Function will be called each time label is retrieved by
 * {module:image/widget/utils~getFakeSelectionLabel}.
 *
 * @param {module:engine/view/element~Element} element
 * @param {String|Function} labelOrCreator
 */
export function setFakeSelectionLabel( element, labelOrCreator ) {
	element.setCustomProperty( fakeSelectionLabelSymbol, labelOrCreator );
}

/**
 * Returns fake selection label for provided element.
 *
 * @param {module:engine/view/element~Element} element
 * @return {String|undefined}
 */
export function getFakeSelectionLabel( element ) {
	const labelCreator = element.getCustomProperty( fakeSelectionLabelSymbol );

	if ( !labelCreator ) {
		return undefined;
	}

	return typeof labelCreator == 'function' ? labelCreator() : labelCreator;
}

// Default filler offset function applied to all widget elements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}
