/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import InsertParagraphCommand from '../src/insertparagraphcommand.js';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

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

			const result = command.execute( {
				position: model.createPositionBefore( root.getChild( 0 ) )
			} );

			expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph><heading1>foo</heading1>' );
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		it( 'should not execute when selection is in non-editable place', () => {
			setData( model, '<heading1>foo[]</heading1>' );

			model.document.isReadOnly = true;
			const result = command.execute( { position: model.createPositionBefore( root.getChild( 0 ) ) } );

			expect( getData( model ) ).to.equal( '<heading1>foo[]</heading1>' );
			expect( result ).to.be.null;
		} );

		it( 'should split ancestors down to a limit where a paragraph is allowed', () => {
			setData( model, '<allowP><disallowP>foo</disallowP></allowP>' );

			const result = command.execute( {
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
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		it( 'should insert paragraph when position is at the end of line', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );

			const result = command.execute( {
				position: model.document.selection.getFirstPosition()
			} );

			expect( getData( model ) ).to.equal(
				'<paragraph>foo</paragraph>' +
				'<paragraph>[]</paragraph>'
			);
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		it( 'should insert paragraph when position is at the end of line with an inline widget', () => {
			schema.register( 'inlineWidget', { inheritAllFrom: '$inlineObject' } );
			setData( model, '<paragraph><inlineWidget></inlineWidget>[]</paragraph>' );

			const result = command.execute( {
				position: model.document.selection.getFirstPosition()
			} );

			expect( getData( model ) ).to.equal(
				'<paragraph><inlineWidget></inlineWidget></paragraph>' +
				'<paragraph>[]</paragraph>'
			);
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		it( 'should insert paragraph when position is at the start of line', () => {
			setData( model, '<paragraph>[]foo</paragraph>' );

			const result = command.execute( {
				position: model.document.selection.getLastPosition()
			} );

			expect( getData( model ) ).to.equal(
				'<paragraph>[]</paragraph>' +
				'<paragraph>foo</paragraph>'
			);
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		it( 'should insert paragraph when position is at the start of line with an inline widget', () => {
			schema.register( 'inlineWidget', { inheritAllFrom: '$inlineObject' } );
			setData( model, '<paragraph>[]<inlineWidget></inlineWidget></paragraph>' );

			const result = command.execute( {
				position: model.document.selection.getLastPosition()
			} );

			expect( getData( model ) ).to.equal(
				'<paragraph>[]</paragraph>' +
				'<paragraph><inlineWidget></inlineWidget></paragraph>'
			);
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		it( 'should insert paragraph bellow when paragraph is empty', () => {
			setData( model, '<paragraph>[]</paragraph>' );

			const result = command.execute( {
				position: model.document.selection.getLastPosition()
			} );

			expect( getData( model ) ).to.equal(
				'<paragraph></paragraph>' +
				'<paragraph>[]</paragraph>'
			);
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/14714.
		it( 'should insert paragraph bellow the block widget (inside container)', () => {
			schema.register( 'blockContainer', { inheritAllFrom: '$container' } );
			schema.register( 'blockWidget', { inheritAllFrom: '$blockObject', allowIn: 'allowP' } );

			setData( model,
				'<blockContainer>' +
					'[<blockWidget></blockWidget>]' +
				'</blockContainer>'
			);

			const result = command.execute( {
				position: model.document.selection.getLastPosition()
			} );

			expect( getData( model ) ).to.equal(
				'<blockContainer>' +
					'<blockWidget></blockWidget>' +
					'<paragraph>[]</paragraph>' +
				'</blockContainer>'
			);
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		// See https://github.com/ckeditor/ckeditor5/issues/14714.
		it( 'should insert paragraph bellow the block widget (inside table cell)', () => {
			schema.register( 'table', { inheritAllFrom: '$blockObject' } );
			schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			schema.register( 'tableCell', {
				allowContentOf: '$container',
				allowIn: 'tableRow',
				isLimit: true,
				isSelectable: true
			} );

			schema.register( 'blockWidget', { inheritAllFrom: '$blockObject' } );

			setData( model,
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'[<blockWidget></blockWidget>]' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);

			const result = command.execute( {
				position: model.document.selection.getLastPosition()
			} );

			expect( getData( model ) ).to.equal(
				'<table>' +
					'<tableRow>' +
						'<tableCell>' +
							'<blockWidget></blockWidget>' +
							'<paragraph>[]</paragraph>' +
						'</tableCell>' +
					'</tableRow>' +
				'</table>'
			);
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		it( 'should do nothing if the paragraph is not allowed at the provided position', () => {
			// Create a situation where "paragraph" is disallowed even in the "root".
			schema.addChildCheck( ( context, childDefinition ) => {
				if ( context.endsWith( '$root' ) && childDefinition.name == 'paragraph' ) {
					return false;
				}
			} );

			setData( model, '<heading1>foo[]</heading1>' );

			const result = command.execute( {
				position: model.createPositionBefore( root.getChild( 0 ) )
			} );

			expect( getData( model ) ).to.equal( '<heading1>foo[]</heading1>' );
			expect( result ).to.be.null;
		} );

		it( 'should insert a paragraph with given attribute', () => {
			model.schema.extend( 'paragraph', {
				allowAttributes: 'foo'
			} );

			setData( model, '<heading1>foo[]</heading1>' );

			const result = command.execute( {
				position: model.createPositionAfter( root.getChild( 0 ) ),
				attributes: { foo: true }
			} );

			expect( getData( model ) ).to.equal( '<heading1>foo</heading1><paragraph foo="true">[]</paragraph>' );
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		it( 'should insert a paragraph with given attributes', () => {
			model.schema.extend( 'paragraph', {
				allowAttributes: [ 'foo', 'bar' ]
			} );

			setData( model, '<heading1>foo[]</heading1>' );

			const result = command.execute( {
				position: model.createPositionAfter( root.getChild( 0 ) ),
				attributes: { foo: true, bar: true }
			} );

			expect( getData( model ) ).to.equal( '<heading1>foo</heading1><paragraph bar="true" foo="true">[]</paragraph>' );
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		it( 'should insert a paragraph with given attributes but discard disallowed ones', () => {
			model.schema.extend( 'paragraph', {
				allowAttributes: [ 'foo', 'bar' ]
			} );

			setData( model, '<heading1>foo[]</heading1>' );

			const result = command.execute( {
				position: model.createPositionAfter( root.getChild( 0 ) ),
				attributes: { foo: true, bar: true, yar: true }
			} );

			expect( getData( model ) ).to.equal( '<heading1>foo</heading1><paragraph bar="true" foo="true">[]</paragraph>' );
			expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
		} );

		describe( 'interation with existing paragraphs in the content', () => {
			it( 'should insert a paragraph before another paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				const result = command.execute( {
					position: model.createPositionBefore( root.getChild( 0 ) )
				} );

				expect( getData( model ) ).to.equal( '<paragraph>[]</paragraph><paragraph>foo</paragraph>' );
				expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
			} );

			it( 'should insert a paragraph after another paragraph', () => {
				setData( model, '<paragraph>foo[]</paragraph>' );

				const result = command.execute( {
					position: model.createPositionAfter( root.getChild( 0 ) )
				} );

				expect( getData( model ) ).to.equal( '<paragraph>foo</paragraph><paragraph>[]</paragraph>' );
				expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
			} );

			it( 'should not merge with a paragraph that precedes the position at which a new paragraph is inserted', () => {
				setData( model, '<paragraph>bar</paragraph><heading1>foo[]</heading1>' );

				const result = command.execute( {
					position: model.createPositionBefore( root.getChild( 1 ) )
				} );

				expect( getData( model ) ).to.equal( '<paragraph>bar</paragraph><paragraph>[]</paragraph><heading1>foo</heading1>' );
				expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
			} );

			it( 'should not merge with a paragraph that follows the position at which a new paragraph is inserted', () => {
				setData( model, '<heading1>foo[]</heading1><paragraph>bar</paragraph>' );

				const result = command.execute( {
					position: model.createPositionAfter( root.getChild( 0 ) )
				} );

				expect( getData( model ) ).to.equal( '<heading1>foo</heading1><paragraph>[]</paragraph><paragraph>bar</paragraph>' );
				expect( result.isEqual( document.selection.getFirstPosition() ) ).to.be.true;
			} );
		} );
	} );
} );
