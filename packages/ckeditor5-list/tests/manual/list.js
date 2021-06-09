/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import List from '../../src/list';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { uid } from '@ckeditor/ckeditor5-utils';

function AddRenderCount( editor ) {
	let insertCount = 0;

	const nextInsert = () => insertCount++;

	editor.conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( 'insert', ( event, data, conversionApi ) => {
		const view = conversionApi.mapper.toViewElement( data.item );

		if ( view ) {
			const insertCount = nextInsert();

			conversionApi.writer.setAttribute( 'data-insert-count', `${ insertCount }`, view );
			conversionApi.writer.setAttribute( 'title', `Insertion counter: ${ insertCount }`, view );
		}
	}, { priority: 'lowest' } ) );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Heading, Paragraph, Undo, List, Clipboard, Alignment, AddRenderCount ],
		toolbar: [ 'heading', '|', 'bulletedList', 'numberedList', '|', 'alignment', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;

		setData();
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const actions = {
	'Reset': () => setData(),
	'Indent at 1': ( writer, root ) => {
		writer.setAttribute( 'listIndent', 1, root.getChild( 1 ) );
		writer.setAttribute( 'listItem', uid(), root.getChild( 1 ) );
	},
	'Make list item at 1': ( writer, root ) => {
		const id = uid();

		writer.setAttribute( 'listItem', id, root.getChild( 1 ) );
		writer.setAttribute( 'listItem', id, root.getChild( 2 ) );
	},
	'Remove at 0': ( writer, root ) => {
		writer.remove( root.getChild( 0 ) );
	},
	'Remove at 1': ( writer, root ) => {
		writer.remove( root.getChild( 1 ) );
	},
	'Remove at 2': ( writer, root ) => {
		writer.remove( root.getChild( 2 ) );
	}
};

const actionsContainer = document.querySelector( '#actions' );

for ( const [ name, callback ] of Object.entries( actions ) ) {
	const button = document.createElement( 'button' );

	button.innerText = name;
	button.addEventListener( 'click', () => {
		const model = window.editor.model;

		model.change( writer => {
			const root = model.document.getRoot();

			callback( writer, root );
		} );
	} );

	actionsContainer.appendChild( button );
	actionsContainer.appendChild( document.createTextNode( ' ' ) );
}

function setData() {
	const modelData =
		// eslint-disable-next-line
		'<paragraph>before</paragraph>' +
		'<paragraph listIndent="0" listItem="a0" listType="bulleted">Foo</paragraph>' +
		'<paragraph listIndent="0" listItem="a1" listType="bulleted">Bar</paragraph>' +
		'<paragraph listIndent="0" listItem="a2" listType="bulleted">zzz</paragraph>' +
		'<paragraph>plain</paragraph>' +

		// '<heading1 listIndent="0" listItem="b" listType="bulleted">Aaa</heading1>' +
		// '<paragraph listIndent="0" listItem="b" listType="bulleted">Bbb</paragraph>' +
		// 	'<paragraph listIndent="1" listItem="c" listType="bulleted">Nested</paragraph>' +
		// '<paragraph listIndent="0" listItem="b" listType="bulleted">Ccc</paragraph>' +
		//
		// '<paragraph listIndent="0" listItem="x" listType="numbered">Xxx</paragraph>' +
		// 	'<paragraph listIndent="1" listItem="y" listType="numbered">Yyy</paragraph>' +
		// 		'<paragraph listIndent="2" listItem="z" listType="bulleted">Zzz</paragraph>' +
		// 	'<paragraph listIndent="1" listItem="y" listType="numbered">Yyy2</paragraph>' +
		// 		'<paragraph listIndent="2" listItem="zz" listType="bulleted">Zzz2</paragraph>' +
		// 			'<paragraph listIndent="3" listItem="zzz" listType="bulleted">Zzz3</paragraph>' +
		// 	'<paragraph listIndent="1" listItem="yaaaa" listType="numbered">Yyy3</paragraph>' +
		// '<paragraph listIndent="0" listItem="x" listType="numbered">aaaaaa</paragraph>' +
		// '<paragraph listIndent="0" listItem="xa" listType="numbered">bbbbb</paragraph>' +

		''
	;

	setModelData( window.editor.model, modelData, { batchType: 'transparent' } );
}
