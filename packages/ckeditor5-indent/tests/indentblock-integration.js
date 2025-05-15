/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting.js';

import IndentEditing from '../src/indentediting.js';
import IndentBlock from '../src/indentblock.js';

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

	// https://github.com/ckeditor/ckeditor5/issues/8177
	describe( 'with custom heading', () => {
		beforeEach( () => {
			return createTestEditor( {
				plugins: [ Paragraph, HeadingEditing, IndentEditing, IndentBlock ],
				indentBlock: { offset: 50, unit: 'px' },
				heading: {
					options: [
						{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
						{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
						{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
						{
							model: 'headingFancy',
							view: {
								name: 'h2',
								classes: 'fancy'
							},
							title: 'Heading 2 (fancy)',
							class: 'ck-heading_heading2_fancy',
							converterPriority: 'high'
						}
					]
				}
			} ).then( newEditor => {
				editor = newEditor;
				doc = editor.model.document;
			} );
		} );

		it( 'should work with custom (user defined) headings', () => {
			editor.setData( '<h2 class="fancy" style="margin-left:150px">foo</h2>' );

			const customHeading = doc.getRoot().getChild( 0 );

			expect( customHeading.hasAttribute( 'blockIndent' ) ).to.be.true;
			expect( customHeading.getAttribute( 'blockIndent' ) ).to.equal( '150px' );

			expect( editor.getData() ).to.equal( '<h2 class="fancy" style="margin-left:150px;">foo</h2>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<h2 class="fancy" style="margin-left:150px">foo</h2>' );
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
