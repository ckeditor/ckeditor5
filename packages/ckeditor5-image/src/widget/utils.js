/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

const widgetSymbol = Symbol( 'isWidget' );

/**
 * CSS classes added to each widget element.
 *
 * @member {String} image.widget.utils.WIDGET_CLASS_NAME
 */
export const WIDGET_CLASS_NAME = 'ck-widget';

/**
 * CSS classes added to currently selected widget element.
 *
 * @member {String} image.widget.utils.WIDGET_SELECTED_CLASS_NAME
 */
export const WIDGET_SELECTED_CLASS_NAME = 'ck-widget_selected';

/**
 * Returns `true` if given {@link engine.view.Element} is a widget.
 *
 * @method image.widget.utils.isWidget
 * @param {engine.view.Element} element
 * @returns {Boolean}
 */
export function isWidget( element ) {
	return !!element.getCustomProperty( widgetSymbol );
}

/**
 * "Widgetizes" given {@link engine.view.Element}:
 * * sets `contenteditable` attribue to `true`,
 * * adds custom `getFillerOffset` method returning `null`,
 * * adds `ck-widget` CSS class,
 * * adds custom property allowing to recognize widget elements by using {@link image.widget.utils.isWidget}.
 *
 * @param {engine.view.Element} element
 * @returns {engine.view.Element} Returns same element.
 */
export function widgetize( element ) {
	element.setAttribute( 'contenteditable', false );
	element.getFillerOffset = () => null;
	element.addClass( WIDGET_CLASS_NAME );
	element.setCustomProperty( widgetSymbol, true );

	return element;
}
