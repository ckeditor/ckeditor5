/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module widget/utils
 */

import HighlightStack from './highlightstack';

const widgetSymbol = Symbol( 'isWidget' );
const labelSymbol = Symbol( 'label' );

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
 * Converts given {@link module:engine/view/element~Element} to widget in following way:
 * * sets `contenteditable` attribute to `"true"`,
 * * adds custom `getFillerOffset` method returning `null`,
 * * adds `ck-widget` CSS class,
 * * adds custom property allowing to recognize widget elements by using {@link ~isWidget},
 * * implements `addHighlight` and `removeHighlight` custom properties to handle view highlight on widgets.
 *
 * @param {module:engine/view/element~Element} element
 * @param {Object} [options={}]
 * @param {String|Function} [options.label] Element's label provided to {@link ~setLabel} function. It can be passed as
 * a plain string or a function returning a string.
 * @returns {module:engine/view/element~Element} Returns same element.
 */
export function toWidget( element, options = {} ) {
	element.setAttribute( 'contenteditable', 'false' );
	element.getFillerOffset = getFillerOffset;
	element.addClass( WIDGET_CLASS_NAME );
	element.setCustomProperty( widgetSymbol, true );

	if ( options.label ) {
		setLabel( element, options.label );
	}

	setHighlightHandling(
		element,
		( element, descriptor ) => element.addClass( ...normalizeToArray( descriptor.class ) ),
		( element, descriptor ) => element.removeClass( ...normalizeToArray( descriptor.class ) )
	);

	return element;

	// Normalizes CSS class in descriptor that can be provided in form of an array or a string.
	function normalizeToArray( classes ) {
		return Array.isArray( classes ) ? classes : [ classes ];
	}
}

/**
 * Sets highlight handling methods. Uses {@link module:widget/highlightstack~HighlightStack} to
 * properly determine which highlight descriptor should be used at given time.
 *
 * @param {module:engine/view/element~Element} element
 * @param {Function} add
 * @param {Function} remove
 */
export function setHighlightHandling( element, add, remove ) {
	const stack = new HighlightStack();

	stack.on( 'change:top', ( evt, data ) => {
		if ( data.oldDescriptor ) {
			remove( element, data.oldDescriptor );
		}

		if ( data.newDescriptor ) {
			add( element, data.newDescriptor );
		}
	} );

	element.setCustomProperty( 'addHighlight', ( element, descriptor ) => stack.add( descriptor ) );
	element.setCustomProperty( 'removeHighlight', ( element, id ) => stack.remove( id ) );
}

/**
 * Sets label for given element.
 * It can be passed as a plain string or a function returning a string. Function will be called each time label is retrieved by
 * {@link ~getLabel}.
 *
 * @param {module:engine/view/element~Element} element
 * @param {String|Function} labelOrCreator
 */
export function setLabel( element, labelOrCreator ) {
	element.setCustomProperty( labelSymbol, labelOrCreator );
}

/**
 * Returns label for provided element.
 *
 * @param {module:engine/view/element~Element} element
 * @return {String}
 */
export function getLabel( element ) {
	const labelCreator = element.getCustomProperty( labelSymbol );

	if ( !labelCreator ) {
		return '';
	}

	return typeof labelCreator == 'function' ? labelCreator() : labelCreator;
}

/**
 * Adds functionality to provided {module:engine/view/editableelement~EditableElement} to act as a widget's editable:
 * * adds `ck-editable` CSS class,
 * * sets `contenteditable` as `true` when {module:engine/view/editableelement~EditableElement#isReadOnly} is `false`
 * otherwise set `false`,
 * * adds `ck-editable_focused` CSS class when editable is focused and removes it when it's blurred.
 *
 * @param {module:engine/view/editableelement~EditableElement} editable
 * @returns {module:engine/view/editableelement~EditableElement} Returns same element that was provided in `editable` param.
 */
export function toWidgetEditable( editable ) {
	editable.addClass( 'ck-editable' );

	// Set initial contenteditable value.
	editable.setAttribute( 'contenteditable', editable.isReadOnly ? 'false' : 'true' );

	// Bind contenteditable property to element#isReadOnly.
	editable.on( 'change:isReadOnly', ( evt, property, is ) => {
		editable.setAttribute( 'contenteditable', is ? 'false' : 'true' );
	} );

	editable.on( 'change:isFocused', ( evt, property, is ) => {
		if ( is ) {
			editable.addClass( 'ck-editable_focused' );
		} else {
			editable.removeClass( 'ck-editable_focused' );
		}
	} );

	return editable;
}

// Default filler offset function applied to all widget elements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}
