/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import { getData } from '../../../src/dev-utils/model';

describe( 'DomConverter – whitespace handling – integration', () => {
	let editor;

	// See https://github.com/ckeditor/ckeditor5-engine/issues/822.
	describe( 'data loading', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph ] } )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'new line at the end of the content is ignored', () => {
			editor.setData( '<p>foo</p>\n' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'whitespaces at the end of the content are ignored', () => {
			editor.setData( '<p>foo</p>\n\r\n \t' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		// Controversial result. See https://github.com/ckeditor/ckeditor5-engine/issues/987.
		it( 'nbsp at the end of the content is not ignored', () => {
			editor.setData( '<p>foo</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'new line at the beginning of the content is ignored', () => {
			editor.setData( '\n<p>foo</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'whitespaces at the beginning of the content are ignored', () => {
			editor.setData( '\n\n \t<p>foo</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		// Controversial result. See https://github.com/ckeditor/ckeditor5-engine/issues/987.
		it( 'nbsp at the beginning of the content is not ignored', () => {
			editor.setData( '<p>foo</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'new line between blocks is ignored', () => {
			editor.setData( '<p>foo</p>\n<p>bar</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'whitespaces between blocks are ignored', () => {
			editor.setData( '<p>foo</p>\n\n \t<p>bar</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		// Controversial result. See https://github.com/ckeditor/ckeditor5-engine/issues/987.
		it( 'nbsp between blocks is not ignored', () => {
			editor.setData( '<p>foo</p>&nbsp;<p>bar</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'new lines inside blocks are ignored', () => {
			editor.setData( '<p>\nfoo\n</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'whitespaces inside blocks are ignored', () => {
			editor.setData( '<p>\n\n \tfoo\n\n \t</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'nbsp inside blocks are not ignored', () => {
			editor.setData( '<p>&nbsp;foo&nbsp;</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph> foo </paragraph>' );

			expect( editor.getData() ).to.equal( '<p>&nbsp;foo&nbsp;</p>' );
		} );

		it( 'all whitespaces together are ignored', () => {
			editor.setData( '\n<p>foo\n\r\n \t</p>\n<p> bar</p>' );

			expect( getData( editor.document, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );
	} );
} );
