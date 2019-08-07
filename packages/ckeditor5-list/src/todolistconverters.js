/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolistconverters
 */

/* global document */

import { generateLiInUl, injectViewList, findInRange } from './utils';

/**
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {Function} Returns a conversion callback.
 */
export function modelViewInsertion( model ) {
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
		consumable.consume( data.item, 'attribute:todoListChecked' );

		const viewWriter = conversionApi.writer;
		const modelItem = data.item;
		const viewItem = generateLiInUl( modelItem, conversionApi );

		addTodoElementsToListItem( modelItem, viewItem, viewWriter, model );
		injectViewList( modelItem, viewItem, conversionApi, model );
	};
}

/**
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert
 * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the fired event.
 * @param {Object} data Additional information about the change.
 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface.
 */
export function modelViewTextInsertion( evt, data, conversionApi ) {
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

	viewWriter.insert( viewPosition.offset ? viewPosition : viewPosition.getShiftedBy( 1 ), viewText );
}

/**
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

		const label = viewWriter.createAttributeElement( 'label' );
		const checkbox = viewWriter.createEmptyElement( 'input', {
			type: 'checkbox',
			disabled: 'disabled',
			class: 'todo-list__checkmark'
		} );

		if ( data.item.getAttribute( 'todoListChecked' ) ) {
			viewWriter.setAttribute( 'checked', 'checked', checkbox );
		}

		viewWriter.insert( viewWriter.createPositionAt( viewItem, 0 ), checkbox );
		viewWriter.wrap( viewWriter.createRangeOn( checkbox ), label );

		injectViewList( modelItem, viewItem, conversionApi, model );
	};
}

/**
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
	const span = viewWriter.createAttributeElement( 'span', { class: 'todo-list__label' } );
	const label = viewWriter.createAttributeElement( 'label' );

	viewWriter.insert( viewWriter.createPositionAt( viewPosition.parent, 'end' ), viewText );
	viewWriter.wrap( viewWriter.createRangeOn( viewText ), span );
	viewWriter.wrap( viewWriter.createRangeOn( viewText.parent ), label );
}

/**
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {Function} Returns a conversion callback.
 */
export function modelViewChangeType( model ) {
	return ( evt, data, conversionApi ) => {
		const viewItem = conversionApi.mapper.toViewElement( data.item );
		const viewWriter = conversionApi.writer;

		// Add or remove checkbox for toto list.
		if ( data.attributeNewValue == 'todo' ) {
			addTodoElementsToListItem( data.item, viewItem, viewWriter, model );
		} else if ( data.attributeOldValue == 'todo' ) {
			removeTodoElementsFromListItem( data.item, viewItem, viewWriter, model );
		}
	};
}

/**
 * @see module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute
 * @param {module:engine/model/model~Model} model Model instance.
 * @returns {Function} Returns a conversion callback.
 */
export function modelViewChangeChecked( model ) {
	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, 'attribute:todoListChecked' ) ) {
			return;
		}

		const { mapper, writer: viewWriter } = conversionApi;
		const isChecked = !!data.item.getAttribute( 'todoListChecked' );
		const viewItem = mapper.toViewElement( data.item );
		const itemRange = viewWriter.createRangeIn( viewItem );
		const uiElement = findInRange( itemRange, item => item.is( 'uiElement' ) ? item : false );

		viewWriter.insert(
			viewWriter.createPositionAfter( uiElement ),
			createCheckMarkElement( isChecked, viewWriter, isChecked => {
				model.change( writer => writer.setAttribute( 'todoListChecked', isChecked, data.item ) );
			} )
		);
		viewWriter.remove( uiElement );
	};
}

function addTodoElementsToListItem( modelItem, viewItem, viewWriter, model ) {
	const isChecked = !!modelItem.getAttribute( 'todoListChecked' );

	viewWriter.addClass( 'todo-list', viewItem.parent );

	viewWriter.insert(
		viewWriter.createPositionAt( viewItem, 0 ),
		createCheckMarkElement( isChecked, viewWriter, isChecked => {
			model.change( writer => writer.setAttribute( 'todoListChecked', isChecked, modelItem ) );
		} )
	);
}

function removeTodoElementsFromListItem( modelItem, viewItem, viewWriter, model ) {
	viewWriter.removeClass( 'todo-list', viewItem.parent );
	viewWriter.remove( viewItem.getChild( 0 ) );
	model.change( writer => writer.removeAttribute( 'todoListChecked', modelItem ) );
}

function createCheckMarkElement( isChecked, viewWriter, onChange ) {
	const uiElement = viewWriter.createUIElement(
		'label',
		{
			class: 'todo-list__checkmark',
			contenteditable: false
		},
		function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			const checkbox = document.createElement( 'input' );

			checkbox.type = 'checkbox';
			checkbox.checked = isChecked;
			checkbox.addEventListener( 'change', evt => onChange( evt.target.checked ) );
			domElement.appendChild( checkbox );

			return domElement;
		}
	);

	if ( isChecked ) {
		viewWriter.addClass( 'todo-list__checkmark_checked', uiElement );
	}

	return uiElement;
}
