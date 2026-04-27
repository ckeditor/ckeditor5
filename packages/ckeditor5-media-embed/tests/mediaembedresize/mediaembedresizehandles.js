/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// ClassicTestEditor can't be used, as it doesn't handle the focus, which is needed to test resizer visual cues.
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Widget, WidgetResize } from '@ckeditor/ckeditor5-widget';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import {
	focusEditor,
	resizerMouseSimulator,
	getWidgetDomParts,
	getHandleCenterPoint
} from '@ckeditor/ckeditor5-widget/tests/widgetresize/_utils/utils.js';

import { MediaEmbedEditing } from '../../src/mediaembedediting.js';
import { MediaEmbedResizeEditing } from '../../src/mediaembedresize/mediaembedresizeediting.js';
import { MediaEmbedResizeHandles } from '../../src/mediaembedresize/mediaembedresizehandles.js';

const YOUTUBE_URL = 'https://youtu.be/foo';
const SPOTIFY_URL = 'https://open.spotify.com/track/foo';

describe( 'MediaEmbedResizeHandles', () => {
	let editor, editorElement, viewDocument;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor && editor.state !== 'destroyed' ) {
			await editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( MediaEmbedResizeHandles.pluginName ).to.equal( 'MediaEmbedResizeHandles' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedResizeHandles.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedResizeHandles.isPremiumPlugin ).to.be.false;
	} );

	it( 'should require WidgetResize', () => {
		expect( MediaEmbedResizeHandles.requires ).to.include( WidgetResize );
	} );

	describe( 'resizer attachment', () => {
		it( 'attaches a resizer to a media widget', async () => {
			editor = await createEditor();
			const attachToSpy = sinon.spy( editor.plugins.get( WidgetResize ), 'attachTo' );

			_setModelData( editor.model, `[<media url="${ YOUTUBE_URL }"></media>]` );

			// change:data listener fires at low priority after conversion.
			expect( attachToSpy.calledOnce ).to.be.true;
			expect( attachToSpy.args[ 0 ][ 0 ] ).to.have.property( 'unit', '%' );
		} );

		it( 'attaches resizers to media present in the initial data', async () => {
			editor = await createEditor();

			const root = editor.model.document.getRoot();
			const widgetResize = editor.plugins.get( WidgetResize );

			editor.model.change( writer => {
				const media = writer.createElement( 'media', { url: YOUTUBE_URL } );
				writer.append( media, root );
			} );

			const mediaModel = root.getChild( 1 );
			const viewElement = editor.editing.mapper.toViewElement( mediaModel );

			expect( widgetResize.getResizerByViewElement( viewElement ) ).to.not.be.undefined;
		} );

		it( 'does not attach a duplicate resizer when another element is inserted', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `<media url="${ YOUTUBE_URL }"></media><paragraph>[]</paragraph>` );

			const attachToSpy = sinon.spy( editor.plugins.get( WidgetResize ), 'attachTo' );

			// Insert another paragraph — triggers a change:data with an element insert,
			// which re-runs the sweep but should skip the already-attached media.
			editor.model.change( writer => {
				writer.insertElement( 'paragraph', editor.model.document.getRoot(), 'end' );
			} );

			expect( attachToSpy.called ).to.be.false;
		} );

		it( 'attaches a disabled resizer to a non-resizable provider (Spotify)', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `[<media url="${ SPOTIFY_URL }"></media>]` );

			const widgetResize = editor.plugins.get( WidgetResize );
			const mediaModel = editor.model.document.getRoot().getChild( 0 );
			const viewElement = editor.editing.mapper.toViewElement( mediaModel );
			const resizer = widgetResize.getResizerByViewElement( viewElement );

			expect( resizer, 'resizer is attached' ).to.not.be.undefined;
			expect( resizer.isEnabled, 'resizer is disabled' ).to.be.false;
		} );

		it( 'binds the plugin isEnabled state to the resizeMediaEmbed command', async () => {
			editor = await createEditor();
			const plugin = editor.plugins.get( MediaEmbedResizeHandles );
			const command = editor.commands.get( 'resizeMediaEmbed' );

			let commandEnabled = true;
			command.on( 'set:isEnabled', evt => {
				evt.return = commandEnabled;
				evt.stop();
			}, { priority: 'highest' } );

			command.refresh();
			expect( plugin.isEnabled ).to.be.true;

			commandEnabled = false;
			command.refresh();
			expect( plugin.isEnabled ).to.be.false;
		} );

		it( 'does not sweep for media on text-only changes (typing)', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `<paragraph>x[]</paragraph><media url="${ YOUTUBE_URL }"></media>` );

			const attachToSpy = sinon.spy( editor.plugins.get( WidgetResize ), 'attachTo' );

			// Type a character in the paragraph — a text-only data change.
			editor.model.change( writer => {
				writer.insertText( 'y', editor.model.document.selection.getFirstPosition() );
			} );

			expect( attachToSpy.called ).to.be.false;
		} );

		it( 'disables the resizer when the URL changes to a non-resizable provider', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `[<media url="${ YOUTUBE_URL }"></media>]` );

			const widgetResize = editor.plugins.get( WidgetResize );
			const mediaModel = editor.model.document.getRoot().getChild( 0 );
			const viewElement = editor.editing.mapper.toViewElement( mediaModel );
			const resizer = widgetResize.getResizerByViewElement( viewElement );

			expect( resizer.isEnabled, 'resizer enabled initially' ).to.be.true;

			editor.model.change( writer => writer.setAttribute( 'url', SPOTIFY_URL, mediaModel ) );

			expect( resizer.isEnabled, 'resizer disabled after switch' ).to.be.false;
		} );

		it( 'enables the resizer when the URL changes from a non-resizable to a resizable provider', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `[<media url="${ SPOTIFY_URL }"></media>]` );

			const widgetResize = editor.plugins.get( WidgetResize );
			const mediaModel = editor.model.document.getRoot().getChild( 0 );
			const viewElement = editor.editing.mapper.toViewElement( mediaModel );
			const resizer = widgetResize.getResizerByViewElement( viewElement );

			expect( resizer.isEnabled, 'resizer disabled initially' ).to.be.false;

			editor.model.change( writer => writer.setAttribute( 'url', YOUTUBE_URL, mediaModel ) );

			expect( resizer.isEnabled, 'resizer enabled after switch' ).to.be.true;
		} );

		it( 'clears inline width and media_resized class from the figure after switching to a non-resizable provider', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `[<media resizedWidth="50%" url="${ YOUTUBE_URL }"></media>]` );

			const mediaModel = editor.model.document.getRoot().getChild( 0 );
			const viewElement = editor.editing.mapper.toViewElement( mediaModel );

			expect( viewElement.getStyle( 'width' ), 'inline width set initially' ).to.equal( '50%' );
			expect( viewElement.hasClass( 'media_resized' ), 'class set initially' ).to.be.true;

			editor.model.change( writer => writer.setAttribute( 'url', SPOTIFY_URL, mediaModel ) );

			expect( viewElement.getStyle( 'width' ), 'inline width cleared after switch' ).to.be.undefined;
			expect( viewElement.hasClass( 'media_resized' ), 'class cleared after switch' ).to.be.false;
		} );

		it( 'propagates plugin.isEnabled=false to existing resizers', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `[<media url="${ YOUTUBE_URL }"></media>]` );

			const widgetResize = editor.plugins.get( WidgetResize );
			const command = editor.commands.get( 'resizeMediaEmbed' );
			const mediaModel = editor.model.document.getRoot().getChild( 0 );
			const resizer = widgetResize.getResizerByViewElement( editor.editing.mapper.toViewElement( mediaModel ) );

			expect( resizer.isEnabled, 'resizer enabled while command is enabled' ).to.be.true;

			// Force the command off; plugin.isEnabled is bound to it and change:isEnabled should re-sync resizers.
			command.on( 'set:isEnabled', evt => {
				evt.return = false;
				evt.stop();
			}, { priority: 'highest' } );
			command.refresh();

			expect( resizer.isEnabled, 'resizer disabled once command is disabled' ).to.be.false;
		} );

		it( 'keeps the same resizer when the URL changes between two resizable providers', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `[<media url="${ YOUTUBE_URL }"></media>]` );

			const widgetResize = editor.plugins.get( WidgetResize );
			const mediaModel = editor.model.document.getRoot().getChild( 0 );
			const viewElement = editor.editing.mapper.toViewElement( mediaModel );
			const resizerBefore = widgetResize.getResizerByViewElement( viewElement );

			editor.model.change( writer => writer.setAttribute( 'url', 'https://vimeo.com/1234', mediaModel ) );

			expect( widgetResize.getResizerByViewElement( viewElement ) ).to.equal( resizerBefore );
		} );

		it( 'falls back to an empty string when the url attribute is missing', async () => {
			editor = await createEditor();
			const attachToSpy = sinon.spy( editor.plugins.get( WidgetResize ), 'attachTo' );

			// Insert a media element without a url attribute. isMediaResizable('') returns true,
			// so a resizer should still be attached.
			editor.model.change( writer => {
				const media = writer.createElement( 'media' );
				writer.append( media, editor.model.document.getRoot() );
			} );

			expect( attachToSpy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'drag-to-resize', () => {
		beforeEach( async () => {
			editor = await createEditor();

			_setModelData( editor.model, `[<media url="${ YOUTUBE_URL }"></media>]` );

			// Enforce selection on media widget.
			editor.model.change( writer => {
				writer.setSelection( editor.model.document.getRoot().getChild( 0 ), 'on' );
			} );
		} );

		it( 'executes the resizeMediaEmbed command on drag commit', () => {
			const commandSpy = sinon.spy( editor.commands.get( 'resizeMediaEmbed' ), 'execute' );
			const widget = viewDocument.getRoot().getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const finalPoint = getHandleCenterPoint( domParts.widget, 'bottom-right' ).moveBy( -20, -20 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPoint );

			expect( commandSpy.calledOnce ).to.be.true;
			expect( commandSpy.args[ 0 ][ 0 ] ).to.have.property( 'width' );
			expect( commandSpy.args[ 0 ][ 0 ].width ).to.match( /\d+%/ );
		} );

		it( 'adds the media_resized class during drag', () => {
			const widget = viewDocument.getRoot().getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const initialPoint = getHandleCenterPoint( domParts.widget, 'bottom-right' );

			resizerMouseSimulator.down( editor, domParts.resizeHandle );
			resizerMouseSimulator.move( editor, domParts.resizeHandle, null, initialPoint.clone().moveBy( -10, -10 ) );

			expect( widget.hasClass( 'media_resized' ) ).to.be.true;

			resizerMouseSimulator.up( editor );
		} );

		it( 'does not add the media_resized class twice on repeated updateSize', () => {
			const widget = viewDocument.getRoot().getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const initialPoint = getHandleCenterPoint( domParts.widget, 'bottom-right' );

			resizerMouseSimulator.down( editor, domParts.resizeHandle );

			// First move: adds the class.
			resizerMouseSimulator.move( editor, domParts.resizeHandle, null, initialPoint.clone().moveBy( -10, -10 ) );
			expect( widget.hasClass( 'media_resized' ) ).to.be.true;

			// Second move: the branch `if (!hasClass)` should be false, nothing to add.
			resizerMouseSimulator.move( editor, domParts.resizeHandle, null, initialPoint.clone().moveBy( -20, -20 ) );
			expect( widget.hasClass( 'media_resized' ) ).to.be.true;

			resizerMouseSimulator.up( editor );
		} );

		it( 'removes the media_resized class if the command is overridden and no attribute is set', () => {
			// Stub execute to simulate the command being overridden (e.g. by Track Changes).
			sinon.stub( editor.commands.get( 'resizeMediaEmbed' ), 'execute' );

			const widget = viewDocument.getRoot().getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const finalPoint = getHandleCenterPoint( domParts.widget, 'bottom-right' ).moveBy( -10, -10 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPoint );

			expect( widget.hasClass( 'media_resized' ) ).to.be.false;
		} );
	} );

	describe( 'multi-root editor integration', () => {
		let multiRoot;

		beforeEach( async () => {
			multiRoot = await MultiRootEditor.create( {
				roots: {
					foo: { element: document.createElement( 'div' ) },
					bar: { element: document.createElement( 'div' ) }
				},
				plugins: [
					Widget,
					Paragraph,
					MediaEmbedEditing,
					MediaEmbedResizeEditing,
					MediaEmbedResizeHandles
				]
			} );
		} );

		afterEach( async () => {
			await multiRoot.destroy();
		} );

		it( 'attaches a resizer to media widgets in every root (no "main" root)', () => {
			// Guards the regression where `getRoot()` (defaulting to "main") would return null
			// and skip resizer creation entirely, and where only the "main" root would be processed.
			expect( multiRoot.model.document.getRoot( 'main' ) ).to.be.null;

			const widgetResize = multiRoot.plugins.get( WidgetResize );

			let fooMedia, barMedia;
			multiRoot.model.change( writer => {
				fooMedia = writer.createElement( 'media', { url: YOUTUBE_URL } );
				barMedia = writer.createElement( 'media', { url: YOUTUBE_URL } );

				writer.append( fooMedia, multiRoot.model.document.getRoot( 'foo' ) );
				writer.append( barMedia, multiRoot.model.document.getRoot( 'bar' ) );
			} );

			const fooViewElement = multiRoot.editing.mapper.toViewElement( fooMedia );
			const barViewElement = multiRoot.editing.mapper.toViewElement( barMedia );

			expect( widgetResize.getResizerByViewElement( fooViewElement ) ).to.not.be.undefined;
			expect( widgetResize.getResizerByViewElement( barViewElement ) ).to.not.be.undefined;
		} );
	} );

	async function createEditor() {
		const newEditor = await ClassicEditor.create( {
			attachTo: editorElement,
			plugins: [
				Widget,
				Paragraph,
				MediaEmbedEditing,
				MediaEmbedResizeEditing,
				MediaEmbedResizeHandles
			]
		} );

		viewDocument = newEditor.editing.view.document;

		await focusEditor( newEditor );

		return newEditor;
	}
} );
