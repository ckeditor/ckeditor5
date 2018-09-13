/**
 * Copyright (c) 2016 - 2017, CKSource - Frederico Knabben. All rights reserved.
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import MediaEmbedCommentToolbar from '../src/mediaembedcommenttoolbar';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import View from '@ckeditor/ckeditor5-ui/src/view';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import mockCloudServices from '../_utils/mockcloudservices';

describe( 'MediaEmbedToolbar', () => {
	let editor, element, mediaEmbedCommentToolbar, balloon, toolbar, model;

	testUtils.createSinonSandbox();
	mockCloudServices();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor.create( element, {
			plugins: [ Paragraph, MediaEmbed, MediaEmbedCommentToolbar ],
		} ).then( _editor => {
			editor = _editor;
			mediaEmbedCommentToolbar = editor.plugins.get( MediaEmbedCommentToolbar );
			toolbar = mediaEmbedCommentToolbar._toolbar;
			balloon = editor.plugins.get( 'ContextualBalloon' );
			model = editor.model;
		} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => element.remove() );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( MediaEmbedCommentToolbar ) ).to.be.instanceOf( MediaEmbedCommentToolbar );
	} );

	it( 'should have only one item - comment', () => {
		expect( toolbar.items ).to.have.length( 1 );
		expect( toolbar.items.get( 0 ).label ).to.equal( 'Inline comment' );
	} );

	it( 'should set proper CSS classes', () => {
		const spy = sinon.spy( balloon, 'add' );

		editor.ui.focusTracker.isFocused = true;

		setData( editor.model, '[<media url=""></media>]' );

		sinon.assert.calledWithMatch( spy, {
			view: toolbar,
			balloonClassName: 'ck-toolbar-container'
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

describe( 'MediaEmbedCommentToolbar - integration with BalloonEditor', () => {
	let clock, editor, balloonToolbar, element, mediaEmbedCommentToolbar, balloon, toolbar, model;

	testUtils.createSinonSandbox();
	mockCloudServices();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		clock = testUtils.sinon.useFakeTimers();

		return BalloonEditor.create( element, {
			plugins: [ Paragraph, MediaEmbed, MediaEmbedCommentToolbar, CommentsUI, Bold ],
			cloudServices: {
				documentId: 'test',
				tokenUrl: 'abc'
			},
			balloonToolbar: [ 'bold', 'comment' ],
			sidebar: {
				container: document.body
			}
		} ).then( _editor => {
			editor = _editor;
			mediaEmbedCommentToolbar = editor.plugins.get( MediaEmbedCommentToolbar );
			toolbar = mediaEmbedCommentToolbar._toolbar;
			balloon = editor.plugins.get( 'ContextualBalloon' );
			model = editor.model;
			balloonToolbar = editor.plugins.get( 'BalloonToolbar' );
		} );
	} );

	beforeEach( () => {
		editor.ui.focusTracker.isFocused = true;
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => element.remove() );
	} );

	it( 'balloon editor should be hidden when media widget is selected', () => {
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

	it( 'balloon editor should be visible when media widget is not selected', () => {
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
