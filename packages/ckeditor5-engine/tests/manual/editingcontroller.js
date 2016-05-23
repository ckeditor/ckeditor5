/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditingController from '/ckeditor5/engine/editingcontroller.js';
import Document from '/ckeditor5/engine/model/document.js';
import ModelPosition from '/ckeditor5/engine/model/position.js';
import ModelRange from '/ckeditor5/engine/model/range.js';
import ModelDocumentFragment from '/ckeditor5/engine/model/documentfragment.js';

import { parse } from '/tests/engine/_utils/model.js';

import BuildModelConverterFor from '/ckeditor5/engine/conversion/model-converter-builder.js';

const model = new Document();
window.model = model;
model.createRoot();

const editing = new EditingController( model );
editing.createRoot( document.getElementById( 'editor' ) );

model.schema.registerItem( 'paragraph', '$block' );
BuildModelConverterFor( editing.modelToView ).fromElement( 'paragraph' ).toElement( 'p' );

const modelData = new ModelDocumentFragment( parse(
	'<paragraph>foo</paragraph>' +
	'<paragraph></paragraph>' +
	'<paragraph>bar</paragraph>'
)._children );

model.batch().insert( ModelPosition.createAt( model.getRoot(), 0 ), modelData );

editing.view.render();

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
