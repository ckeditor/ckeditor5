/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/widget/utils
 */

const widgetSymbol = Symbol( 'isWidget' );

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

// Default filler offset function applied to all widget elements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}
