/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';

import IndentEditing from '../src/indentediting';
import IndentBlock from '../src/indentblock';

describe( 'IndentBlock - integration', () => {
	let editor, doc;

	testUtils.createSinonSandbox();

	afterEach( () => {
		if ( editor ) {
			return editor.destroy();
		}
	} );

	describe( 'with paragraph', () => {
		beforeEach( () => {
			return createTestEditor( { indentBlock: { offset: 50, unit: 'px' } } )
				.then( newEditor => {
					editor = newEditor;
					doc = editor.model.document;
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
				plugins: [ Paragraph, HeadingEditing, IndentEditing, IndentBlock ],
				indentBlock: { offset: 50, unit: 'px' }
			} ).then( newEditor => {
				editor = newEditor;
				doc = editor.model.document;
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

	// https://github.com/ckeditor/ckeditor5/issues/2359
	it( 'should work with paragraphs regardless of plugin order', () => {
		return createTestEditor( {
			plugins: [ IndentEditing, IndentBlock, Paragraph, HeadingEditing ],
			indentBlock: { offset: 50, unit: 'px' }
		} ).then( newEditor => {
			editor = newEditor;
			doc = editor.model.document;

			editor.setData( '<p style="margin-left:50px">foo</p>' );

			const paragraph = doc.getRoot().getChild( 0 );

			expect( paragraph.hasAttribute( 'blockIndent' ) ).to.be.true;
		} );
	} );

	function createTestEditor( extraConfig = {} ) {
		return VirtualTestEditor
			.create( Object.assign( {
				plugins: [ Paragraph, IndentEditing, IndentBlock ]
			}, extraConfig ) );
	}
} );
