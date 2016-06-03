/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ModelTestEditor from '/tests/ckeditor5/_utils/modeltesteditor.js';
import FormatsCommand from '/ckeditor5/formats/formatscommand.js';
import Range from '/ckeditor5/engine/model/range.js';
import { setData, getData } from '/tests/engine/_utils/model.js';

const formats = [
	{ id: 'paragraph', viewElement: 'p', default: true },
	{ id: 'heading1', viewElement: 'h2' },
	{ id: 'heading2', viewElement: 'h3' },
	{ id: 'heading3', viewElement: 'h4' }
];

describe( 'FormatsCommand', () => {
	let editor, document, command, root;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				command = new FormatsCommand( editor, formats );
				const schema = document.schema;

				for ( let format of formats ) {
					schema.registerItem( format.id, '$block' );
				}

				schema.registerItem( 'b', '$inline' );
				root = document.getRoot();
			} );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'value', () => {
		for ( let format of formats ) {
			test( format );
		}

		function test( format ) {
			it( `equals ${ format.id } when collapsed selection is placed inside ${ format.id } element`, () => {
				setData( document, `<${ format.id }>foobar</${ format.id }>` );
				const element = root.getChild( 0 );
				document.selection.addRange( Range.createFromParentsAndOffsets( element, 3, element, 3 ) );

				expect( command.format ).to.equal( format );
			} );
		}
	} );

	describe( '_doExecute', () => {
		describe( 'collapsed selection', () => {
			let convertTo = formats[ formats.length - 1 ];

			for ( let format of formats ) {
				test( format, convertTo );
				convertTo = format;
			}

			it( 'uses paragraph as default value', () => {
				setData( document, '<heading1>foo<selection />bar</heading1>' );
				command._doExecute();

				expect( getData( document ) ).to.equal( '<paragraph>foo<selection />bar</paragraph>' );
			} );

			it( 'converts to default format when executed with already applied format', () => {
				setData( document, '<heading1>foo<selection />bar</heading1>' );
				command._doExecute( 'heading1' );

				expect( getData( document ) ).to.equal( '<paragraph>foo<selection />bar</paragraph>' );
			} );

			function test( from, to ) {
				it( `converts ${ from.id } to ${ to.id } on collapsed selection`, () => {
					setData( document, `<${ from.id }>foo<selection />bar</${ from.id }>` );
					command._doExecute( to.id );

					expect( getData( document ) ).to.equal( `<${ to.id }>foo<selection />bar</${ to.id }>` );
				} );
			}
		} );

		describe( 'non-collapsed selection', () => {
			let convertTo = formats[ formats.length - 1 ];

			for ( let format of formats ) {
				test( format, convertTo );
				convertTo = format;
			}

			it( 'converts all elements where selection is applied', () => {
				setData( document, '<heading1>foo<selection></heading1><heading2>bar</heading2><heading2></selection>baz</heading2>' );
				command._doExecute( 'paragraph' );

				expect( getData( document ) ).to.equal(
					'<paragraph>foo<selection></paragraph><paragraph>bar</paragraph><paragraph></selection>baz</paragraph>'
				);
			} );

			it( 'resets to default value all elements with same format', () => {
				setData( document, '<heading1>foo<selection></heading1><heading1>bar</heading1><heading2></selection>baz</heading2>' );
				command._doExecute( 'heading1' );

				expect( getData( document ) ).to.equal(
					'<paragraph>foo<selection></paragraph><paragraph>bar</paragraph><heading2></selection>baz</heading2>'
				);
			} );

			function test( from, to ) {
				it( `converts ${ from.id } to ${ to.id } on non-collapsed selection`, () => {
					setData( document, `<${ from.id }>foo<selection>bar</${ from.id }><${ from.id }>baz</selection>qux</${ from.id }>` );
					command._doExecute( to.id );

					expect( getData( document ) ).to.equal( `<${ to.id }>foo<selection>bar</${ to.id }><${ to.id }>baz</selection>qux</${ to.id }>` );
				} );
			}
		} );
	} );
} );
