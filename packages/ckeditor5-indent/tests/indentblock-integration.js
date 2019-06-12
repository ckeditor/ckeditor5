/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Indent from '@ckeditor/ckeditor5-core/src/indent';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

import IndentBlock from '../src/indentblock';

describe( 'IndentBlock - integration', () => {
	let editor, element, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	describe( 'with paragraph', () => {
		beforeEach( () => {
			return createTestEditor( { indentBlock: { offset: 50, unit: 'px' } } )
				.then( newEditor => {
					editor = newEditor;
					model = editor.model;
					doc = model.document;
				} );
		} );

		it( 'should work with paragraph set', () => {
			editor.setData( '<p style="margin-left:50px">foo</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
			expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '50px' );

			expect( editor.getData() ).to.equal( '<p style="margin-left:50px;">foo</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p style="margin-left:50px">foo</p>' );
		} );
	} );

	describe( 'with heading', () => {
		beforeEach( () => {
			return createTestEditor( {
				plugins: [ Paragraph, Heading, Indent, IndentBlock ],
				indentBlock: { offset: 50, unit: 'px' }
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
			} );
		} );

		it( 'should work with default headings set', () => {
			editor.setData( '<p style="margin-left:50px">foo</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
			expect( paragraph.getAttribute( 'blockIndent' ) ).to.equal( '50px' );

			expect( editor.getData() ).to.equal( '<p style="margin-left:50px;">foo</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p style="margin-left:50px">foo</p>' );
		} );
	} );

	function createTestEditor( extraConfig = {} ) {
		return ClassicTestEditor
			.create( element, Object.assign( {
				plugins: [ Paragraph, Indent, IndentBlock ]
			}, extraConfig ) );
	}
} );
