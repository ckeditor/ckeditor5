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
			schema.register( 'allowP', { inheritAllFrom: '$block' } );
			schema.register( 'disallowP', { inheritAllFrom: '$block', allowIn: [ 'allowP' ] } );
			model.schema.extend( 'paragraph', { allowIn: [ 'allowP' ] } );
		} );
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'execute()', () => {
		it( 'should insert a paragraph at a specific document position and anchor the selection inside of it', () => {
			setData( model, '<heading1>foo[]</heading1>' );

			command.execute( {
				position: model.createPositionBefore( root.getChild( 0 ) )
			} );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph><heading1>foo</heading1>' );
		} );

		it( 'should split ancestors down to a limit where a paragraph is allowed', () => {
			setData( model, '<allowP><disallowP>foo</disallowP></allowP>' );

			command.execute( {
				// fo[]o
				position: model.createPositionAt( root.getChild( 0 ).getChild( 0 ), 2 )
			} );

			expect( getData( model ) ).to.equal(
				'<allowP>' +
					'<disallowP>fo</disallowP>' +
					'<paragraph>[]</paragraph>' +
					'<disallowP>o</disallowP>' +
				'</allowP>'
			);
		} );

		it( 'should do nothing if the paragraph is not allowed at the provided position', () => {
			// Create a situation where "paragraph" is disallowed even in the "root".
			schema.addChildCheck( ( context, childDefinition ) => {
				if ( context.endsWith( '$root' ) && childDefinition.name == 'paragraph' ) {
					return false;
				}
			} );

			setData( model, '<heading1>foo[]</heading1>' );

			command.execute( {
				position: model.createPositionBefore( root.getChild( 0 ) )
			} );

			expect( getData( model ) ).to.equal( '<heading1>foo[]</heading1>' );
		} );

		describe( 'interation with existing paragraphs in the content', () => {
			it( 'should insert a paragraph before another paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( {
					position: model.createPositionBefore( root.getChild( 0 ) )
				} );

				expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph><paragraph>foo</paragraph>' );
			} );

			it( 'should insert a paragraph after another paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				command.execute( {
					position: model.createPositionAfter( root.getChild( 0 ) )
				} );

				expect( getData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[]</paragraph>' );
			} );

			it( 'should not merge with a paragraph that precedes the position at which a new paragraph is inserted', () => {
				setData( model, '<paragraph>bar</paragraph><heading1>foo[]</heading1>' );

				command.execute( {
					position: model.createPositionBefore( root.getChild( 1 ) )
				} );

				expect( getData( model ) ).to.equal( '<paragraph>bar</paragraph><paragraph>[]</paragraph><heading1>foo</heading1>' );
			} );

			it( 'should not merge with a paragraph that follows the position at which a new paragraph is inserted', () => {
				setData( model, '<heading1>foo[]</heading1><paragraph>bar</paragraph>' );

				command.execute( {
					position: model.createPositionAfter( root.getChild( 0 ) )
				} );

				expect( getData( model ) ).to.equal( '<heading1>foo</heading1><paragraph>[]</paragraph><paragraph>bar</paragraph>' );
			} );
		} );
	} );
} );
