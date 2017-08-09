/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ContextualToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/contextual/contextualtoolbar';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Image from '../src/image';
import View from '@ckeditor/ckeditor5-ui/src/view';

describe( 'Image integration', () => {
	describe( 'with the ContextualToolbar', () => {
		let balloon, contextualToolbar, newEditor, editorElement;

		beforeEach( () => {
			editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			return ClassicTestEditor
				.create( editorElement, {
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

		it( 'should listen to ContextualToolbar#show event with the high priority', () => {
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
} );
