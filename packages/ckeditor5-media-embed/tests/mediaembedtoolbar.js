/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { BalloonEditor } from '@ckeditor/ckeditor5-editor-balloon';
import { MediaEmbed } from '../src/mediaembed.js';
import { MediaEmbedStyle } from '../src/mediaembedstyle.js';
import { MediaEmbedToolbar } from '../src/mediaembedtoolbar.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { View, ButtonView } from '@ckeditor/ckeditor5-ui';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';

describe( 'MediaEmbedToolbar', () => {
	let editor, element, widgetToolbarRepository, balloon, toolbar, model;

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedToolbar.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedToolbar.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( MediaEmbedToolbar ) ).toBeInstanceOf( MediaEmbedToolbar );
	} );

	describe( 'toolbar', () => {
		it( 'should use the config.table.tableWidget to create items', () => {
			// Make sure that toolbar is empty before first show.
			expect( toolbar.items.length ).toBe( 0 );

			editor.ui.focusTracker.isFocused = true;

			_setModelData( model, '[<media url=""></media>]' );

			expect( toolbar.items ).toHaveLength( 1 );
			expect( toolbar.items.get( 0 ).label ).toBe( 'fake button' );
		} );

		it( 'should set proper CSS classes', () => {
			const spy = vi.spyOn( balloon, 'add' );

			editor.ui.focusTracker.isFocused = true;

			_setModelData( model, '[<media url=""></media>]' );

			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( {
				view: toolbar,
				balloonClassName: 'ck-toolbar-container'
			} ) );
		} );

		it( 'should set aria-label attribute', () => {
			toolbar.render();

			expect( toolbar.element.getAttribute( 'aria-label' ) ).toBe( 'Media toolbar' );

			toolbar.destroy();
		} );

		it( 'normalizes media style dropdown definitions in the toolbar config to their registered names', async () => {
			// Custom dropdown definition entries in `config.mediaEmbed.toolbar` must be flattened
			// to their `.name` strings so the toolbar resolves them against the component factory
			// (and renders the SplitButtonView our UI plugin registers) instead of treating each
			// object as a generic nested-toolbar grouping.
			const localElement = document.createElement( 'div' );
			document.body.appendChild( localElement );

			const localEditor = await ClassicTestEditor.create( localElement, {
				plugins: [ Paragraph, MediaEmbed, MediaEmbedToolbar, FakeButton ],
				mediaEmbed: {
					toolbar: [
						'fake_button',
						{
							name: 'fake_dropdown',
							title: 'Fake dropdown',
							items: [ 'fake_button' ],
							defaultItem: 'fake_button'
						}
					]
				}
			} );

			const repo = localEditor.plugins.get( 'WidgetToolbarRepository' );
			const items = repo._toolbarDefinitions.get( 'mediaEmbed' ).itemsConfig;

			expect( items ).toEqual( [ 'fake_button', 'fake_dropdown' ] );

			localElement.remove();
			await localEditor.destroy();
		} );

		it( 'drops mediaEmbed: dropdown names that the style UI did not register', async () => {
			// `wrapText` groups `alignLeft` + `alignRight`. Filtering both out leaves zero items,
			// so `MediaEmbedStyleUI` skips registering `mediaEmbed:wrapText`. Without the toolbar-side
			// filter the contextual toolbar would crash on render with `componentfactory-item-missing`.
			const localElement = document.createElement( 'div' );
			document.body.appendChild( localElement );

			const localEditor = await ClassicTestEditor.create( localElement, {
				plugins: [ Paragraph, MediaEmbed, MediaEmbedStyle, MediaEmbedToolbar ],
				mediaEmbed: {
					styles: { options: [ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ] },
					toolbar: [ 'mediaEmbed:wrapText', 'mediaEmbed:breakText' ]
				}
			} );

			const factory = localEditor.ui.componentFactory;
			expect( factory.has( 'mediaEmbed:wrapText' ) ).toBe( false );
			expect( factory.has( 'mediaEmbed:breakText' ) ).toBe( true );

			const repo = localEditor.plugins.get( 'WidgetToolbarRepository' );
			const items = repo._toolbarDefinitions.get( 'mediaEmbed' ).itemsConfig;

			expect( items ).toEqual( [ 'mediaEmbed:breakText' ] );

			localElement.remove();
			await localEditor.destroy();
		} );

		it( 'passes generic nested toolbar groupings ({ label, items }) through unchanged', async () => {
			// Generic groupings have no `defaultItem` so they are not media-style dropdowns —
			// the toolbar machinery handles them. The filter must not call `.startsWith()` on them.
			const localElement = document.createElement( 'div' );
			document.body.appendChild( localElement );

			const grouping = { label: 'Group', items: [ 'fake_button' ] };
			const localEditor = await ClassicTestEditor.create( localElement, {
				plugins: [ Paragraph, MediaEmbed, MediaEmbedToolbar, FakeButton ],
				mediaEmbed: {
					toolbar: [ 'fake_button', grouping ]
				}
			} );

			const repo = localEditor.plugins.get( 'WidgetToolbarRepository' );
			const items = repo._toolbarDefinitions.get( 'mediaEmbed' ).itemsConfig;

			expect( items ).toEqual( [ 'fake_button', grouping ] );

			localElement.remove();
			await localEditor.destroy();
		} );

		it( 'drops custom dropdown objects whose name was not registered', async () => {
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const localElement = document.createElement( 'div' );
			document.body.appendChild( localElement );

			const localEditor = await ClassicTestEditor.create( localElement, {
				plugins: [ Paragraph, MediaEmbed, MediaEmbedStyle, MediaEmbedToolbar ],
				mediaEmbed: {
					toolbar: [
						'mediaEmbed:breakText',
						{
							name: 'mediaEmbed:custom',
							title: 'Custom',
							items: [ 'mediaEmbed:alignCenter' ],
							defaultItem: 'mediaEmbed:notListed'
						}
					]
				}
			} );

			expect( warnStub.mock.calls[ 0 ][ 0 ] ).toMatch( /^media-style-configuration-definition-invalid/ );

			const factory = localEditor.ui.componentFactory;
			expect( factory.has( 'mediaEmbed:custom' ) ).toBe( false );

			const repo = localEditor.plugins.get( 'WidgetToolbarRepository' );
			const items = repo._toolbarDefinitions.get( 'mediaEmbed' ).itemsConfig;

			expect( items ).toEqual( [ 'mediaEmbed:breakText' ] );

			localElement.remove();
			await localEditor.destroy();
		} );
	} );

	describe( 'integration with the editor focus', () => {
		it( 'should show the toolbar when the editor gains focus and the media widget is selected', () => {
			editor.ui.focusTracker.isFocused = true;

			_setModelData( editor.model, '[<media url=""></media>]' );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).toBeNull();

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).toBe( toolbar );
		} );

		it( 'should hide the toolbar when the editor loses focus and the media widget is selected', () => {
			editor.ui.focusTracker.isFocused = false;

			_setModelData( editor.model, '[<media url=""></media>]' );

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).toBe( toolbar );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).toBeNull();
		} );
	} );

	describe( 'integration with the editor selection', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'should show the toolbar on ui#update when the media widget is selected', () => {
			_setModelData( editor.model, '<paragraph>[foo]</paragraph><media url=""></media>' );

			expect( balloon.visibleView ).toBeNull();

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).toBeNull();

			editor.model.change( writer => {
				// Select the [<media></media>]
				writer.setSelection( editor.model.document.getRoot().getChild( 1 ), 'on' );
			} );

			expect( balloon.visibleView ).toBe( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).toBe( toolbar );
		} );

		it( 'should not engage when the toolbar is in the balloon yet invisible', () => {
			_setModelData( editor.model, '<media url=""></media>' );

			expect( balloon.visibleView ).toBe( toolbar );

			const lastView = new View();
			lastView.element = document.createElement( 'div' );

			balloon.add( {
				view: lastView,
				position: {
					target: document.body
				}
			} );

			expect( balloon.visibleView ).toBe( lastView );

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).toBe( lastView );
		} );

		it( 'should hide the toolbar on ui#update if the media is de–selected', () => {
			_setModelData( model, '<paragraph>foo</paragraph>[<media url=""></media>]' );

			expect( balloon.visibleView ).toBe( toolbar );

			model.change( writer => {
				// Select the <paragraph>[...]</paragraph>
				writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
			} );

			expect( balloon.visibleView ).toBeNull();

			// Make sure successive change does not throw, e.g. attempting
			// to remove the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).toBeNull();
		} );
	} );
} );

describe( 'MediaEmbedToolbar - integration with BalloonEditor', () => {
	let editor, balloonToolbar, element, widgetToolbarRepository, balloon, toolbar, model;

	afterEach( () => {
		vi.useRealTimers();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		vi.useFakeTimers();

		return BalloonEditor.create( element, {
			plugins: [ Paragraph, MediaEmbed, MediaEmbedToolbar, FakeButton, Bold ],
			balloonToolbar: [ 'bold' ],
			mediaEmbed: {
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
		_setModelData( model, '<paragraph>[abc]</paragraph><media url=""></media>' );
		editor.editing.view.document.isFocused = true;

		expect( balloon.visibleView ).toBeNull();

		model.change( writer => {
			// Select the [<media></media>]
			writer.setSelection( model.document.getRoot().getChild( 1 ), 'on' );
		} );

		expect( balloon.visibleView ).toBe( toolbar );

		vi.advanceTimersByTime( 200 );

		expect( balloon.visibleView ).toBe( toolbar );
	} );

	it( 'balloon toolbar should be visible when media widget is not selected', () => {
		_setModelData( model, '<paragraph>abc</paragraph>[<media url=""></media>]' );
		editor.editing.view.document.isFocused = true;

		expect( balloon.visibleView ).toBe( toolbar );

		model.change( writer => {
			// Select the <paragraph>[abc]</paragraph>
			writer.setSelection( model.document.getRoot().getChild( 0 ), 'in' );
		} );

		vi.advanceTimersByTime( 200 );

		expect( balloon.visibleView ).toBe( balloonToolbar.toolbarView );
	} );

	it( 'does not create the toolbar if its items are not specified', () => {
		const consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const element = document.createElement( 'div' );

		return BalloonEditor.create( element, {
			plugins: [ Paragraph, MediaEmbed, MediaEmbedToolbar, Bold ]
		} ).then( editor => {
			widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );

			expect( widgetToolbarRepository._toolbarDefinitions.get( 'mediaEmbed' ) ).toBeUndefined();
			expect( consoleWarnStub ).toHaveBeenCalledOnce();
			expect( consoleWarnStub.mock.calls[ 0 ][ 0 ] ).toMatch( /^widget-toolbar-no-items/ );

			element.remove();
			return editor.destroy();
		} );
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
