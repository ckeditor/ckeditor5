/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/legacytodolist/legacytodolistconverters
 */

import type {
	DowncastAttributeEvent,
	DowncastInsertEvent,
	DowncastWriter,
	Element,
	MapperModelToViewPositionEvent,
	Model,
	UpcastElementEvent,
	EditingView,
	ViewElement
} from 'ckeditor5/src/engine.js';

import { createElement, type GetCallback } from 'ckeditor5/src/utils.js';

import { generateLiInUl, injectViewList, positionAfterUiElements, findNestedList } from '../legacylist/legacyutils.js';

/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It converts the `listItem` model element to an unordered list with a {@link module:engine/view/uielement~UIElement checkbox element}
 * at the beginning of each list item. It also merges the list with surrounding lists (if available).
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param model Model instance.
 * @param onCheckboxChecked Callback function.
 * @returns Returns a conversion callback.
 */
export function modelViewInsertion(
	model: Model,
	onCheckboxChecked: ( element: Element ) => void
): GetCallback<DowncastInsertEvent<Element>> {
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

		const span = viewWriter.createContainerElement( 'span', {
			class: 'todo-list__label__description'
		} );

		viewWriter.addClass( 'todo-list', viewItem.parent as any );
		viewWriter.insert( viewWriter.createPositionAt( viewItem, 0 ), checkmarkElement );
		viewWriter.insert( viewWriter.createPositionAfter( checkmarkElement ), span );

		injectViewList( modelItem, viewItem, conversionApi, model );
	};
}

/**
 * A model-to-view converter for the `listItem` model element insertion.
 *
 * It is used by {@link module:engine/controller/datacontroller~DataController}.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param model Model instance.
 * @returns Returns a conversion callback.
 */
export function dataModelViewInsertion( model: Model ): GetCallback<DowncastInsertEvent<Element>> {
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

		viewWriter.addClass( 'todo-list', viewItem.parent as any );

		const label = viewWriter.createContainerElement( 'label', {
			class: 'todo-list__label'
		} );

		const checkbox = viewWriter.createEmptyElement( 'input', {
			type: 'checkbox',
			disabled: 'disabled'
		} );

		const span = viewWriter.createContainerElement( 'span', {
			class: 'todo-list__label__description'
		} );

		if ( modelItem.getAttribute( 'todoListChecked' ) ) {
			viewWriter.setAttribute( 'checked', 'checked', checkbox );
		}

		viewWriter.insert( viewWriter.createPositionAt( viewItem, 0 ), label );
		viewWriter.insert( viewWriter.createPositionAt( label, 0 ), checkbox );
		viewWriter.insert( viewWriter.createPositionAfter( checkbox ), span );

		injectViewList( modelItem, viewItem, conversionApi, model );
	};
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
 */
export const dataViewModelCheckmarkInsertion: GetCallback<UpcastElementEvent> = ( evt, data, conversionApi ) => {
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
};

/**
 * A model-to-view converter for the `listType` attribute change on the `listItem` model element.
 *
 * This change means that the `<li>` element parent changes to `<ul class="todo-list">` and a
 * {@link module:engine/view/uielement~UIElement checkbox UI element} is added at the beginning
 * of the list item element (or vice versa).
 *
 * This converter is preceded by {@link module:list/legacylist/legacyconverters~modelViewChangeType} and followed by
 * {@link module:list/legacylist/legacyconverters~modelViewMergeAfterChangeType} to handle splitting and merging surrounding lists
 * of the same type.
 *
 * It is used by {@link module:engine/controller/editingcontroller~EditingController}.
 *
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param onCheckedChange Callback fired after clicking the checkbox UI element.
 * @param view Editing view controller.
 * @returns Returns a conversion callback.
 */
export function modelViewChangeType(
	onCheckedChange: ( element: Element ) => void,
	view: EditingView
): GetCallback<DowncastAttributeEvent<Element>> {
	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewItem = conversionApi.mapper.toViewElement( data.item )!;
		const viewWriter = conversionApi.writer;

		const labelElement = findLabel( viewItem, view )!;

		if ( data.attributeNewValue == 'todo' ) {
			const isChecked = !!data.item.getAttribute( 'todoListChecked' );
			const checkmarkElement = createCheckmarkElement( data.item, viewWriter, isChecked, onCheckedChange );

			const span = viewWriter.createContainerElement( 'span', {
				class: 'todo-list__label__description'
			} );

			const itemRange = viewWriter.createRangeIn( viewItem );
			const nestedList = findNestedList( viewItem );

			const descriptionStart = positionAfterUiElements( itemRange.start );
			const descriptionEnd = nestedList ? viewWriter.createPositionBefore( nestedList ) : itemRange.end;
			const descriptionRange = viewWriter.createRange( descriptionStart, descriptionEnd );

			viewWriter.addClass( 'todo-list', viewItem.parent as any );
			viewWriter.move( descriptionRange, viewWriter.createPositionAt( span, 0 ) );
			viewWriter.insert( viewWriter.createPositionAt( viewItem, 0 ), checkmarkElement );
			viewWriter.insert( viewWriter.createPositionAfter( checkmarkElement ), span );
		} else if ( data.attributeOldValue == 'todo' ) {
			const descriptionSpan = findDescription( viewItem, view )!;

			viewWriter.removeClass( 'todo-list', viewItem.parent as any );
			viewWriter.remove( labelElement );
			viewWriter.move( viewWriter.createRangeIn( descriptionSpan ), viewWriter.createPositionBefore( descriptionSpan ) );
			viewWriter.remove( descriptionSpan );
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
 * @param onCheckedChange Callback fired after clicking the checkbox UI element.
 * @returns Returns a conversion callback.
 */
export function modelViewChangeChecked(
	onCheckedChange: ( element: Element ) => void
): GetCallback<DowncastAttributeEvent<Element>> {
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
		const viewItem = mapper.toViewElement( data.item )!;
		// Because of m -> v position mapper we can be sure checkbox is always at the beginning.
		const oldCheckmarkElement = viewItem.getChild( 0 )!;
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
 */
export function mapModelToViewPosition( view: EditingView ): GetCallback<MapperModelToViewPositionEvent> {
	return ( evt, data ) => {
		const modelPosition = data.modelPosition;
		const parent = modelPosition.parent;

		if ( !parent.is( 'element', 'listItem' ) || parent.getAttribute( 'listType' ) != 'todo' ) {
			return;
		}

		const viewLi = data.mapper.toViewElement( parent )!;
		const descSpan = findDescription( viewLi, view );

		if ( descSpan ) {
			data.viewPosition = data.mapper.findPositionIn( descSpan, modelPosition.offset );
		}
	};
}

/**
 * Creates a checkbox UI element.
 */
function createCheckmarkElement(
	modelItem: Element,
	viewWriter: DowncastWriter,
	isChecked: boolean,
	onChange: ( element: Element ) => void
) {
	const uiElement = viewWriter.createUIElement(
		'label',
		{
			class: 'todo-list__label',
			contenteditable: false
		},
		function( domDocument ) {
			const checkbox = createElement( document, 'input', { type: 'checkbox', tabindex: '-1' } );

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
function findLabel( viewItem: ViewElement, view: EditingView ) {
	const range = view.createRangeIn( viewItem );

	for ( const value of range ) {
		if ( value.item.is( 'uiElement', 'label' ) ) {
			return value.item;
		}
	}
}

function findDescription( viewItem: ViewElement, view: EditingView ) {
	const range = view.createRangeIn( viewItem );

	for ( const value of range ) {
		if ( value.item.is( 'containerElement', 'span' ) && value.item.hasClass( 'todo-list__label__description' ) ) {
			return value.item;
		}
	}
}
