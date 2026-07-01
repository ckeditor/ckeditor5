/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

describe( 'MediaEmbedResizeHandles', () => {
	let editor, editorElement, viewDocument;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );
	} );

	afterEach( async () => {
		vi.restoreAllMocks();

		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor && editor.state !== 'destroyed' ) {
			await editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( MediaEmbedResizeHandles.pluginName ).toBe( 'MediaEmbedResizeHandles' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedResizeHandles.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedResizeHandles.isPremiumPlugin ).toBe( false );
	} );

	it( 'should require WidgetResize', () => {
		expect( MediaEmbedResizeHandles.requires ).toContain( WidgetResize );
	} );

	describe( 'resizer attachment', () => {
		it( 'attaches a resizer to a media widget', async () => {
			editor = await createEditor();
			const attachToSpy = vi.spyOn( editor.plugins.get( WidgetResize ), 'attachTo' );

			_setModelData( editor.model, `[<media url="${ YOUTUBE_URL }"></media>]` );

			// change:data listener fires at low priority after conversion.
			expect( attachToSpy ).toHaveBeenCalledOnce();
			expect( attachToSpy.mock.calls[ 0 ][ 0 ] ).toHaveProperty( 'unit', '%' );
		} );

		it( 'should use `mediaEmbed.resizeUnit` from config as the resizer unit', async () => {
			editor = await ClassicEditor.create( {
				attachTo: editorElement,
				plugins: [ Widget, Paragraph, MediaEmbedEditing, MediaEmbedResizeEditing, MediaEmbedResizeHandles ],
				mediaEmbed: { resizeUnit: 'px' }
			} );
			viewDocument = editor.editing.view.document;
			await focusEditor( editor );

			const attachToSpy = vi.spyOn( editor.plugins.get( WidgetResize ), 'attachTo' );

			_setModelData( editor.model, `[<media url="${ YOUTUBE_URL }"></media>]` );

			expect( attachToSpy ).toHaveBeenCalledOnce();
			expect( attachToSpy.mock.calls[ 0 ][ 0 ] ).toHaveProperty( 'unit', 'px' );
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

			expect( widgetResize.getResizerByViewElement( viewElement ) ).not.toBeUndefined();
		} );

		it( 'attaches a resizer to media nested inside an inserted block container', async () => {
			editor = await createEditor();

			// Make blockQuote allow media (default schema does, but be explicit for the test).
			editor.model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
			editor.conversion.elementToElement( { model: 'blockQuote', view: 'blockquote' } );

			const root = editor.model.document.getRoot();
			const widgetResize = editor.plugins.get( WidgetResize );

			editor.model.change( writer => {
				const blockQuote = writer.createElement( 'blockQuote' );
				const media = writer.createElement( 'media', { url: YOUTUBE_URL } );

				writer.append( media, blockQuote );
				writer.append( blockQuote, root );
			} );

			const insertedBlockQuote = root.getChild( 1 );
			const mediaModel = insertedBlockQuote.getChild( 0 );
			const viewElement = editor.editing.mapper.toViewElement( mediaModel );

			expect( widgetResize.getResizerByViewElement( viewElement ) ).not.toBeUndefined();
		} );

		it( 'does not attach a duplicate resizer when another element is inserted', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `<media url="${ YOUTUBE_URL }"></media><paragraph>[]</paragraph>` );

			const attachToSpy = vi.spyOn( editor.plugins.get( WidgetResize ), 'attachTo' );

			// Insert another paragraph — triggers a change:data with an element insert,
			// but the change-listener should skip media that already have a resizer attached.
			editor.model.change( writer => {
				writer.insertElement( 'paragraph', editor.model.document.getRoot(), 'end' );
			} );

			expect( attachToSpy ).not.toHaveBeenCalled();
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
			expect( plugin.isEnabled ).toBe( true );

			commandEnabled = false;
			command.refresh();
			expect( plugin.isEnabled ).toBe( false );
		} );

		it( 'does not iterate media on text-only changes (typing)', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `<paragraph>x[]</paragraph><media url="${ YOUTUBE_URL }"></media>` );

			const attachToSpy = vi.spyOn( editor.plugins.get( WidgetResize ), 'attachTo' );

			// Type a character in the paragraph — a text-only data change.
			editor.model.change( writer => {
				writer.insertText( 'y', editor.model.document.selection.getFirstPosition() );
			} );

			expect( attachToSpy ).not.toHaveBeenCalled();
		} );

		it( 'propagates plugin.isEnabled=false to existing resizers', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `[<media url="${ YOUTUBE_URL }"></media>]` );

			const widgetResize = editor.plugins.get( WidgetResize );
			const command = editor.commands.get( 'resizeMediaEmbed' );
			const mediaModel = editor.model.document.getRoot().getChild( 0 );
			const resizer = widgetResize.getResizerByViewElement( editor.editing.mapper.toViewElement( mediaModel ) );

			expect( resizer.isEnabled, 'resizer enabled while command is enabled' ).toBe( true );

			// Force the command off. plugin.isEnabled is bound to it, and each resizer's isEnabled is bound to the plugin.
			command.on( 'set:isEnabled', evt => {
				evt.return = false;
				evt.stop();
			}, { priority: 'highest' } );
			command.refresh();

			expect( resizer.isEnabled, 'resizer disabled once command is disabled' ).toBe( false );
		} );

		it( 'keeps the same resizer when the URL changes between providers', async () => {
			editor = await createEditor();

			_setModelData( editor.model, `[<media url="${ YOUTUBE_URL }"></media>]` );

			const widgetResize = editor.plugins.get( WidgetResize );
			const mediaModel = editor.model.document.getRoot().getChild( 0 );
			const viewElement = editor.editing.mapper.toViewElement( mediaModel );
			const resizerBefore = widgetResize.getResizerByViewElement( viewElement );

			editor.model.change( writer => writer.setAttribute( 'url', 'https://vimeo.com/1234', mediaModel ) );

			expect( widgetResize.getResizerByViewElement( viewElement ) ).toBe( resizerBefore );
		} );

		it( 'attaches a resizer even when the url attribute is missing', async () => {
			editor = await createEditor();
			const attachToSpy = vi.spyOn( editor.plugins.get( WidgetResize ), 'attachTo' );

			editor.model.change( writer => {
				const media = writer.createElement( 'media' );
				writer.append( media, editor.model.document.getRoot() );
			} );

			expect( attachToSpy ).toHaveBeenCalledOnce();
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
			const commandSpy = vi.spyOn( editor.commands.get( 'resizeMediaEmbed' ), 'execute' );
			const widget = viewDocument.getRoot().getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const finalPoint = getHandleCenterPoint( domParts.widget, 'bottom-right' ).moveBy( -20, -20 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPoint );

			expect( commandSpy ).toHaveBeenCalledOnce();
			expect( commandSpy.mock.calls[ 0 ][ 0 ] ).toHaveProperty( 'width' );
			expect( commandSpy.mock.calls[ 0 ][ 0 ].width ).toMatch( /\d+%/ );
		} );

		it( 'adds the media_resized class during drag', () => {
			const widget = viewDocument.getRoot().getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const initialPoint = getHandleCenterPoint( domParts.widget, 'bottom-right' );

			resizerMouseSimulator.down( editor, domParts.resizeHandle );
			resizerMouseSimulator.move( editor, domParts.resizeHandle, null, initialPoint.clone().moveBy( -10, -10 ) );

			expect( widget.hasClass( 'media_resized' ) ).toBe( true );

			resizerMouseSimulator.up( editor );
		} );

		it( 'does not add the media_resized class twice on repeated updateSize', () => {
			const widget = viewDocument.getRoot().getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const initialPoint = getHandleCenterPoint( domParts.widget, 'bottom-right' );

			resizerMouseSimulator.down( editor, domParts.resizeHandle );

			// First move: adds the class.
			resizerMouseSimulator.move( editor, domParts.resizeHandle, null, initialPoint.clone().moveBy( -10, -10 ) );
			expect( widget.hasClass( 'media_resized' ) ).toBe( true );

			// Second move: the branch `if (!hasClass)` should be false, nothing to add.
			resizerMouseSimulator.move( editor, domParts.resizeHandle, null, initialPoint.clone().moveBy( -20, -20 ) );
			expect( widget.hasClass( 'media_resized' ) ).toBe( true );

			resizerMouseSimulator.up( editor );
		} );

		it( 'removes the media_resized class if the command is overridden and no attribute is set', () => {
			// Stub execute to simulate the command being overridden (e.g. by Track Changes).
			vi.spyOn( editor.commands.get( 'resizeMediaEmbed' ), 'execute' ).mockImplementation( () => {} );

			const widget = viewDocument.getRoot().getChild( 0 );
			const domParts = getWidgetDomParts( editor, widget, 'bottom-right' );
			const finalPoint = getHandleCenterPoint( domParts.widget, 'bottom-right' ).moveBy( -10, -10 );

			resizerMouseSimulator.dragTo( editor, domParts.resizeHandle, finalPoint );

			expect( widget.hasClass( 'media_resized' ) ).toBe( false );
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
			expect( multiRoot.model.document.getRoot( 'main' ) ).toBeNull();

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

			expect( widgetResize.getResizerByViewElement( fooViewElement ) ).not.toBeUndefined();
			expect( widgetResize.getResizerByViewElement( barViewElement ) ).not.toBeUndefined();
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
