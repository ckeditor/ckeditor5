/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolistconverters
 */

/* global document */

import { generateLiInUl, injectViewList } from './utils';
import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It converts the `listItem` model element to an unordered list with a {@link module:engine/view/uielement~UIElement checkbox element}
 * at the beginning of each list item. It also merges the list with surrounding lists (if available).
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {Function} Returns a conversion callback.
 */
export function modelViewInsertion( model, onCheckboxChecked ) {
	return ( evt, data, conversionApi ) => {
		const consumable = conversionApi.consumable;

		if ( !consumable.test( data.item, 'insert' ) ||
			!consumable.test( data.item, 'attribute:listType' ) ||
			!consumable.test( data.item, 'attribute:listIndent' )
		) {
			return;
		}

		if ( data.item.getAttribute( 'listType' ) != 'todo' ) {
			return;
		}

		const modelItem = data.item;

		consumable.consume( modelItem, 'insert' );
		consumable.consume( modelItem, 'attribute:listType' );
		consumable.consume( modelItem, 'attribute:listIndent' );
		consumable.consume( modelItem, 'attribute:todoListChecked' );

		const viewWriter = conversionApi.writer;
		const viewItem = generateLiInUl( modelItem, conversionApi );

		const isChecked = !!modelItem.getAttribute( 'todoListChecked' );
		const checkmarkElement = createCheckmarkElement( modelItem, viewWriter, isChecked, onCheckboxChecked );

		viewWriter.addClass( 'todo-list', viewItem.parent );
		viewWriter.insert( viewWriter.createPositionAt( viewItem, 0 ), checkmarkElement );

		injectViewList( modelItem, viewItem, conversionApi, model );
	};
}

/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It is used by {@link module:engine/controller/datacontroller~DataController}.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {Function} Returns a conversion callback.
 */
export function dataModelViewInsertion( model ) {
	return ( evt, data, conversionApi ) => {
		const consumable = conversionApi.consumable;

		if ( !consumable.test( data.item, 'insert' ) ||
			!consumable.test( data.item, 'attribute:listType' ) ||
			!consumable.test( data.item, 'attribute:listIndent' )
		) {
			return;
		}

		if ( data.item.getAttribute( 'listType' ) != 'todo' ) {
			return;
		}

		consumable.consume( data.item, 'insert' );
		consumable.consume( data.item, 'attribute:listType' );
		consumable.consume( data.item, 'attribute:listIndent' );

		const viewWriter = conversionApi.writer;
		const modelItem = data.item;
		const viewItem = generateLiInUl( modelItem, conversionApi );

		viewWriter.addClass( 'todo-list', viewItem.parent );

		const label = viewWriter.createAttributeElement( 'label', {
			class: 'todo-list__label'
		} );

		const checkbox = viewWriter.createEmptyElement( 'input', {
			type: 'checkbox',
			disabled: 'disabled'
		} );

		if ( data.item.getAttribute( 'todoListChecked' ) ) {
			viewWriter.setAttribute( 'checked', 'checked', checkbox );
			viewWriter.addClass( 'todo-list__label', label );
		}

		viewWriter.insert( viewWriter.createPositionAt( viewItem, 0 ), checkbox );
		viewWriter.wrap( viewWriter.createRangeOn( checkbox ), label );

		injectViewList( modelItem, viewItem, conversionApi, model );
	};
}

/**
 * A model-to-view converter for the model `$text` element inside a to-do list item.
 *
 * It is used by {@link module:engine/controller/datacontroller~DataController}.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface.
 */
export function dataModelViewTextInsertion( evt, data, conversionApi ) {
	const parent = data.range.start.parent;

	if ( parent.name != 'listItem' || parent.getAttribute( 'listType' ) != 'todo' ) {
		return;
	}

	if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
		return;
	}

	const viewWriter = conversionApi.writer;
	const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
	const viewText = viewWriter.createText( data.item.data );

	const span = viewWriter.createAttributeElement( 'span', { class: 'todo-list__label__description' } );
	const label = viewPosition.parent.getChild( 0 );

	viewWriter.insert( viewWriter.createPositionAt( viewPosition.parent, 'end' ), viewText );
	viewWriter.wrap( viewWriter.createRangeOn( viewText ), span );
	viewWriter.wrap( viewWriter.createRangeOn( viewText.parent ), label );
}

/**
 * A view-to-model converter for the checkbox element inside a view list item.
 *
 * It changes the `listType` of the model `listItem` to a `todo` value.
 * When a view checkbox element is marked as checked, an additional `todoListChecked="true"` attribute is added to the model item.
 *
 * It is used by {@link module:engine/controller/datacontroller~DataController}.
 *
 * @see module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data An object containing conversion input, a placeholder for conversion output and possibly other values.
 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion interface to be used by the callback.
 */
export function dataViewModelCheckmarkInsertion( evt, data, conversionApi ) {
	const modelCursor = data.modelCursor;
	const modelItem = modelCursor.parent;
	const viewItem = data.viewItem;

	if ( viewItem.getAttribute( 'type' ) != 'checkbox' || modelItem.name != 'listItem' || !modelCursor.isAtStart ) {
		return;
	}

	if ( !conversionApi.consumable.consume( viewItem, { name: true } ) ) {
		return;
	}

	const writer = conversionApi.writer;

	writer.setAttribute( 'listType', 'todo', modelItem );

	if ( data.viewItem.hasAttribute( 'checked' ) ) {
		writer.setAttribute( 'todoListChecked', true, modelItem );
	}

	data.modelRange = writer.createRange( modelCursor );
}

/**
 * A model-to-view converter for the `listType` attribute change on the `listItem` model element.
 *
 * This change means that the `<li>` element parent changes to `<ul class="todo-list">` and a
 * {@link module:engine/view/uielement~UIElement checkbox UI element} is added at the beginning
 * of the list item element (or vice versa).
 *
 * This converter is preceded by {@link module:list/converters~modelViewChangeType} and followed by
 * {@link module:list/converters~modelViewMergeAfterChangeType} to handle splitting and merging surrounding lists of the same type.
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param {Function} onCheckedChange Callback fired after clicking the checkbox UI element.
 * @returns {Function} Returns a conversion callback.
 */
export function modelViewChangeType( onCheckedChange, view ) {
	return ( evt, data, conversionApi ) => {
		const viewItem = conversionApi.mapper.toViewElement( data.item );
		const viewWriter = conversionApi.writer;

		if ( data.attributeNewValue == 'todo' ) {
			const isChecked = !!data.item.getAttribute( 'todoListChecked' );
			const checkmarkElement = createCheckmarkElement( data.item, viewWriter, isChecked, onCheckedChange );

			viewWriter.addClass( 'todo-list', viewItem.parent );
			viewWriter.insert( viewWriter.createPositionAt( viewItem, 0 ), checkmarkElement );
		} else if ( data.attributeOldValue == 'todo' ) {
			viewWriter.removeClass( 'todo-list', viewItem.parent );
			viewWriter.remove( findLabel( viewItem, view ) );
		}
	};
}

/**
 * A model-to-view converter for the `todoListChecked` attribute change on the `listItem` model element.
 *
 * It marks the {@link module:engine/view/uielement~UIElement checkbox UI element} as checked.
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param {Function} onCheckedChange Callback fired after clicking the checkbox UI element.
 * @returns {Function} Returns a conversion callback.
 */
export function modelViewChangeChecked( onCheckedChange ) {
	return ( evt, data, conversionApi ) => {
		// Do not convert `todoListChecked` attribute when to-do list item has changed to other list item.
		// This attribute will be removed by the model post fixer.
		if ( data.item.getAttribute( 'listType' ) != 'todo' ) {
			return;
		}

		if ( !conversionApi.consumable.consume( data.item, 'attribute:todoListChecked' ) ) {
			return;
		}

		const { mapper, writer: viewWriter } = conversionApi;
		const isChecked = !!data.item.getAttribute( 'todoListChecked' );
		const viewItem = mapper.toViewElement( data.item );
		// Because of m -> v position mapper we can be sure checkbox is always at the beginning.
		const oldCheckmarkElement = viewItem.getChild( 0 );
		const newCheckmarkElement = createCheckmarkElement( data.item, viewWriter, isChecked, onCheckedChange );

		viewWriter.insert( viewWriter.createPositionAfter( oldCheckmarkElement ), newCheckmarkElement );
		viewWriter.remove( oldCheckmarkElement );
	};
}

/**
 * A model-to-view position at zero offset mapper.
 *
 * This helper ensures that position inside todo-list in the view is mapped after the checkbox.
 *
 * It only handles the position at the beginning of a list item as other positions are properly mapped be the default mapper.
 *
 * @param {module:engine/view/view~View} view
 * @param {module:engine/conversion/mapper~Mapper} mapper
 * @return {Function}
 */
export function mapModelToViewZeroOffsetPosition( view, mapper ) {
	return ( evt, data ) => {
		const modelPosition = data.modelPosition;
		const parent = modelPosition.parent;

		// Handle only position at the beginning of a todo list item.
		if ( !parent.is( 'listItem' ) || parent.getAttribute( 'listType' ) != 'todo' || modelPosition.offset !== 0 ) {
			return;
		}

		const viewLi = mapper.toViewElement( parent );
		const label = findLabel( viewLi, view );

		// If there is no label then most probably the default converter was overridden.
		if ( !label ) {
			return;
		}

		// Map the position to the next sibling (if it is not a marker) - most likely it will be a text node...
		if ( label.nextSibling && !label.nextSibling.is( 'uiElement' ) ) {
			data.viewPosition = view.createPositionAt( label.nextSibling, 0 );
		}
		// ... otherwise return position after the label.
		else {
			data.viewPosition = view.createPositionAfter( label );
		}
	};
}

// Creates a checkbox UI element.
//
// @private
// @param {module:engine/model/item~Item} modelItem
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @param {Boolean} isChecked
// @param {Function} onChange
// @returns {module:view/uielement~UIElement}
function createCheckmarkElement( modelItem, viewWriter, isChecked, onChange ) {
	const uiElement = viewWriter.createUIElement(
		'label',
		{
			class: 'todo-list__label',
			contenteditable: false
		},
		function( domDocument ) {
			const checkbox = createElement( document, 'input', { type: 'checkbox' } );

			if ( isChecked ) {
				checkbox.setAttribute( 'checked', 'checked' );
			}

			checkbox.addEventListener( 'change', () => onChange( modelItem ) );

			const domElement = this.toDomElement( domDocument );

			domElement.appendChild( checkbox );

			return domElement;
		}
	);

	return uiElement;
}

// Helper method to find label element inside li.
function findLabel( viewItem, view ) {
	const range = view.createRangeIn( viewItem );

	for ( const value of range ) {
		if ( value.item.is( 'uiElement', 'label' ) ) {
			return value.item;
		}
	}
}
