/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import MediaEmbed from '../src/mediaembed';
import MediaEmbedToolbar from '../src/mediaembedtoolbar';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'MediaEmbedToolbar', () => {
	let editor, element, widgetToolbarRepository, balloon, toolbar, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor.create( element, {
			plugins: [ Paragraph, MediaEmbed, MediaEmbedToolbar, FakeButton ],
			mediaEmbed: {
				toolbar: [ 'fake_button' ]
			}
		} ).then( _editor => {
			editor = _editor;
			model = editor.model;
			widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			toolbar = widgetToolbarRepository._toolbarDefinitions.get( 'mediaEmbed' ).view;
			balloon = editor.plugins.get( 'ContextualBalloon' );
		} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => element.remove() );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( MediaEmbedToolbar ) ).to.be.instanceOf( MediaEmbedToolbar );
	} );

	describe( 'toolbar', () => {
		it( 'should use the config.table.tableWidget to create items', () => {
			expect( toolbar.items ).to.have.length( 1 );
			expect( toolbar.items.get( 0 ).label ).to.equal( 'fake button' );
		} );

		it( 'should set proper CSS classes', () => {
			const spy = sinon.spy( balloon, 'add' );

			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<media url=""></media>]' );

			sinon.assert.calledWithMatch( spy, {
				view: toolbar,
				balloonClassName: 'ck-toolbar-container'
			} );
		} );

		it( 'should set aria-label attribute', () => {
			toolbar.render();

			expect( toolbar.element.getAttribute( 'aria-label' ) ).to.equal( 'Media toolbar' );

			toolbar.destroy();
		} );
	} );

	describe( 'integration with the editor focus', () => {
		it( 'should show the toolbar when the editor gains focus and the media widget is selected', () => {
			editor.ui.focusTracker.isFocused = true;

			setData( editor.model, '[<media url=""></media>]' );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should hide the toolbar when the editor loses focus and the media widget is selected', () => {
			editor.ui.focusTracker.isFocused = false;

			setData( editor.model, '[<media url=""></media>]' );

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;
		} );
	} );

	describe( 'integration with the editor selection', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'should show the toolbar on ui#update when the media widget is selected', () => {
			setData( editor.model, '<paragraph>[foo]</paragraph><media url=""></media>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;

			editor.model.change( writer => {
				// Select the [<media></media>]
				writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 'on' );
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should not engage when the toolbar is in the balloon yet invisible', () => {
			setData( editor.model, '<media url=""></media>' );

			expect( balloon.visibleView ).to.equal( toolbar );

			const lastView = new View();
			lastView.element = document.createElement( 'div' );

			balloon.add( {
				view: lastView,
				position: {
					target: document.body
				}
			} );

			expect( balloon.visibleView ).to.equal( lastView );

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.equal( lastView );
		} );

		it( 'should hide the toolbar on ui#update if the media is de–selected', () => {
			setData( model, '<paragraph>foo</paragraph>[<media url=""></media>]' );

			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <paragraph>[...]</paragraph>
				writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
			} );

			expect( balloon.visibleView ).to.be.null;

			// Make sure successive change does not throw, e.g. attempting
			// to remove the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.be.null;
		} );
	} );
} );

describe( 'MediaEmbedToolbar - integration with BalloonEditor', () => {
	let clock, editor, balloonToolbar, element, widgetToolbarRepository, balloon, toolbar, model;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		clock = testUtils.sinon.useFakeTimers();

		return BalloonEditor.create( element, {
			plugins: [ Paragraph, MediaEmbed, MediaEmbedToolbar, FakeButton, Bold ],
			balloonToolbar: [ 'bold' ],
			media: {
				toolbar: [ 'fake_button' ]
			}
		} ).then( _editor => {
			editor = _editor;
			model = editor.model;
			widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
			toolbar = widgetToolbarRepository._toolbarDefinitions.get( 'mediaEmbed' ).view;
			balloon = editor.plugins.get( 'ContextualBalloon' );
			balloonToolbar = editor.plugins.get( 'BalloonToolbar' );

			editor.ui.focusTracker.isFocused = true;
		} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => element.remove() );
	} );

	it( 'balloon toolbar should be hidden when media widget is selected', () => {
		setData( model, '<paragraph>[abc]</paragraph><media url=""></media>' );
		editor.editing.view.document.isFocused = true;

		expect( balloon.visibleView ).to.equal( null );

		model.change( writer => {
			// Select the [<media></media>]
			writer.setSelection( model.document.getRoot().getChild( 1 ), 'on' );
		} );

		expect( balloon.visibleView ).to.equal( toolbar );

		clock.tick( 200 );

		expect( balloon.visibleView ).to.equal( toolbar );
	} );

	it( 'balloon toolbar should be visible when media widget is not selected', () => {
		setData( model, '<paragraph>abc</paragraph>[<media url=""></media>]' );
		editor.editing.view.document.isFocused = true;

		expect( balloon.visibleView ).to.equal( toolbar );

		model.change( writer => {
			// Select the <paragraph>[abc]</paragraph>
			writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
		} );

		clock.tick( 200 );

		expect( balloon.visibleView ).to.equal( balloonToolbar.toolbarView );
	} );
} );

// Plugin that adds fake_button to editor's component factory.
class FakeButton extends Plugin {
	init() {
		this.editor.ui.componentFactory.add( 'fake_button', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'fake button'
			} );

			return view;
		} );
	}
}
