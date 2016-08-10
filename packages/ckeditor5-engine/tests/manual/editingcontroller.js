/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import EditingController from '/ckeditor5/engine/editingcontroller.js';
import Document from '/ckeditor5/engine/model/document.js';
import ModelRange from '/ckeditor5/engine/model/range.js';

import { setData } from '/tests/engine/_utils/model.js';

import buildModelConverter from '/ckeditor5/engine/conversion/buildmodelconverter.js';

const model = new Document();
model.createRoot();

const editing = new EditingController( model );
editing.createRoot( document.getElementById( 'editor' ) );

model.schema.registerItem( 'paragraph', '$block' );
buildModelConverter().for( editing.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

setData( model,
	'<paragraph>foo</paragraph>' +
	'<paragraph></paragraph>' +
	'<paragraph>bar</paragraph>' );

editing.view.focus();

// enter
editing.view.on( 'keydown', ( evt, data ) => {
	if ( data.keyCode == 13 ) {
		model.enqueueChanges( () => {
			model.batch().split( model.selection.getFirstPosition() );
		} );
	}
} );

// delete
editing.view.on( 'keydown', ( evt, data ) => {
	if ( data.keyCode == 46 ) {
		model.enqueueChanges( () => {
			model.batch().remove( ModelRange.createFromPositionAndShift( model.selection.getFirstPosition(), 1 ) );
		} );
	}
} );
