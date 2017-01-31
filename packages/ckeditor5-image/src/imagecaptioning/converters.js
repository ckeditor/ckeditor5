/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaptioning/converters
 */

import { isImage } from '../utils';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import viewWriter from '@ckeditor/ckeditor5-engine/src/view/writer';

/**
 * Creates a converter that converts image caption model element to view element.
 *
 * @param {Function|module:engine/view/element~Element} elementCreator
 * @return {Function}
 */
export function captionModelToView( elementCreator ) {
	const insertConverter = insertElementAtEnd( elementCreator );

	return ( evt, data, consumable, conversionApi ) => {
		const captionElement = data.item;

		if ( isImage( captionElement.parent ) && ( captionElement.childCount > 0 ) ) {
			insertConverter( evt, data, consumable, conversionApi );
		}
	};
}

// Returns converter that converts inserting operation to view element that is inserted at the end of its parent.
//
// @private
// @param {Function|module:engine/view/element~Element} elementCreator
// @return {Function}
function insertElementAtEnd( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const imageFigure = conversionApi.mapper.toViewElement( data.range.start.parent );
		const viewPosition = ViewPosition.createAt( imageFigure, 'end' );

		const viewElement = ( elementCreator instanceof ViewElement ) ?
			elementCreator.clone( true ) :
			elementCreator( data, consumable, conversionApi );

		conversionApi.mapper.bindElements( data.item, viewElement );
		viewWriter.insert( viewPosition, viewElement );
	};
}
