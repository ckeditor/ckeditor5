/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import InsertDelta from '@ckeditor/ckeditor5-engine/src/model/delta/insertdelta';
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
				expect( writer.batch.deltas ).to.length( 0 );
				editor.execute( 'shiftEnter' );
				expect( writer.batch.deltas ).to.length.above( 0 );
			} );
		} );

		it( 'creates InsertDelta if soft enter is at the beginning of block', () => {
			setData( model, '<p>[]foo</p>' );

			editor.execute( 'shiftEnter' );

			const deltas = Array.from( doc.history.getDeltas() );

			expect( deltas[ deltas.length - 1 ] ).to.be.instanceof( InsertDelta );
		} );

		it( 'creates InsertDelta if soft enter is at the end of block', () => {
			setData( model, '<p>foo[]</p>' );

			editor.execute( 'shiftEnter' );

			const deltas = Array.from( doc.history.getDeltas() );

			expect( deltas[ deltas.length - 1 ] ).to.be.instanceof( InsertDelta );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'collapsed selection', () => {
			test(
				'inserts in the root',
				'foo[]bar',
				'foo<break></break>[]bar'
			);

			test(
				'inserts inside block',
				'<p>x</p><p>foo[]bar</p><p>y</p>',
				'<p>x</p><p>foo<break></break>[]bar</p><p>y</p>'
			);

			test(
				'inserts at the end of block',
				'<p>x</p><p>foo[]</p><p>y</p>',
				'<p>x</p><p>foo<break></break>[]</p><p>y</p>'
			);

			test(
				'inserts at the beginning of block',
				'<p>x</p><p>[]foo</p><p>y</p>',
				'<p>x</p><p><break></break>[]foo</p><p>y</p>'
			);
		} );

		describe( 'non-collapsed selection', () => {
			test(
				'deletes the content and inserts the break when directly in the root',
				'fo[ob]ar',
				'fo<break></break>[]ar'
			);

			test(
				'deletes text and adds break',
				'<p>ab[cd]ef</p><p>ghi</p>',
				'<p>ab<break></break>[]ef</p><p>ghi</p>'
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
				'<p>x</p><p><break></break>[]</p><p>y</p>'
			);

			test(
				'leaves one empty element after two were fully selected',
				'<p>[abc</p><p>def]</p>',
				'<p>[]</p>'
			);

			test(
				'should insert the break in inline limit element - collapsed',
				'<p><inlineLimit>foo[]bar</inlineLimit></p>',
				'<p><inlineLimit>foo<break></break>[]bar</inlineLimit></p>'
			);

			test(
				'should insert the break in inline limit elements',
				'<p><inlineLimit>foo[bar]baz</inlineLimit></p>',
				'<p><inlineLimit>foo<break></break>[]baz</inlineLimit></p>'
			);

			test(
				'should insert the break at beginning of the inline limit elements',
				'<p><inlineLimit>foo[bar]baz</inlineLimit></p>',
				'<p><inlineLimit>foo<break></break>[]baz</inlineLimit></p>'
			);

			test(
				'should insert the break at ending of the inline limit elements',
				'<p><inlineLimit>foobaz[]</inlineLimit></p>',
				'<p><inlineLimit>foobaz<break></break>[]</inlineLimit></p>'
			);

			test(
				'should not break inline limit elements - selection partially inside',
				'<p><inlineLimit>ba[r</inlineLimit></p><p>f]oo</p>',
				'<p><inlineLimit>ba[r</inlineLimit></p><p>f]oo</p>'
			);

			test(
				'should break paragraph in blockLimit',
				'<blockLimit><p>foo[]bar</p></blockLimit>',
				'<blockLimit><p>foo<break></break>[]bar</p></blockLimit>'
			);

			test(
				'does nothing when break element cannot be inserted in specified context',
				'<img>[]</img>',
				'<img>[]</img>'
			);

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
} );
