/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import InsertParagraphCommand from '../src/insertparagraphcommand';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'InsertParagraphCommand', () => {
	let editor, model, document, command, root, schema;

	beforeEach( () => {
		return ModelTestEditor.create().then( newEditor => {
			editor = newEditor;
			model = editor.model;
			document = model.document;
			schema = model.schema;
			command = new InsertParagraphCommand( editor );
			root = document.getRoot();

			editor.commands.add( 'insertParagraph', command );
			schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			schema.register( 'heading1', { inheritAllFrom: '$block', allowIn: 'headersOnly' } );
			schema.register( 'headersOnly', { inheritAllFrom: '$block' } );
		} );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'execute()', () => {
		it( 'should insert a paragraph before the provided model element and anchor the selection inside of it', () => {
			setData( model, '<heading1>foo[]</heading1>' );

			command.execute( {
				element: root.getChild( 0 ),
				position: 'before'
			} );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph><heading1>foo</heading1>' );
		} );

		it( 'should insert a paragraph after the provided model element and anchor the selection inside of it', () => {
			setData( model, '<heading1>foo[]</heading1>' );

			command.execute( {
				element: root.getChild( 0 ),
				position: 'after'
			} );

			expect( getData( model ) ).to.equal( '<heading1>foo</heading1><paragraph>[]</paragraph>' );
		} );

		it( 'should do nothing if the paragraph is not allowed in the provided context', () => {
			setData( model, '<headersOnly><heading1>foo[]</heading1></headersOnly>' );

			command.execute( {
				element: root.getChild( 0 ).getChild( 0 ),
				position: 'before'
			} );

			command.execute( {
				element: root.getChild( 0 ).getChild( 0 ),
				position: 'after'
			} );

			expect( getData( model ) ).to.equal( '<headersOnly><heading1>foo[]</heading1></headersOnly>' );
		} );

		describe( 'interation with existing paragraphs in the content', () => {
			it( 'should insert a paragraph before another paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( {
					element: root.getChild( 0 ),
					position: 'before'
				} );

				expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph><paragraph>foo</paragraph>' );
			} );

			it( 'should insert a paragraph after another paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( {
					element: root.getChild( 0 ),
					position: 'after'
				} );

				expect( getData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[]</paragraph>' );
			} );

			it( 'should not merge with a paragraph that precedes the model element before which a new paragraph is inserted', () => {
				setData( model, '<paragraph>bar</paragraph><heading1>foo[]</heading1>' );

				command.execute( {
					element: root.getChild( 1 ),
					position: 'before'
				} );

				expect( getData( model ) ).to.equal( '<paragraph>bar</paragraph><paragraph>[]</paragraph><heading1>foo</heading1>' );
			} );

			it( 'should not merge with a paragraph that follows the model element before which a new paragraph is inserted', () => {
				setData( model, '<heading1>foo[]</heading1><paragraph>bar</paragraph>' );

				command.execute( {
					element: root.getChild( 0 ),
					position: 'after'
				} );

				expect( getData( model ) ).to.equal( '<heading1>foo</heading1><paragraph>[]</paragraph><paragraph>bar</paragraph>' );
			} );
		} );
	} );
} );
