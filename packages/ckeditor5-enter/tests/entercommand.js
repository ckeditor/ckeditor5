/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '/tests/core/_utils/modeltesteditor.js';
import EnterCommand from '/ckeditor5/enter/entercommand.js';
import { getData, setData } from '/tests/engine/_utils/model.js';

let editor, doc, schema, command;

beforeEach( () => {
	return ModelTestEditor.create()
		.then( newEditor => {
			editor = newEditor;
			doc = editor.document;

			command = new EnterCommand( editor );
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
} );

describe( '_doExecute', () => {
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

		it( 'leaves one empty element after two were fully selected (backward)', () => {
			setData( doc, '<p>[abc</p><p>def]</p>' );
			// @TODO: Add option for setting selection direction to model utils.
			doc.selection._lastRangeBackward = true;

			command._doExecute();

			expect( getData( doc ) ).to.equal( '<p>[]</p>' );
		} );

		it( 'uses composer.deleteContents', () => {
			const spy = sinon.spy();

			doc.composer.on( 'deleteContents', spy );

			setData( doc, '<p>[x]</p>' );

			command._doExecute();

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	function test( title, input, output ) {
		it( title, () => {
			setData( doc, input );

			command._doExecute();

			expect( getData( doc ) ).to.equal( output );
		} );
	}
} );
