/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Image from '../src/image';
import ImageEngine from '../src/image/imageengine';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ImageTextAlternative from '../src/imagetextalternative';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import ContextualToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/contextual/contextualtoolbar';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import View from '@ckeditor/ckeditor5-ui/src/view';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'Image', () => {
	let editorElement, editor, document, viewDocument;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Image ]
		} )
		.then( newEditor => {
			editor = newEditor;
			document = editor.document;
			viewDocument = editor.editing.view;
		} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Image ) ).to.instanceOf( Image );
	} );

	it( 'should load ImageEngine plugin', () => {
		expect( editor.plugins.get( ImageEngine ) ).to.instanceOf( ImageEngine );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );

	it( 'should load ImageTextAlternative plugin', () => {
		expect( editor.plugins.get( ImageTextAlternative ) ).to.instanceOf( ImageTextAlternative );
	} );

	describe( 'ContextualToolbar integration', () => {
		let balloon, contextualToolbar, newEditor;

		beforeEach( () => {
			return ClassicTestEditor.create( editorElement, {
				plugins: [ Image, ContextualToolbar, Paragraph ]
			} )
				.then( editor => {
					newEditor = editor;
					balloon = newEditor.plugins.get( 'ContextualBalloon' );
					contextualToolbar = newEditor.plugins.get( 'ContextualToolbar' );
					const button = new View();

					button.element = global.document.createElement( 'div' );

					// There must be at least one toolbar items which is not disabled to show it.
					// https://github.com/ckeditor/ckeditor5-ui/issues/269
					contextualToolbar.toolbarView.items.add( button );

					newEditor.editing.view.isFocused = true;
				} );
		} );

		afterEach( () => {
			editorElement.remove();
			return newEditor.destroy();
		} );

		it( 'should prevent the ContextualToolbar from being displayed when an image is selected', () => {
			// When image is selected along with text.
			setModelData( newEditor.document, '<paragraph>fo[o</paragraph><image alt="alt text" src="foo.png"></image>]' );

			contextualToolbar.show();

			// ContextualToolbar should be visible.
			expect( balloon.visibleView ).to.equal( contextualToolbar.toolbarView );

			// When only image is selected.
			setModelData( newEditor.document, '<paragraph>foo</paragraph>[<image alt="alt text" src="foo.png"></image>]' );

			contextualToolbar.show();

			// ContextualToolbar should not be visible.
			expect( balloon.visibleView ).to.be.null;
		} );

		it( 'should listen to ContextualToolbar#show event with high priority', () => {
			const highestPrioritySpy = sinon.spy();
			const highPrioritySpy = sinon.spy();
			const normalPrioritySpy = sinon.spy();

			// Select an image
			setModelData( newEditor.document, '<paragraph>foo</paragraph>[<image alt="alt text" src="foo.png"></image>]' );

			newEditor.listenTo( contextualToolbar, 'show', highestPrioritySpy, { priority: 'highest' } );
			newEditor.listenTo( contextualToolbar, 'show', highPrioritySpy, { priority: 'high' } );
			newEditor.listenTo( contextualToolbar, 'show', normalPrioritySpy, { priority: 'normal' } );

			contextualToolbar.show();

			sinon.assert.calledOnce( highestPrioritySpy );
			sinon.assert.notCalled( highPrioritySpy );
			sinon.assert.notCalled( normalPrioritySpy );
		} );
	} );

	describe( 'selection', () => {
		it( 'should create fake selection', () => {
			setModelData( document, '[<image alt="alt text" src="foo.png"></image>]' );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
					'<img alt="alt text" src="foo.png"></img>' +
				'</figure>]'
			);

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'alt text image widget' );
		} );

		it( 'should create proper fake selection label when alt attribute is empty', () => {
			setModelData( document, '[<image src="foo.png" alt=""></image>]' );

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
				'<img alt="" src="foo.png"></img>' +
				'</figure>]'
			);

			expect( viewDocument.selection.isFake ).to.be.true;
			expect( viewDocument.selection.fakeSelectionLabel ).to.equal( 'image widget' );
		} );

		it( 'should remove selected class from previously selected element', () => {
			setModelData( document,
				'[<image src="foo.png" alt="alt text"></image>]' +
				'<image src="foo.png" alt="alt text"></image>'
			);

			expect( getViewData( viewDocument ) ).to.equal(
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
				'<img alt="alt text" src="foo.png"></img>' +
				'</figure>]' +
				'<figure class="image ck-widget" contenteditable="false">' +
				'<img alt="alt text" src="foo.png"></img>' +
				'</figure>'
			);

			document.enqueueChanges( () => {
				const secondImage = document.getRoot().getChild( 1 );
				document.selection.setRanges( [ ModelRange.createOn( secondImage ) ] );
			} );

			expect( getViewData( viewDocument ) ).to.equal(
				'<figure class="image ck-widget" contenteditable="false">' +
				'<img alt="alt text" src="foo.png"></img>' +
				'</figure>' +
				'[<figure class="image ck-widget ck-widget_selected" contenteditable="false">' +
				'<img alt="alt text" src="foo.png"></img>' +
				'</figure>]'
			);
		} );
	} );
} );
