/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import InsertOperation from '@ckeditor/ckeditor5-engine/src/model/operation/insertoperation';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ShiftEnter from '../src/shiftenter';

describe( 'ShiftEnterCommand', () => {
	let editor, model, doc, schema, command;

	beforeEach( () => {
		return ModelTestEditor.create( { plugins: [ ShiftEnter ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;

				command = editor.commands.get( 'shiftEnter' );

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

	describe( 'ShiftEnterCommand', () => {
		it( 'soft breaks a block using parent batch', () => {
			setData( model, '<p>foo[]</p>' );

			model.change( writer => {
				expect( writer.batch.operations ).to.length( 0 );
				editor.execute( 'shiftEnter' );
				expect( writer.batch.operations ).to.length.above( 0 );
			} );
		} );

		it( 'creates InsertOperation if soft enter is at the beginning of block', () => {
			setData( model, '<p>[]foo</p>' );

			editor.execute( 'shiftEnter' );

			const operations = Array.from( doc.history.getOperations() );

			expect( operations[ operations.length - 1 ] ).to.be.instanceof( InsertOperation );
		} );

		it( 'creates InsertOperation if soft enter is at the end of block', () => {
			setData( model, '<p>foo[]</p>' );

			editor.execute( 'shiftEnter' );

			const operations = Array.from( doc.history.getOperations() );

			expect( operations[ operations.length - 1 ] ).to.be.instanceof( InsertOperation );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'collapsed selection', () => {
			test(
				'inserts in the root',
				'foo[]bar',
				'foo<softBreak></softBreak>[]bar'
			);

			test(
				'inserts inside block',
				'<p>x</p><p>foo[]bar</p><p>y</p>',
				'<p>x</p><p>foo<softBreak></softBreak>[]bar</p><p>y</p>'
			);

			test(
				'inserts at the end of block',
				'<p>x</p><p>foo[]</p><p>y</p>',
				'<p>x</p><p>foo<softBreak></softBreak>[]</p><p>y</p>'
			);

			test(
				'inserts at the beginning of block',
				'<p>x</p><p>[]foo</p><p>y</p>',
				'<p>x</p><p><softBreak></softBreak>[]foo</p><p>y</p>'
			);

			describe( 'copyOnEnter', () => {
				beforeEach( () => {
					schema.extend( '$text', { allowAttributes: [ 'foo', 'bar' ] } );
					schema.setAttributeProperties( 'foo', { copyOnEnter: true } );
				} );

				test(
					'allowed attributes are copied',
					'<p><$text foo="true">test[]</$text></p>',
					'<p><$text foo="true">test</$text><softBreak></softBreak><$text foo="true">[]</$text></p>'
				);

				test(
					'unknown attributes are not copied',
					'<p><$text bar="true">test[]</$text></p>',
					'<p><$text bar="true">test</$text><softBreak></softBreak>[]</p>'
				);

				test(
					'only allowed attributes are copied from mix set',
					'<p><$text bar="true" foo="true">test[]</$text></p>',
					'<p><$text bar="true" foo="true">test</$text><softBreak></softBreak><$text foo="true">[]</$text></p>'
				);
			} );
		} );

		describe( 'non-collapsed selection', () => {
			test(
				'deletes the content and inserts the break when directly in the root',
				'fo[ob]ar',
				'fo<softBreak></softBreak>[]ar'
			);

			test(
				'deletes text and adds break',
				'<p>ab[cd]ef</p><p>ghi</p>',
				'<p>ab<softBreak></softBreak>[]ef</p><p>ghi</p>'
			);

			test(
				'places selection in the 2nd element',
				'<h>ab[c</h><p>d]ef</p><p>ghi</p>',
				'<h>ab</h><p>[]ef</p><p>ghi</p>'
			);

			test(
				'does nothing for selection that contains more than one range',
				'<p>[abc]</p><p>[def]</p>',
				'<p>[abc]</p><p>[def]</p>'
			);

			test(
				'inserts break in empty element after it was fully selected',
				'<p>x</p><p>[abcdef]</p><p>y</p>',
				'<p>x</p><p><softBreak></softBreak>[]</p><p>y</p>'
			);

			// See: comment in softBreakAction().
			test(
				'leaves one empty element after two were fully selected',
				'<p>[abc</p><p>def]</p>',
				'<p>[]</p>'
			);

			test(
				'should insert the break in inline limit element - collapsed',
				'<p><inlineLimit>foo[]bar</inlineLimit></p>',
				'<p><inlineLimit>foo<softBreak></softBreak>[]bar</inlineLimit></p>'
			);

			test(
				'should insert the break in inline limit elements',
				'<p><inlineLimit>foo[bar]baz</inlineLimit></p>',
				'<p><inlineLimit>foo<softBreak></softBreak>[]baz</inlineLimit></p>'
			);

			test(
				'should insert the break at beginning of the inline limit elements',
				'<p><inlineLimit>foo[bar]baz</inlineLimit></p>',
				'<p><inlineLimit>foo<softBreak></softBreak>[]baz</inlineLimit></p>'
			);

			test(
				'should insert the break at ending of the inline limit elements',
				'<p><inlineLimit>foobaz[]</inlineLimit></p>',
				'<p><inlineLimit>foobaz<softBreak></softBreak>[]</inlineLimit></p>'
			);

			it( 'should not break inline limit elements - selection partially inside', () => {
				// Wrap all changes in one block to avoid post-fixing the selection (which is incorret) in the meantime.
				model.change( () => {
					setData( model, '<p><inlineLimit>ba[r</inlineLimit></p><p>f]oo</p>' );

					command.execute();

					expect( getData( model ) ).to.equal( '<p><inlineLimit>ba[r</inlineLimit></p><p>f]oo</p>' );
				} );
			} );

			test(
				'should break paragraph in blockLimit',
				'<blockLimit><p>foo[]bar</p></blockLimit>',
				'<blockLimit><p>foo<softBreak></softBreak>[]bar</p></blockLimit>'
			);

			it( 'does nothing when break element cannot be inserted in specified context', () => {
				// Wrap all changes in one block to avoid post-fixing the selection (which is incorret) in the meantime.
				model.change( () => {
					setData( model, '<img>[]</img>' );

					command.execute();

					expect( getData( model ) ).to.equal( '<img>[]</img>' );
				} );
			} );

			it( 'leaves one empty element after two were fully selected (backward)', () => {
				setData( model, '<p>[abc</p><p>def]</p>' );
				// @TODO: Add option for setting selection direction to model utils.
				doc.selection._lastRangeBackward = true;

				command.execute();

				expect( getData( model ) ).to.equal( '<p>[]</p>' );
			} );

			it( 'uses DataController.deleteContent', () => {
				const spy = sinon.spy();

				editor.model.on( 'deleteContent', spy );

				setData( model, '<p>[x]</p>' );

				command.execute();

				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		function test( title, input, output ) {
			it( title, () => {
				setData( model, input );

				command.execute();

				expect( getData( model ) ).to.equal( output );
			} );
		}
	} );

	describe( '#isEnabled', () => {
		it( 'should be disabled if <softBreak> cannot be inserted into element', () => {
			model.change( () => {
				setData( model, '<img>[]</img>' );

				expect( command.isEnabled ).to.equal( false );
			} );
		} );

		it( 'should be enabled for collapsed selection in $root', () => {
			setData( model, 'Foo.[]' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled for collapsed selection in paragraph', () => {
			setData( model, '<p>Foo.[]</p>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled for collapsed selection in heading', () => {
			setData( model, '<h>Foo.[]</h>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled for collapsed selection in inline limit element', () => {
			setData( model, '<p><inlineLimit>Foo.[]</inlineLimit></p>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled for non-collapsed selection in inline limit element', () => {
			setData( model, '<p><inlineLimit>[Foo.]</inlineLimit></p>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled for collapsed selection in paragraph which is wrapped in a block limit element', () => {
			setData( model, '<blockLimit><p>Foo.[]</p></blockLimit>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled for non-collapsed selection in paragraph which is wrapped in a block limit element', () => {
			setData( model, '<blockLimit><p>F[oo.]</p></blockLimit>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled for non-collapsed selection in paragraphs', () => {
			setData( model, '<p>[Foo.</p><p>Bar.]</p>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be enabled for non-collapsed selection in headings', () => {
			setData( model, '<h>[Foo.</h><h>Bar.]</h>' );

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be disabled for non-collapsed selection which starts in an inline limit element', () => {
			// Wrap all changes in one block to avoid post-fixing the selection (which is incorret) in the meantime.
			model.change( () => {
				setData( model, '<p><inlineLimit>F[oo.</inlineLimit>B]ar.</p>' );

				// Refresh it manually because we're in the middle of a change block.
				command.refresh();

				expect( command.isEnabled ).to.equal( false );
			} );
		} );

		it( 'should be disabled for non-collapsed selection which end in an inline limit element', () => {
			// Wrap all changes in one block to avoid post-fixing the selection (which is incorret) in the meantime.
			model.change( () => {
				setData( model, '<p>F[oo<inlineLimit>Bar].</inlineLimit></p>' );

				// Refresh it manually because we're in the middle of a change block.
				command.refresh();

				expect( command.isEnabled ).to.equal( false );
			} );
		} );

		it( 'should be disabled when break element cannot be inserted in specified context', () => {
			// Wrap all changes in one block to avoid post-fixing the selection (which is incorret) in the meantime.
			model.change( () => {
				setData( model, '<img>[]</img>' );

				// Refresh it manually because we're in the middle of a change block.
				command.refresh();

				expect( command.isEnabled ).to.equal( false );
			} );
		} );

		it( 'should be disabled for non-collapsed selection which starts in element inside a block limit element', () => {
			model.change( () => {
				setData( model, '<blockLimit><p>F[oo.</p></blockLimit><p>B]ar.</p>' );

				// Refresh it manually because we're in the middle of a change block.
				command.refresh();

				expect( command.isEnabled ).to.equal( false );
			} );
		} );

		it( 'should be disabled for non-collapsed selection which ends in element inside a block limit element', () => {
			model.change( () => {
				setData( model, '<p>Fo[o.</p><blockLimit><p>Bar].</p></blockLimit>' );

				// Refresh it manually because we're in the middle of a change block.
				command.refresh();

				expect( command.isEnabled ).to.equal( false );
			} );
		} );

		it( 'should be disabled for multi-ranges selection (1)', () => {
			setData( model, '<p>[x]</p><p>[foo]</p>' );

			expect( command.isEnabled ).to.equal( false );
		} );

		it( 'should be disabled for multi-ranges selection (2)', () => {
			setData( model, '<p>[]x</p><p>[]foo</p>' );

			expect( command.isEnabled ).to.equal( false );
		} );
	} );
} );
