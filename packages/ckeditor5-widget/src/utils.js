/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
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
 * @param {module:engine/view/writer~Writer} writer
 * @param {Object} [options={}]
 * @param {String|Function} [options.label] Element's label provided to {@link ~setLabel} function. It can be passed as
 * a plain string or a function returning a string.
 * @returns {module:engine/view/element~Element} Returns same element.
 */
export function toWidget( element, writer, options = {} ) {
	writer.setAttribute( 'contenteditable', 'false', element );
	writer.addClass( WIDGET_CLASS_NAME, element );
	writer.setCustomProperty( widgetSymbol, true, element );
	element.getFillerOffset = getFillerOffset;

	if ( options.label ) {
		setLabel( element, options.label, writer );
	}

	setHighlightHandling(
		element,
		writer,
		( element, descriptor, writer ) => writer.addClass( normalizeToArray( descriptor.class ), element ),
		( element, descriptor, writer ) => writer.removeClass( normalizeToArray( descriptor.class ), element )
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
 * @param {module:engine/view/writer~Writer} writer
 * @param {Function} add
 * @param {Function} remove
 */
export function setHighlightHandling( element, writer, add, remove ) {
	const stack = new HighlightStack();

	stack.on( 'change:top', ( evt, data ) => {
		if ( data.oldDescriptor ) {
			remove( element, data.oldDescriptor, data.writer );
		}

		if ( data.newDescriptor ) {
			add( element, data.newDescriptor, data.writer );
		}
	} );

	writer.setCustomProperty( 'addHighlight', ( element, descriptor, writer ) => stack.add( descriptor, writer ), element );
	writer.setCustomProperty( 'removeHighlight', ( element, id, writer ) => stack.remove( id, writer ), element );
}

/**
 * Sets label for given element.
 * It can be passed as a plain string or a function returning a string. Function will be called each time label is retrieved by
 * {@link ~getLabel}.
 *
 * @param {module:engine/view/element~Element} element
 * @param {String|Function} labelOrCreator
 *  * @param {module:engine/view/writer~Writer} writer
 */
export function setLabel( element, labelOrCreator, writer ) {
	writer.setCustomProperty( labelSymbol, labelOrCreator, element );
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
export function toWidgetEditable( editable, writer ) {
	writer.addClass( 'ck-editable', editable );

	// Set initial contenteditable value.
	writer.setAttribute( 'contenteditable', editable.isReadOnly ? 'false' : 'true', editable );

	// Bind contenteditable property to element#isReadOnly.
	editable.on( 'change:isReadOnly', ( evt, property, is ) => {
		writer.setAttribute( 'contenteditable', is ? 'false' : 'true', editable );
	} );

	editable.on( 'change:isFocused', ( evt, property, is ) => {
		if ( is ) {
			writer.addClass( 'ck-editable_focused', editable );
		} else {
			writer.removeClass( 'ck-editable_focused', editable );
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
