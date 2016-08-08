/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '/tests/core/_utils/modeltesteditor.js';
import { default as EnterCommand, enterBlock } from '/ckeditor5/enter/entercommand.js';
import { getData, setData } from '/tests/engine/_utils/model.js';

let editor, doc, schema;

beforeEach( () => {
	return ModelTestEditor.create()
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;

			const command = new EnterCommand( editor );
			editor.commands.set( 'enter', command );

			schema = doc.schema;

			// Note: We could use real names like 'paragraph', but that would make test patterns too long.
			// Plus, this is actually a good test that the algorithm can be used for any model.
			schema.registerItem( 'img', '$inline' );
			schema.registerItem( 'p', '$block' );
			schema.registerItem( 'h', '$block' );
			schema.allow( { name: '$text', inside: '$root' } );
		} );
} );

describe( 'EnterCommand', () => {
	it( 'enters a block using enqueueChanges', () => {
		setData( doc, '<p>foo[]</p>' );

		const spy = sinon.spy( doc, 'enqueueChanges' );

		editor.execute( 'enter' );

		expect( getData( doc, { withoutSelection: true } ) ).to.equal( '<p>foo</p><p></p>' );
		expect( spy.calledOnce ).to.be.true;
	} );

	it( 'uses paragraph as default block', () => {
		schema.registerItem( 'paragraph', '$block' );
		setData( doc, '<h>foo[]</h>' );

		editor.execute( 'enter' );

		expect( getData( doc, { withoutSelection: true } ) ).to.equal( '<h>foo</h><paragraph></paragraph>' );
	} );
} );

describe( 'enterBlock', () => {
	describe( 'collapsed selection', () => {
		test(
			'does nothing in the root',
			'foo[]bar',
			'foo[]bar',
			{ defaultBlockName: 'p' }
		);

		test(
			'splits block',
			'<p>x</p><p>foo[]bar</p><p>y</p>',
			'<p>x</p><p>foo</p><p>[]bar</p><p>y</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'splits block (other than default)',
			'<p>x</p><h>foo[]bar</h><p>y</p>',
			'<p>x</p><h>foo</h><h>[]bar</h><p>y</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'splits block at the end',
			'<p>x</p><p>foo[]</p><p>y</p>',
			'<p>x</p><p>foo</p><p>[]</p><p>y</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'splits block at the beginning',
			'<p>x</p><p>[]foo</p><p>y</p>',
			'<p>x</p><p></p><p>[]foo</p><p>y</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'splits block at the beginning (other than default)',
			'<p>x</p><h>[]foo</h><p>y</p>',
			'<p>x</p><h></h><h>[]foo</h><p>y</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'creates default block when leaving other block',
			'<h>foo[]</h><p>x</p>',
			'<h>foo</h><p>[]</p><p>x</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'does not rename when default block is not allowed',
			'<h>foo[]</h><p>x</p>',
			'<h>foo</h><h>[]</h><p>x</p>',
			{ defaultBlockName: 'xxx' }
		);

		test(
			'inserts new block after empty one',
			'<p>x</p><p>[]</p><p>y</p>',
			'<p>x</p><p></p><p>[]</p><p>y</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'inserts new block after empty one (other than default)',
			'<p>x</p><h>[]</h><p>y</p>',
			'<p>x</p><h></h><p>[]</p><p>y</p>',
			{ defaultBlockName: 'p' }
		);
	} );

	describe( 'non-collapsed selection', () => {
		test(
			'only deletes the content when directly in the root',
			'fo[ob]ar',
			'fo[]ar',
			{ defaultBlockName: 'p' }
		);

		test(
			'deletes text and splits',
			'<p>ab[cd]ef</p><p>ghi</p>',
			'<p>ab</p><p>[]ef</p><p>ghi</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'deletes text and splits (other than default)',
			'<h>ab[cd]ef</h>',
			'<h>ab</h><h>[]ef</h>',
			{ defaultBlockName: 'p' }
		);

		test(
			'places selection in the 2nd element',
			'<h>ab[c</h><p>d]ef</p><p>ghi</p>',
			'<h>ab</h><p>[]ef</p><p>ghi</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'leaves one empty element after one was fully selected',
			'<p>x</p><p>[abcdef]</p><p>y</p>',
			'<p>x</p><p>[]</p><p>y</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'leaves one (default) empty element after one was fully selected',
			'<h>[abcdef]</h>',
			'<p>[]</p>',
			{ defaultBlockName: 'p' }
		);

		test(
			'leaves one (default) empty element after two were fully selected',
			'<h>[abc</h><p>def]</p>',
			'<p>[]</p>',
			{ defaultBlockName: 'p' }
		);

		it( 'leaves one (default) empty element after two were fully selected (backward)', () => {
			setData( doc, '<h>[abc</h><p>def]</p>' );
			// @TODO: Add option for setting selection direction to model utils.
			doc.selection._lastRangeBackward = true;

			enterBlock( doc.batch(), doc.selection, { defaultBlockName: 'p' } );

			expect( getData( doc ).to.equal( '<p>[]</p>' );
		} );

		it( 'uses composer.deleteContents', () => {
			const spy = sinon.spy();

			doc.composer.on( 'deleteContents', spy );

			setData( doc, '<p>[x]</p>' );

			enterBlock( doc.batch(), doc.selection, { defaultBlockName: 'p' } );

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	function test( title, input, output, options ) {
		it( title, () => {
			setData( doc, input );

			enterBlock( doc.batch(), doc.selection, options );

			expect( getData( doc ) ).to.equal( output );
		} );
	}
} );
