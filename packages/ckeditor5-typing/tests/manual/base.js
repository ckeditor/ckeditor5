/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import CKEDITOR from '/ckeditor.js';
import ClassicCreator from '/ckeditor5/creator-classic/classiccreator.js';
import ModelElement from '/ckeditor5/engine/model/element.js';
import ViewContainerElement from '/ckeditor5/engine/view/containerelement.js';
// import Text from '/ckeditor5/engine/view/text.js';
import ModelPosition from '/ckeditor5/engine/model/position.js';
// import { getData } from '/tests/engine/_utils/model.js';
import { insertElement } from '/ckeditor5/engine/conversion/model-to-view-converters.js';

CKEDITOR.create( '#editor', {
	creator: ClassicCreator,
	features: [ 'typing', 'delete', 'enter' ],
	toolbar: []
} )
.then( editor => {
	const doc = editor.document;
	const editingView = editor.editing.view;

	editor.editing.toView.on( 'insert:paragraph', insertElement( new ViewContainerElement( 'p' ) ) );

	doc.batch().insert(
		new ModelPosition( doc.getRoot( 'editor' ), [ 0 ] ),
		[
			new ModelElement( 'paragraph', null, 'foobar' ),
			new ModelElement( 'paragraph' ),
			new ModelElement( 'paragraph', null, 'barfoo' )
		]
	);

	editingView.render();

	// console.log( getData( doc, { rootName: 'editor' } ) );

	// editingView.viewRoots.get( 'editor' ).appendChildren( [
	// 	new Element( 'h1', null, [ new Text( 'Hello world!' ) ] ),
	// 	new Element( 'p', null, [ new Element( 'br' ) ] ),
	// 	new Element( 'p', null, [ new Text( 'I\'m an instance of CKEditor.' ) ] )
	// ] );

	// editingView.render();

	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );  // jshint ignore:line
} );
