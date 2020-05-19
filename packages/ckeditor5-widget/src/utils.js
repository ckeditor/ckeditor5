/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/utils
 */

import HighlightStack from './highlightstack';
import IconView from '@ckeditor/ckeditor5-ui/src/icon/iconview';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import dragHandleIcon from '../theme/icons/drag-handle.svg';

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

	return !!node.getCustomProperty( 'widget' );
}

/* eslint-disable max-len */
/**
 * Converts the given {@link module:engine/view/element~Element} to a widget in the following way:
 *
 * * sets the `contenteditable` attribute to `"true"`,
 * * adds the `ck-widget` CSS class,
 * * adds a custom {@link module:engine/view/element~Element#getFillerOffset `getFillerOffset()`} method returning `null`,
 * * adds a custom property allowing to recognize widget elements by using {@link ~isWidget `isWidget()`},
 * * implements the {@link ~setHighlightHandling view highlight on widgets}.
 *
 * This function needs to be used in conjunction with
 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers downcast conversion helpers}
 * like {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`}.
 * Moreover, typically you will want to use `toWidget()` only for `editingDowncast`, while keeping the `dataDowncast` clean.
 *
 * For example, in order to convert a `<widget>` model element to `<div class="widget">` in the view, you can define
 * such converters:
 *
 *		editor.conversion.for( 'editingDowncast' )
 *			.elementToElement( {
 *				model: 'widget',
 *				view: ( modelItem, writer ) => {
 *					const div = writer.createContainerElement( 'div', { class: 'widget' } );
 *
 *					return toWidget( div, writer, { label: 'some widget' } );
 *				}
 *			} );
 *
 *		editor.conversion.for( 'dataDowncast' )
 *			.elementToElement( {
 *				model: 'widget',
 *				view: ( modelItem, writer ) => {
 *					return writer.createContainerElement( 'div', { class: 'widget' } );
 *				}
 *			} );
 *
 * See the full source code of the widget (with a nested editable) schema definition and converters in
 * [this sample](https://github.com/ckeditor/ckeditor5-widget/blob/master/tests/manual/widget-with-nestededitable.js).
 *
 * @param {module:engine/view/element~Element} element
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @param {Object} [options={}]
 * @param {String|Function} [options.label] Element's label provided to the {@link ~setLabel} function. It can be passed as
 * a plain string or a function returning a string. It represents the widget for assistive technologies (like screen readers).
 * @param {Boolean} [options.hasSelectionHandle=false] If `true`, the widget will have a selection handle added.
 * @returns {module:engine/view/element~Element} Returns the same element.
 */
/* eslint-enable max-len */
export function toWidget( element, writer, options = {} ) {
	writer.setAttribute( 'contenteditable', 'false', element );

	writer.addClass( WIDGET_CLASS_NAME, element );
	writer.setCustomProperty( 'widget', true, element );
	element.getFillerOffset = getFillerOffset;

	if ( options.label ) {
		setLabel( element, options.label, writer );
	}

	if ( options.hasSelectionHandle ) {
		addSelectionHandle( element, writer );
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
	writer.setCustomProperty( 'widgetLabel', labelOrCreator, element );
}

/**
 * Returns the label of the provided element.
 *
 * @param {module:engine/view/element~Element} element
 * @returns {String}
 */
export function getLabel( element ) {
	const labelCreator = element.getCustomProperty( 'widgetLabel' );

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
 * used together with {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`}.
 *
 * For example, in order to convert a `<nested>` model element to `<div class="nested">` in the view, you can define
 * such converters:
 *
 *		editor.conversion.for( 'editingDowncast' )
 *			.elementToElement( {
 *				model: 'nested',
 *				view: ( modelItem, writer ) => {
 *					const div = writer.createEditableElement( 'div', { class: 'nested' } );
 *
 *					return toWidgetEditable( nested, writer );
 *				}
 *			} );
 *
 *		editor.conversion.for( 'dataDowncast' )
 *			.elementToElement( {
 *				model: 'nested',
 *				view: ( modelItem, writer ) => {
 *					return writer.createContainerElement( 'div', { class: 'nested' } );
 *				}
 *			} );
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

	// Set initial contenteditable value.
	writer.setAttribute( 'contenteditable', editable.isReadOnly ? 'false' : 'true', editable );

	// Bind the contenteditable property to element#isReadOnly.
	editable.on( 'change:isReadOnly', ( evt, property, is ) => {
		writer.setAttribute( 'contenteditable', is ? 'false' : 'true', editable );
	} );

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

	if ( selectedElement && model.schema.isBlock( selectedElement ) ) {
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

/**
 * A util to be used in order to map view positions to correct model positions when implementing a widget
 * which renders non-empty view element for an empty model element.
 *
 * For example:
 *
 *		// Model:
 *		<placeholder type="name"></placeholder>
 *
 *		// View:
 *		<span class="placeholder">name</span>
 *
 * In such case, view positions inside `<span>` cannot be correct mapped to the model (because the model element is empty).
 * To handle mapping positions inside `<span class="placeholder">` to the model use this util as follows:
 *
 *		editor.editing.mapper.on(
 *			'viewToModelPosition',
 *			viewToModelPositionOutsideModelElement( model, viewElement => viewElement.hasClass( 'placeholder' ) )
 *		);
 *
 * The callback will try to map the view offset of selection to an expected model position.
 *
 * 1. When the position is at the end (or in the middle) of the inline widget:
 *
 *		// View:
 *		<p>foo <span class="placeholder">name|</span> bar</p>
 *
 *		// Model:
 *		<paragraph>foo <placeholder type="name"></placeholder>| bar</paragraph>
 *
 * 2. When the position is at the beginning of the inline widget:
 *
 *		// View:
 *		<p>foo <span class="placeholder">|name</span> bar</p>
 *
 *		// Model:
 *		<paragraph>foo |<placeholder type="name"></placeholder> bar</paragraph>
 *
 * @param {module:engine/model/model~Model} model Model instance on which the callback operates.
 * @param {Function} viewElementMatcher Function that is passed a view element and should return `true` if the custom mapping
 * should be applied to the given view element.
 * @return {Function}
 */
export function viewToModelPositionOutsideModelElement( model, viewElementMatcher ) {
	return ( evt, data ) => {
		const { mapper, viewPosition } = data;

		const viewParent = mapper.findMappedViewAncestor( viewPosition );

		if ( !viewElementMatcher( viewParent ) ) {
			return;
		}

		const modelParent = mapper.toModelElement( viewParent );

		data.modelPosition = model.createPositionAt( modelParent, viewPosition.isAtStart ? 'before' : 'after' );
	};
}

/**
 * A positioning function passed to the {@link module:utils/dom/position~getOptimalPosition} helper as a last resort
 * when attaching {@link  module:ui/panel/balloon/balloonpanelview~BalloonPanelView balloon UI} to widgets.
 * It comes in handy when a widget is longer than the visual viewport of the web browser and/or upper/lower boundaries
 * of a widget are off screen because of the web page scroll.
 *
 *	                                       ┌─┄┄┄┄┄┄┄┄┄Widget┄┄┄┄┄┄┄┄┄┐
 *	                                       ┊                         ┊
 *	┌────────────Viewport───────────┐   ┌──╁─────────Viewport────────╁──┐
 *	│  ┏━━━━━━━━━━Widget━━━━━━━━━┓  │   │  ┃            ^            ┃  │
 *	│  ┃            ^            ┃  │   │  ┃   ╭───────/ \───────╮   ┃  │
 *	│  ┃   ╭───────/ \───────╮   ┃  │   │  ┃   │     Balloon     │   ┃  │
 *	│  ┃   │     Balloon     │   ┃  │   │  ┃   ╰─────────────────╯   ┃  │
 *	│  ┃   ╰─────────────────╯   ┃  │   │  ┃                         ┃  │
 *	│  ┃                         ┃  │   │  ┃                         ┃  │
 *	│  ┃                         ┃  │   │  ┃                         ┃  │
 *	│  ┃                         ┃  │   │  ┃                         ┃  │
 *	│  ┃                         ┃  │   │  ┃                         ┃  │
 *	│  ┃                         ┃  │   │  ┃                         ┃  │
 *	│  ┃                         ┃  │   │  ┃                         ┃  │
 *	└──╀─────────────────────────╀──┘   └──╀─────────────────────────╀──┘
 *	   ┊                         ┊         ┊                         ┊
 *	   ┊                         ┊         └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘
 *	   ┊                         ┊
 *	   └┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┘
 *
 * **Note**: Works best if used together with
 * {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView.defaultPositions default `BalloonPanelView` positions}
 * like `northArrowSouth` and `southArrowNorth`; the transition between these two and this position is smooth.
 *
 * @param {module:utils/dom/rect~Rect} widgetRect A rect of the widget.
 * @param {module:utils/dom/rect~Rect} balloonRect A rect of the balloon.
 * @returns {module:utils/dom/position~Position|null}
 */
export function centeredBalloonPositionForLongWidgets( widgetRect, balloonRect ) {
	const viewportRect = new Rect( global.window );
	const viewportWidgetInsersectionRect = viewportRect.getIntersection( widgetRect );

	const balloonTotalHeight = balloonRect.height + BalloonPanelView.arrowVerticalOffset;

	// If there is enough space above or below the widget then this position should not be used.
	if ( widgetRect.top - balloonTotalHeight > viewportRect.top || widgetRect.bottom + balloonTotalHeight < viewportRect.bottom ) {
		return null;
	}

	// Because this is a last resort positioning, to keep things simple we're not playing with positions of the arrow
	// like, for instance, "south west" or whatever. Just try to keep the balloon in the middle of the visible area of
	// the widget for as long as it is possible. If the widgets becomes invisible (because cropped by the viewport),
	// just... place the balloon in the middle of it (because why not?).
	const targetRect = viewportWidgetInsersectionRect || widgetRect;
	const left = targetRect.left + targetRect.width / 2 - balloonRect.width / 2;

	return {
		top: Math.max( widgetRect.top, 0 ) + BalloonPanelView.arrowVerticalOffset,
		left,
		name: 'arrow_n'
	};
}

// Default filler offset function applied to all widget elements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}

// Adds a drag handle to the widget.
//
// @param {module:engine/view/containerelement~ContainerElement}
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
function addSelectionHandle( widgetElement, writer ) {
	const selectionHandle = writer.createUIElement( 'div', { class: 'ck ck-widget__selection-handle' }, function( domDocument ) {
		const domElement = this.toDomElement( domDocument );

		// Use the IconView from the ui library.
		const icon = new IconView();
		icon.set( 'content', dragHandleIcon );

		// Render the icon view right away to append its #element to the selectionHandle DOM element.
		icon.render();

		domElement.appendChild( icon.element );

		return domElement;
	} );

	// Append the selection handle into the widget wrapper.
	writer.insert( writer.createPositionAt( widgetElement, 0 ), selectionHandle );
	writer.addClass( [ 'ck-widget_with-selection-handle' ], widgetElement );
}
