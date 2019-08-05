/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolistconverters
 */

import { createCheckMarkElement } from './todolistutils';

export function modelViewTextInsertion( evt, data, conversionApi ) {
	const parent = data.range.start.parent;

	if ( parent.name != 'listItem' || parent.getAttribute( 'listType' ) != 'todo' ) {
		return;
	}

	conversionApi.consumable.consume( data.item, 'insert' );

	const viewWriter = conversionApi.writer;
	const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
	const viewText = viewWriter.createText( data.item.data );

	viewWriter.insert( viewPosition.offset ? viewPosition : viewPosition.getShiftedBy( 1 ), viewText );
}

export function modelViewChangeChecked( model ) {
	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, 'attribute:listChecked' ) ) {
			return;
		}

		const { mapper, writer: viewWriter } = conversionApi;
		const isChecked = !!data.item.getAttribute( 'listChecked' );
		const viewItem = mapper.toViewElement( data.item );
		const uiElement = findCheckmarkElement( viewWriter, viewItem );

		viewWriter.insert(
			viewWriter.createPositionAfter( uiElement ),
			createCheckMarkElement( isChecked, viewWriter, isChecked => {
				model.change( writer => writer.setAttribute( 'listChecked', isChecked, data.item ) );
			} )
		);
		viewWriter.remove( uiElement );
	};
}

function findCheckmarkElement( viewWriter, parent ) {
	for ( const item of viewWriter.createRangeIn( parent ).getItems() ) {
		if ( item.is( 'uiElement' ) && item.hasClass( 'todo-list__checkmark' ) ) {
			return item;
		}
	}
}
