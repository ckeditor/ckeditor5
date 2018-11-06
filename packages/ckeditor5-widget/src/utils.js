/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module widget/utils
 */

import HighlightStack from './highlightstack';
import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview';
import env from '@ckeditor/ckeditor5-utils/src/env';

import dragHandlerIcon from '../theme/icons/drag-handler.svg';

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
 * Returns `true` if given {@link module:engine/view/node~Node} is an {@link module:engine/view/element~Element} and a widget.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
export function isWidget( node ) {
	if ( !node.is( 'element' ) ) {
		return false;
	}

	return !!node.getCustomProperty( widgetSymbol );
}

/**
 * Converts the given {@link module:engine/view/element~Element} to a widget in the following way:
 *
 * * sets the `contenteditable` attribute to `"true"`,
 * * adds the `ck-widget` CSS class,
 * * adds a custom {@link module:engine/view/element~Element#getFillerOffset `getFillerOffset()`} method returning `null`,
 * * adds a custom property allowing to recognize widget elements by using {@link ~isWidget `isWidget()`},
 * * implements the {@link ~setHighlightHandling view highlight on widgets}.
 *
 * This function needs to be used in conjuction with {@link module:engine/conversion/downcast-converters downcast converters}
 * like {@link module:engine/conversion/downcast-converters~downcastElementToElement `downcastElementToElement()`}.
 * Moreover, typically you will want to use `toWidget()` only for `editingDowncast`, while keeping the `dataDowncast` clean.
 *
 * For example, in order to convert a `<widget>` model element to `<div class="widget">` in the view, you can define
 * such converters:
 *
 *		editor.conversion.for( 'editingDowncast' )
 *			.add( downcastElementToElement( {
 *				model: 'widget',
 *				view: ( modelItem, writer ) => {
 *					const div = writer.createContainerElement( 'div', { class: 'widget' } );
 *
 *					return toWidget( div, writer, { label: 'some widget' } );
 *				}
 *			} ) );
 *
 *		editor.conversion.for( 'dataDowncast' )
 *			.add( downcastElementToElement( {
 *				model: 'widget',
 *				view: ( modelItem, writer ) => {
 *					return writer.createContainerElement( 'div', { class: 'widget' } );
 *				}
 *			} ) );
 *
 * See the full source code of the widget (with a nested editable) schema definition and converters in
 * [this sample](https://github.com/ckeditor/ckeditor5-widget/blob/master/tests/manual/widget-with-nestededitable.js).
 *
 * @param {module:engine/view/element~Element} element
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {Object} [options={}]
 * @param {String|Function} [options.label] Element's label provided to the {@link ~setLabel} function. It can be passed as
 * a plain string or a function returning a string. It represents the widget for assistive technologies (like screen readers).
 * @param {Boolean} [options.hasSelectionHandler=false] If `true`, the widget will have a selection handler added.
 * @returns {module:engine/view/element~Element} Returns the same element.
 */
export function toWidget( element, writer, options = {} ) {
	// The selection on Edge behaves better when the whole editor contents is in a single contenteditable element.
	// https://github.com/ckeditor/ckeditor5/issues/1079
	if ( !env.isEdge ) {
		writer.setAttribute( 'contenteditable', 'false', element );
	}

	writer.addClass( WIDGET_CLASS_NAME, element );
	writer.setCustomProperty( widgetSymbol, true, element );
	element.getFillerOffset = getFillerOffset;

	if ( options.label ) {
		setLabel( element, options.label, writer );
	}

	if ( options.hasSelectionHandler ) {
		addSelectionHandler( element, writer );
	}

	setHighlightHandling(
		element,
		writer,
		( element, descriptor, writer ) => writer.addClass( normalizeToArray( descriptor.classes ), element ),
		( element, descriptor, writer ) => writer.removeClass( normalizeToArray( descriptor.classes ), element )
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
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
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
 * {@link ~getLabel `getLabel()`}.
 *
 * @param {module:engine/view/element~Element} element
 * @param {String|Function} labelOrCreator
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 */
export function setLabel( element, labelOrCreator, writer ) {
	writer.setCustomProperty( labelSymbol, labelOrCreator, element );
}

/**
 * Returns the label of the provided element.
 *
 * @param {module:engine/view/element~Element} element
 * @returns {String}
 */
export function getLabel( element ) {
	const labelCreator = element.getCustomProperty( labelSymbol );

	if ( !labelCreator ) {
		return '';
	}

	return typeof labelCreator == 'function' ? labelCreator() : labelCreator;
}

/**
 * Adds functionality to the provided {@link module:engine/view/editableelement~EditableElement} to act as a widget's editable:
 *
 * * sets the `contenteditable` attribute to `true` when {@link module:engine/view/editableelement~EditableElement#isReadOnly} is `false`,
 * otherwise sets it to `false`,
 * * adds the `ck-editor__editable` and `ck-editor__nested-editable` CSS classes,
 * * adds the `ck-editor__nested-editable_focused` CSS class when the editable is focused and removes it when it is blurred.
 *
 * Similarly to {@link ~toWidget `toWidget()`} this function should be used in `dataDowncast` only and it is usually
 * used together with {@link module:engine/conversion/downcast-converters~downcastElementToElement `downcastElementToElement()`}.
 *
 * For example, in order to convert a `<nested>` model element to `<div class="nested">` in the view, you can define
 * such converters:
 *
 *		editor.conversion.for( 'editingDowncast' )
 *			.add( downcastElementToElement( {
 *				model: 'nested',
 *				view: ( modelItem, writer ) => {
 *					const div = writer.createEditableElement( 'div', { class: 'nested' } );
 *
 *					return toWidgetEditable( nested, writer );
 *				}
 *			} ) );
 *
 *		editor.conversion.for( 'dataDowncast' )
 *			.add( downcastElementToElement( {
 *				model: 'nested',
 *				view: ( modelItem, writer ) => {
 *					return writer.createContainerElement( 'div', { class: 'nested' } );
 *				}
 *			} ) );
 *
 * See the full source code of the widget (with nested editable) schema definition and converters in
 * [this sample](https://github.com/ckeditor/ckeditor5-widget/blob/master/tests/manual/widget-with-nestededitable.js).
 *
 * @param {module:engine/view/editableelement~EditableElement} editable
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @returns {module:engine/view/editableelement~EditableElement} Returns the same element that was provided in the `editable` parameter
 */
export function toWidgetEditable( editable, writer ) {
	writer.addClass( [ 'ck-editor__editable', 'ck-editor__nested-editable' ], editable );

	// The selection on Edge behaves better when the whole editor contents is in a single contentedible element.
	// https://github.com/ckeditor/ckeditor5/issues/1079
	if ( !env.isEdge ) {
		// Set initial contenteditable value.
		writer.setAttribute( 'contenteditable', editable.isReadOnly ? 'false' : 'true', editable );

		// Bind the contenteditable property to element#isReadOnly.
		editable.on( 'change:isReadOnly', ( evt, property, is ) => {
			writer.setAttribute( 'contenteditable', is ? 'false' : 'true', editable );
		} );
	}

	editable.on( 'change:isFocused', ( evt, property, is ) => {
		if ( is ) {
			writer.addClass( 'ck-editor__nested-editable_focused', editable );
		} else {
			writer.removeClass( 'ck-editor__nested-editable_focused', editable );
		}
	} );

	return editable;
}

/**
 * Returns a model position which is optimal (in terms of UX) for inserting a widget block.
 *
 * For instance, if a selection is in the middle of a paragraph, the position before this paragraph
 * will be returned so that it is not split. If the selection is at the end of a paragraph,
 * the position after this paragraph will be returned.
 *
 * Note: If the selection is placed in an empty block, that block will be returned. If that position
 * is then passed to {@link module:engine/model/model~Model#insertContent},
 * the block will be fully replaced by the image.
 *
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * The selection based on which the insertion position should be calculated.
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {module:engine/model/position~Position} The optimal position.
 */
export function findOptimalInsertionPosition( selection, model ) {
	const selectedElement = selection.getSelectedElement();

	if ( selectedElement ) {
		return model.createPositionAfter( selectedElement );
	}

	const firstBlock = selection.getSelectedBlocks().next().value;

	if ( firstBlock ) {
		// If inserting into an empty block – return position in that block. It will get
		// replaced with the image by insertContent(). #42.
		if ( firstBlock.isEmpty ) {
			return model.createPositionAt( firstBlock, 0 );
		}

		const positionAfter = model.createPositionAfter( firstBlock );

		// If selection is at the end of the block - return position after the block.
		if ( selection.focus.isTouching( positionAfter ) ) {
			return positionAfter;
		}

		// Otherwise return position before the block.
		return model.createPositionBefore( firstBlock );
	}

	return selection.focus;
}

// Default filler offset function applied to all widget elements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}

// Adds a drag handler to the editable element.
//
// @param {module:engine/view/editableelement~EditableElement}
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
function addSelectionHandler( editable, writer ) {
	const selectionHandler = writer.createUIElement( 'div', { class: 'ck ck-widget__selection-handler' }, function( domDocument ) {
		const domElement = this.toDomElement( domDocument );

		// Use the IconView from the ui library.
		const icon = new IconView();
		icon.set( 'content', dragHandlerIcon );

		// Render the icon view right away to append its #element to the selectionHandler DOM element.
		icon.render();

		domElement.appendChild( icon.element );

		return domElement;
	} );

	// Append the selection handler into the widget wrapper.
	writer.insert( writer.createPositionAt( editable, 0 ), selectionHandler );
	writer.addClass( [ 'ck-widget_selectable' ], editable );
}
