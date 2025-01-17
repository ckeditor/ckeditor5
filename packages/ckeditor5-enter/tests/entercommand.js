/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import EnterCommand from '../src/entercommand.js';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'EnterCommand', () => {
	let editor, model, doc, schema, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;

				command = new EnterCommand( editor );
				editor.commands.add( 'enter', command );

				schema = model.schema;

				// Note: We could use real names like 'paragraph', but that would make test patterns too long.
				// Plus, this is actually a good test that the algorithm can be used for any model.
				schema.register( 'img', { allowWhere: '$block' } );
				schema.register( 'p', {
					inheritAllFrom: '$block',
					allowIn: 'blockLimit'
				} );
				schema.register( 'h', { inheritAllFrom: '$block' } );
				schema.register( 'inlineLimit', {
					allowIn: 'p',
					isLimit: true
				} );
				schema.register( 'blockLimit', {
					allowIn: '$root',
					isLimit: true
				} );
				schema.extend( '$text', {
					allowIn: [ 'inlineLimit', '$root' ]
				} );
			} );
	} );

	describe( 'EnterCommand', () => {
		it( 'splits a block using parent batch', () => {
			setData( model, '<p>foo[]</p>' );

			model.change( writer => {
				expect( writer.batch.operations ).to.length( 0 );
				editor.execute( 'enter' );
				expect( writer.batch.operations ).to.length.above( 0 );
			} );
		} );
	} );

	describe( 'execute()', () => {
		it( 'uses enterBlock()', () => {
			setData( model, '<p>foo[]bar</p>' );

			sinon.spy( command, 'enterBlock' );

			editor.execute( 'enter' );

			expect( command.enterBlock.called ).to.be.true;
		} );

		it( 'fires afterExecute() event with the current writer as a parameter', done => {
			setData( model, '<p>foo[]bar</p>' );

			let currentWriter;

			command.on( 'afterExecute', ( evt, { writer } ) => {
				expect( writer ).to.equal( currentWriter );

				done();
			} );

			model.change( writer => {
				currentWriter = writer;
				editor.execute( 'enter' );
			} );
		} );
	} );

	describe( 'enterBlock()', () => {
		describe( 'collapsed selection', () => {
			test(
				'does nothing in the root',
				'foo[]bar',
				'foo[]bar'
			);

			test(
				'splits block',
				'<p>x</p><p>foo[]bar</p><p>y</p>',
				'<p>x</p><p>foo</p><p>[]bar</p><p>y</p>'
			);

			test(
				'splits block at the end',
				'<p>x</p><p>foo[]</p><p>y</p>',
				'<p>x</p><p>foo</p><p>[]</p><p>y</p>'
			);

			test(
				'splits block at the beginning',
				'<p>x</p><p>[]foo</p><p>y</p>',
				'<p>x</p><p></p><p>[]foo</p><p>y</p>'
			);

			test(
				'inserts new block after empty one',
				'<p>x</p><p>[]</p><p>y</p>',
				'<p>x</p><p></p><p>[]</p><p>y</p>'
			);

			describe( 'copyOnEnter', () => {
				beforeEach( () => {
					schema.extend( '$text', { allowAttributes: [ 'foo', 'bar' ] } );
					schema.setAttributeProperties( 'foo', { copyOnEnter: true } );
				} );

				test(
					'allowed attributes are copied',
					'<p><$text foo="true">test[]</$text></p>',
					'<p><$text foo="true">test</$text></p><p selection:foo="true"><$text foo="true">[]</$text></p>'
				);

				test(
					'unknown attributes are not copied',
					'<p><$text bar="true">test[]</$text></p>',
					'<p><$text bar="true">test</$text></p><p>[]</p>'
				);

				test(
					'only allowed attributes are copied from mix set',
					'<p><$text bar="true" foo="true">test[]</$text></p>',
					'<p><$text bar="true" foo="true">test</$text></p><p selection:foo="true"><$text foo="true">[]</$text></p>'
				);
			} );
		} );

		describe( 'non-collapsed selection', () => {
			test(
				'only deletes the content when directly in the root',
				'fo[ob]ar',
				'fo[]ar'
			);

			test(
				'deletes text and splits',
				'<p>ab[cd]ef</p><p>ghi</p>',
				'<p>ab</p><p>[]ef</p><p>ghi</p>'
			);

			test(
				'places selection in the 2nd element',
				'<h>ab[c</h><p>d]ef</p><p>ghi</p>',
				'<h>ab</h><p>[]ef</p><p>ghi</p>'
			);

			test(
				'leaves one empty element after one was fully selected',
				'<p>x</p><p>[abcdef]</p><p>y</p>',
				'<p>x</p><p>[]</p><p>y</p>'
			);

			test(
				'leaves one empty element after two were fully selected',
				'<p>[abc</p><p>def]</p>',
				'<p>[]</p>'
			);

			test(
				'should not break inline limit elements - collapsed',
				'<p><inlineLimit>foo[]bar</inlineLimit></p>',
				'<p><inlineLimit>foo[]bar</inlineLimit></p>'
			);

			test(
				'should not break inline limit elements',
				'<p><inlineLimit>foo[bar]baz</inlineLimit></p>',
				'<p><inlineLimit>foo[]baz</inlineLimit></p>'
			);

			it( 'should not break inline limit elements - selection partially inside', () => {
				// Wrap all changes in one block to avoid post-fixing the selection (which is incorret) in the meantime.
				model.change( () => {
					setData( model, '<p><inlineLimit>ba[r</inlineLimit></p><p>f]oo</p>' );

					model.change( writer => {
						command.enterBlock( writer );
					} );

					expect( getData( model ) ).to.equal( '<p><inlineLimit>ba[r</inlineLimit></p><p>f]oo</p>' );
				} );
			} );

			test(
				'should break paragraph in blockLimit',
				'<blockLimit><p>foo[]bar</p></blockLimit>',
				'<blockLimit><p>foo</p><p>[]bar</p></blockLimit>'
			);

			it( 'leaves one empty element after two were fully selected (backward)', () => {
				setData( model, '<p>[abc</p><p>def]</p>' );
				// @TODO: Add option for setting selection direction to model utils.
				doc.selection._lastRangeBackward = true;

				model.change( writer => {
					command.enterBlock( writer );
				} );

				expect( getData( model ) ).to.equal( '<p>[]</p>' );
			} );

			it( 'uses DataController.deleteContent', () => {
				const spy = sinon.spy();

				editor.model.on( 'deleteContent', spy );

				setData( model, '<p>[x]</p>' );

				model.change( writer => {
					command.enterBlock( writer );
				} );

				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		function test( title, input, output ) {
			it( title, () => {
				setData( model, input );

				model.change( writer => {
					command.enterBlock( writer );
				} );

				expect( getData( model ) ).to.equal( output );
			} );
		}
	} );
} );
