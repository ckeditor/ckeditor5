/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaptioning/imagecaptioningengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ModelTreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import ViewMatcher from '@ckeditor/ckeditor5-engine/src/view/matcher';

export default class ImageCaptioningEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const document = editor.document;
		const schema = document.schema;
		const data = editor.data;

		// Schema configuration.
		schema.registerItem( 'caption' );
		schema.allow( { name: '$inline', inside: 'caption' } );
		schema.allow( { name: 'caption', inside: 'image' } );

		// Add caption element to each image without it.
		// document.on( 'change', insertCaptionElement );

		// View to model converter for data pipeline.
		// const matcher = new ViewMatcher( ( element ) => {
		// 	const parent = element.parent;
		//
		// 	if ( element.name == 'figcaption' && parent && parent.name == 'figure' && parent.hasClass( 'image' ) ) {
		// 		return { name: true };
		// 	}
		//
		// 	return null;
		// } );

		// buildViewConverter()
		// 	.for( data.viewToModel )
		// 	.fromElement( 'figcaption' )
		// 	.toElement( 'caption' );
	}
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

		if ( value.type == 'elementStart' && item.name == 'image' && !hasCaption( item ) ) {
			// Using batch of insertion.
			// TODO: Should I use enqChanges?
			batch.insert( ModelPosition.createAt( item, 'end' ), new ModelElement( 'caption' ) );
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
