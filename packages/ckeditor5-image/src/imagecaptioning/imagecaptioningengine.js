/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaptioning/imagecaptioningengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ModelTreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';
// import { insertElement } from '@ckeditor/ckeditor5-engine/src/conversion/model-to-view-converters';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import viewWriter from '@ckeditor/ckeditor5-engine/src/view/writer';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import ViewMatcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import { isImage } from '../utils';

// TODO: move to the ImageCaptioning
import '../../theme/imagecaptioning/theme.scss';

export default class ImageCaptioningEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const document = editor.document;
		const schema = document.schema;
		const data = editor.data;
		const editing = editor.editing;

		// Schema configuration.
		schema.registerItem( 'caption' );
		schema.allow( { name: '$inline', inside: 'caption' } );
		schema.allow( { name: 'caption', inside: 'image' } );

		// Add caption element to each image inserted without it.
		document.on( 'change', insertCaptionElement );

		// View to model converter for data pipeline.
		const matcher = new ViewMatcher( ( element ) => {
			const parent = element.parent;

			// Convert only captions for images.
			if ( element.name == 'figcaption' && parent && parent.name == 'figure' && parent.hasClass( 'image' ) ) {
				return { name: true };
			}

			return null;
		} );

		buildViewConverter()
			.for( data.viewToModel )
			.from( matcher )
			.toElement( 'caption' );

		// Model to view converter for data pipeline.
		data.modelToView.on(
			'insert:caption',
			captionModelToView( new ViewEditableElement( 'figcaption' ), false )
		);

		// Model to view converter for editing pipeline.
		editing.modelToView.on(
			'insert:caption',
			captionModelToView( new ViewEditableElement( 'figcaption', { contenteditable: true } ) )
		);
	}
}

function captionModelToView( element, convertEmpty = true ) {
	const insertConverter = insertElement( element );

	return ( evt, data, consumable, conversionApi ) => {
		const captionElement = data.item;

		if ( isImage( captionElement.parent ) && ( convertEmpty || captionElement.childCount > 0 ) ) {
			insertConverter( evt, data, consumable, conversionApi );
		}
	};
}

function insertCaptionElement( evt, changeType, data, batch ) {
	if ( changeType !== 'insert' ) {
		return;
	}

	const walker = new ModelTreeWalker( {
		boundaries: data.range,
		ignoreElementEnd: true
	} );

	for ( let value of walker ) {
		const item = value.item;

		if ( value.type == 'elementStart' && isImage( item ) && !hasCaption( item ) ) {
			// Using batch of insertion.
			batch.document.enqueueChanges( () => {
				batch.insert( ModelPosition.createAt( item, 'end' ), new ModelElement( 'caption' ) );
			} );
		}
	}
}

function hasCaption( image ) {
	for ( let node of image.getChildren() ) {
		if ( node instanceof ModelElement && node.name == 'caption' ) {
			return true;
		}
	}

	return false;
}

function insertElement( elementCreator ) {
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
