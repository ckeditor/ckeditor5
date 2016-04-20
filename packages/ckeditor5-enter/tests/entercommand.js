/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor.js';
import Document from '/ckeditor5/engine/treemodel/document.js';
import { default as EnterCommand, enterBlock } from '/ckeditor5/enter/entercommand.js';
import { getData, setData } from '/tests/engine/_utils/model.js';

describe( 'EnterCommand', () => {
	let editor, document;

	beforeEach( () => {
		editor = new Editor();
		document = editor.document = new Document();

		editor.document.createRoot( 'main', '$root' );

		const command = new EnterCommand( editor );
		editor.commands.set( 'enter', command );

		const schema = document.schema;

		// Note: We could use real names like 'paragraph', but that would make test patterns too long.
		// Plus, this is actually a good test that the algorithm can be used for any model.
		schema.registerItem( 'img', '$inline' );
		schema.registerItem( 'p', '$block' );
		schema.registerItem( 'h', '$block' );
	} );

	describe( 'enterBlock', () => {
		describe( 'collapsed selection', () => {
			test(
				'does nothing in the root',
				'foo<selection />bar',
				'foo<selection />bar',
				{ defaultBlockName: 'p' }
			);

			test(
				'splits block',
				'<p>x</p><p>foo<selection />bar</p><p>y</p>',
				'<p>x</p><p>foo</p><p><selection />bar</p><p>y</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'splits block (other than default)',
				'<p>x</p><h>foo<selection />bar</h><p>y</p>',
				'<p>x</p><h>foo</h><h><selection />bar</h><p>y</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'splits block at the end',
				'<p>x</p><p>foo<selection /></p><p>y</p>',
				'<p>x</p><p>foo</p><p><selection /></p><p>y</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'splits block at the beginning',
				'<p>x</p><p><selection />foo</p><p>y</p>',
				'<p>x</p><p></p><p><selection />foo</p><p>y</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'splits block at the beginning (other than default)',
				'<p>x</p><h><selection />foo</h><p>y</p>',
				'<p>x</p><h></h><h><selection />foo</h><p>y</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'creates default block when leaving other block',
				'<h>foo<selection /></h><p>x</p>',
				'<h>foo</h><p><selection /></p><p>x</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'does not rename when default block is not allowed',
				'<h>foo<selection /></h><p>x</p>',
				'<h>foo</h><h><selection /></h><p>x</p>',
				{ defaultBlockName: 'xxx' }
			);

			test(
				'inserts new block after empty one',
				'<p>x</p><p><selection /></p><p>y</p>',
				'<p>x</p><p></p><p><selection /></p><p>y</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'inserts new block after empty one (other than default)',
				'<p>x</p><h><selection /></h><p>y</p>',
				'<p>x</p><h></h><p><selection /></p><p>y</p>',
				{ defaultBlockName: 'p' }
			);
		} );

		describe( 'non-collapsed selection', () => {
			test(
				'only deletes the content when directly in the root',
				'fo<selection>ob</selection>ar',
				'fo<selection />ar',
				{ defaultBlockName: 'p' }
			);

			test(
				'deletes text and splits',
				'<p>ab<selection>cd</selection>ef</p><p>ghi</p>',
				'<p>ab</p><p><selection />ef</p><p>ghi</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'deletes text and splits (other than default)',
				'<h>ab<selection>cd</selection>ef</h>',
				'<h>ab</h><h><selection />ef</h>',
				{ defaultBlockName: 'p' }
			);

			test(
				'places selection in the 2nd element',
				'<h>ab<selection>c</h><p>d</selection>ef</p><p>ghi</p>',
				'<h>ab</h><p><selection />ef</p><p>ghi</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'leaves one empty element after one was fully selected',
				'<p>x</p><p><selection>abcdef</selection></p><p>y</p>',
				'<p>x</p><p><selection /></p><p>y</p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'leaves one (default) empty element after one was fully selected',
				'<h><selection>abcdef</selection></h>',
				'<p><selection /></p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'leaves one (default) empty element after two were fully selected',
				'<h><selection>abc</h><p>def</selection></p>',
				'<p><selection /></p>',
				{ defaultBlockName: 'p' }
			);

			test(
				'leaves one (default) empty element after two were fully selected (backward)',
				'<h><selection backward>abc</h><p>def</selection></p>',
				'<p><selection /></p>',
				{ defaultBlockName: 'p' }
			);

			it( 'uses composer.deleteContents', () => {
				const spy = sinon.spy();

				document.composer.on( 'deleteContents', spy );

				setData( document, 'main', '<p><selection>x</selection></p>' );

				enterBlock( document.batch(), document.selection, { defaultBlockName: 'p' } );

				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		function test( title, input, output, options ) {
			it( title, () => {
				setData( document, 'main', input );

				enterBlock( document.batch(), document.selection, options );

				expect( getData( document, 'main', { selection: true } ) ).to.equal( output );
			} );
		}
	} );
} );
