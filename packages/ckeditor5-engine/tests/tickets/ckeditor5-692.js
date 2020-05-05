/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import MutationObserver from '../../src/view/observer/mutationobserver';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData, setData as setModelData } from '../../src/dev-utils/model';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import { getData as getViewData } from '../../src/dev-utils/view';
import { isInlineFiller } from '../../src/view/filler';
import Input from '@ckeditor/ckeditor5-typing/src/input';

/* globals document */

describe( 'Bug ckeditor5#692', () => {
	let editorElement, editor, mutationObserver, view, domEditor;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Bold, Input ]
			} )
			.then( newEditor => {
				editor = newEditor;
				view = editor.editing.view;
				mutationObserver = view.getObserver( MutationObserver );
				domEditor = editor.ui.getEditableElement();
			} );
	} );

	afterEach( () => {
		document.body.removeChild( editorElement );

		return editor.destroy();
	} );

	describe( 'DomConverter', () => {
		// https://github.com/ckeditor/ckeditor5/issues/692 Scenario 1.
		it( 'should handle space after inline filler at the end of container', () => {
			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			// Create Bold attribute at the end of paragraph.
			editor.execute( 'bold' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo<$text bold="true">[]</$text></paragraph>' );

			const domParagraph = domEditor.childNodes[ 0 ];
			const textNode = domParagraph.childNodes[ 1 ].childNodes[ 0 ];

			expect( isInlineFiller( textNode ) ).to.be.true;

			// Add space inside the strong's text node.
			textNode.data += ' ';
			mutationObserver.flush();

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>foo<$text bold="true"> []</$text></paragraph>' );
			expect( getViewData( editor.editing.view ) ).to.equal( '<p>foo<strong> {}</strong></p>' );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/692 Scenario 2.
		it( 'should handle space after inline filler at the end of container', () => {
			setModelData( editor.model, '<paragraph>[]foo</paragraph>' );

			// Create Bold attribute at the end of paragraph.
			editor.execute( 'bold' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true">[]</$text>foo</paragraph>' );

			const domParagraph = domEditor.childNodes[ 0 ];
			const textNode = domParagraph.childNodes[ 0 ].childNodes[ 0 ];

			expect( isInlineFiller( textNode ) ).to.be.true;

			// Add space inside the strong's text node.
			textNode.data += ' ';
			mutationObserver.flush();

			expect( getModelData( editor.model ) ).to.equal( '<paragraph><$text bold="true"> []</$text>foo</paragraph>' );
			expect( getViewData( editor.editing.view ) ).to.equal( '<p><strong> {}</strong>foo</p>' );
		} );
	} );
} );
