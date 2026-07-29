/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { global, env } from '@ckeditor/ckeditor5-utils';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BalloonToolbar, BlockToolbar } from '@ckeditor/ckeditor5-ui';
import { Heading, HeadingButtonsUI } from '@ckeditor/ckeditor5-heading';
import { Paragraph, ParagraphButtonUI } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import { ClassicTestEditor } from '../../_utils/classictesteditor.js';
import { Plugin } from '../../../src/plugin.js';
import { getEditorUsageData } from '../../../src/editor/utils/editorusagedata.js';

describe( 'getEditorUsageData()', () => {
	let domElement, editor;

	beforeEach( () => {
		editor = null;
		domElement = global.document.body.appendChild( global.document.createElement( 'div' ) );
	} );

	afterEach( async () => {
		domElement.remove();

		if ( editor && editor.state !== 'destroyed' ) {
			await editor.destroy();
		}
	} );

	it( 'should return basic properties about editor', async () => {
		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Essentials
			]
		} );

		const usageData = getEditorUsageData( editor );

		expect( usageData ).toMatchObject( {
			hostname: 'localhost',
			version: globalThis.CKEDITOR_VERSION,
			type: 'Editor'
		} );

		expect( usageData.plugins.map( ( { name } ) => name ) ).toEqual( [
			'Dialog', 'AccessibilityHelp', 'ClipboardMarkersUtils', 'ClipboardPipeline', 'Enter', 'Delete', 'WidgetTypeAround',
			'Widget', 'DragDropTarget', 'DragDropBlockToolbar', 'DragDrop', 'PastePlainText', 'Clipboard', 'SelectAllEditing',
			'SelectAllUI', 'SelectAll', 'ShiftEnter', 'Input', 'Typing', 'UndoEditing', 'UndoUI', 'Undo', 'Essentials'
		] );

		expect( usageData.distribution ).toEqual( {
			channel: 'sh'
		} );

		expect( usageData.menuBar ).toEqual( {
			isVisible: false
		} );

		expect( usageData.language ).toEqual( {
			ui: 'en',
			content: 'en'
		} );

		expect( usageData.toolbar ).toEqual( {
			main: undefined,
			block: undefined,
			balloon: undefined
		} );
	} );

	describe( '#pageSessionId', () => {
		beforeEach( () => {
			delete global.window.CKEDITOR_PAGE_SESSION_ID;
		} );

		it( 'should return unique page session id', async () => {
			editor = await ClassicTestEditor.create( domElement, {} );

			const usageData = getEditorUsageData( editor );

			expect( typeof usageData.pageSessionId ).toBe( 'string' );
		} );

		it( 'should return the same page session id for the same editor instance', async () => {
			editor = await ClassicTestEditor.create( domElement, {} );

			const usageData1 = getEditorUsageData( editor );
			const usageData2 = getEditorUsageData( editor );

			expect( usageData1.pageSessionId ).toBe( usageData2.pageSessionId );
		} );

		it( 'should return the same page session id for different editor instances', async () => {
			const domElement1 = global.document.body.appendChild( global.document.createElement( 'div' ) );
			const domElement2 = global.document.body.appendChild( global.document.createElement( 'div' ) );

			const editor1 = await ClassicTestEditor.create( domElement1, {} );
			const editor2 = await ClassicTestEditor.create( domElement2, {} );

			const usageData1 = getEditorUsageData( editor1 );
			const usageData2 = getEditorUsageData( editor2 );

			expect( usageData1.pageSessionId ).toBe( usageData2.pageSessionId );

			await editor1.destroy();
			await editor2.destroy();

			domElement1.remove();
			domElement2.remove();
		} );

		it( 'should store session id in global window object', async () => {
			editor = await ClassicTestEditor.create( domElement, {} );

			const usageData = getEditorUsageData( editor );

			expect( global.window.CKEDITOR_PAGE_SESSION_ID ).toBe( usageData.pageSessionId );
		} );

		it( 'should not use crypto API to generate session id', async () => {
			const spy = vi.spyOn( global.window.crypto, 'randomUUID' );

			editor = await ClassicTestEditor.create( domElement, {} );
			getEditorUsageData( editor );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( '#sessionId', () => {
		it( 'should return unique sessionId when one is not present', async () => {
			localStorage.removeItem( '__ckeditor-session-id' );

			editor = await ClassicTestEditor.create( domElement, {} );

			expect( typeof getEditorUsageData( editor ).sessionId ).toBe( 'string' );
		} );

		it( 'should return sessionId when present in local storage', async () => {
			localStorage.setItem( '__ckeditor-session-id', 'fake-session-id' );

			editor = await ClassicTestEditor.create( domElement, {} );

			expect( getEditorUsageData( editor ).sessionId ).toBe( 'fake-session-id' );
		} );

		it( 'should return the same session id for the same editor instance', async () => {
			editor = await ClassicTestEditor.create( domElement, {} );

			const usageData1 = getEditorUsageData( editor );
			const usageData2 = getEditorUsageData( editor );

			expect( usageData1.sessionId ).toBe( usageData2.sessionId );
		} );

		it( 'should return the same page session id for different editor instances', async () => {
			const domElement1 = global.document.body.appendChild( global.document.createElement( 'div' ) );
			const domElement2 = global.document.body.appendChild( global.document.createElement( 'div' ) );

			const editor1 = await ClassicTestEditor.create( domElement1, {} );
			const editor2 = await ClassicTestEditor.create( domElement2, {} );

			const usageData1 = getEditorUsageData( editor1 );
			const usageData2 = getEditorUsageData( editor2 );

			expect( usageData1.sessionId ).toBe( usageData2.sessionId );

			await editor1.destroy();
			await editor2.destroy();

			domElement1.remove();
			domElement2.remove();
		} );
	} );

	describe( '#env', () => {
		describe( 'os', () => {
			const os = [
				[ 'isMac', 'mac' ],
				[ 'isWindows', 'windows' ],
				[ 'isiOS', 'ios' ],
				[ 'isAndroid', 'android' ]
			];

			for ( const [ flag, osName ] of os ) {
				it( `should detect ${ osName } OS`, async () => {
					mockFlag( flag );

					editor = await ClassicTestEditor.create( domElement, {} );

					expect( getEditorUsageData( editor ).env ).toMatchObject( {
						os: osName
					} );
				} );
			}

			it( 'should return "unknown" when no OS flag matches', async () => {
				mockFlag( null );

				editor = await ClassicTestEditor.create( domElement, {} );

				expect( getEditorUsageData( editor ).env ).toMatchObject( {
					os: 'unknown'
				} );
			} );

			function mockFlag( mockFlag ) {
				for ( const [ flag ] of os ) {
					vi.spyOn( env, flag, 'get' ).mockReturnValue( flag === mockFlag );
				}
			}
		} );

		describe( 'browser', () => {
			const browsers = [
				[ 'isGecko', 'gecko' ],
				[ 'isBlink', 'blink' ],
				[ 'isSafari', 'safari' ]
			];

			for ( const [ flag, browser ] of browsers ) {
				it( `should detect ${ browser } browser`, async () => {
					mockFlag( flag );

					editor = await ClassicTestEditor.create( domElement, {} );

					expect( getEditorUsageData( editor ).env ).toMatchObject( {
						browser
					} );
				} );
			}

			it( 'should return "unknown" when no browser flag matches', async () => {
				mockFlag( null );

				editor = await ClassicTestEditor.create( domElement, {} );

				expect( getEditorUsageData( editor ).env ).toMatchObject( {
					browser: 'unknown'
				} );
			} );

			function mockFlag( mockFlag ) {
				for ( const [ flag ] of browsers ) {
					vi.spyOn( env, flag, 'get' ).mockReturnValue( flag === mockFlag );
				}
			}
		} );
	} );

	describe( '#plugins', () => {
		it( 'should return array of plugins with their isContext / isOfficial / isPremium properties', async () => {
			editor = await ClassicTestEditor.create( domElement, {
				plugins: [
					Bold
				]
			} );

			expect( getEditorUsageData( editor ).plugins ).toEqual( [
				makeBasePluginUsageData( 'BoldEditing', { isOfficial: true } ),
				makeBasePluginUsageData( 'BoldUI', { isOfficial: true } ),
				makeBasePluginUsageData( 'Bold', { isOfficial: true } )
			] );
		} );

		it( 'should skip plugin if it does not have pluginName defined', async () => {
			class NamedPlugin extends Plugin {
				static get pluginName() {
					return 'NamedPlugin';
				}

				init() {}
			}

			class AnonymousPlugin extends Plugin {
				init() {}
			}

			function FunctionPlugin() {}

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [
					NamedPlugin,
					AnonymousPlugin,
					FunctionPlugin
				]
			} );

			expect( getEditorUsageData( editor ).plugins ).toEqual( [
				makeBasePluginUsageData( 'NamedPlugin' )
			] );
		} );

		for ( const field of [ 'isContext', 'isOfficial', 'isPremium' ] ) {
			const pluginProperty = `${ field }Plugin`;

			it( `should pick ${ field }Plugin property from plugin to usage data`, async () => {
				class NamedPlugin extends Plugin {
					static get pluginName() {
						return 'NamedPlugin';
					}

					init() {}
				}

				Object.defineProperty( NamedPlugin, pluginProperty, {
					value: true
				} );

				editor = await ClassicTestEditor.create( domElement, {
					plugins: [
						NamedPlugin
					]
				} );

				expect( getEditorUsageData( editor ).plugins ).toEqual( [
					makeBasePluginUsageData( 'NamedPlugin', { [ field ]: true } )
				] );
			} );
		}
	} );

	describe( '#toolbar', () => {
		describe( 'main', () => {
			it( 'should return proper main toolbar usage data', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					toolbar: [ 'bold', 'undo', '|', 'redo' ],
					plugins: [
						Essentials
					]
				} );

				expect( getEditorUsageData( editor ).toolbar.main ).toEqual( {
					isMultiline: false,
					items: [ 'bold', 'undo', 'redo' ],
					shouldNotGroupWhenFull: false
				} );
			} );

			it( 'should not crash if toolbar items is not an array', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					toolbar: 'bold',
					plugins: [
						Essentials
					]
				} );

				expect( getEditorUsageData( editor ).toolbar.main ).toEqual( {
					isMultiline: false,
					items: [],
					shouldNotGroupWhenFull: false
				} );
			} );

			it( 'should pass flatten toolbar configuration to usage data', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					toolbar: [ { items: [ 'bold', 'undo' ], label: 'Foo' }, '|', 'redo' ],
					plugins: [
						Essentials
					]
				} );

				expect( getEditorUsageData( editor ).toolbar.main ).toEqual( {
					isMultiline: false,
					items: [ 'bold', 'undo', 'redo' ],
					shouldNotGroupWhenFull: false
				} );
			} );

			it( 'should properly forward `isMultiline` configuration entry', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					toolbar: {
						isMultiline: true,
						items: [ 'bold', 'undo', '-', 'redo' ]
					},
					plugins: [
						Essentials
					]
				} );

				expect( getEditorUsageData( editor ).toolbar.main ).toEqual( {
					isMultiline: true,
					items: [ 'bold', 'undo', 'redo' ],
					shouldNotGroupWhenFull: false
				} );
			} );

			it( 'should properly forward `shouldNotGroupWhenFull` configuration entry', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					toolbar: {
						items: [ 'bold', 'undo', '|', 'redo' ],
						shouldNotGroupWhenFull: true
					},
					plugins: [
						Essentials
					]
				} );

				expect( getEditorUsageData( editor ).toolbar.main ).toEqual( {
					isMultiline: false,
					items: [ 'bold', 'undo', 'redo' ],
					shouldNotGroupWhenFull: true
				} );
			} );
		} );

		describe( 'block', () => {
			it( 'should return proper block toolbar usage data', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					blockToolbar: [ 'paragraph', 'heading1', '|', 'heading2', 'blockQuote' ],
					plugins: [
						BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote
					]
				} );

				expect( getEditorUsageData( editor ).toolbar.block ).toEqual( {
					isMultiline: false,
					items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ],
					shouldNotGroupWhenFull: false
				} );
			} );

			it( 'should pass flatten block toolbar configuration to usage data', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					blockToolbar: [
						{ items: [ 'paragraph', 'heading1' ], label: 'Foo' }, '|', 'heading2', 'blockQuote'
					],
					plugins: [
						BlockToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote
					]
				} );

				expect( getEditorUsageData( editor ).toolbar.block ).toEqual( {
					isMultiline: false,
					items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ],
					shouldNotGroupWhenFull: false
				} );
			} );

			it( 'should properly forward `shouldNotGroupWhenFull` configuration entry', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					blockToolbar: {
						items: [ 'paragraph' ],
						shouldNotGroupWhenFull: true
					},
					plugins: [ BlockToolbar, Paragraph, ParagraphButtonUI ]
				} );

				expect( getEditorUsageData( editor ).toolbar.block ).toEqual( {
					isMultiline: false,
					items: [ 'paragraph' ],
					shouldNotGroupWhenFull: true
				} );
			} );
		} );

		describe( 'balloon', () => {
			it( 'should return proper balloon toolbar usage data', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					balloonToolbar: [ 'paragraph', 'heading1', '|', 'heading2', 'blockQuote' ],
					plugins: [
						BalloonToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote
					]
				} );

				expect( getEditorUsageData( editor ).toolbar.balloon ).toEqual( {
					isMultiline: false,
					items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ],
					shouldNotGroupWhenFull: false
				} );
			} );

			it( 'should pass flatten balloon toolbar configuration to usage data', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					balloonToolbar: [
						{ items: [ 'paragraph', 'heading1' ], label: 'Foo' }, '|', 'heading2', 'blockQuote'
					],
					plugins: [
						BalloonToolbar, Heading, HeadingButtonsUI, Paragraph, ParagraphButtonUI, BlockQuote
					]
				} );

				expect( getEditorUsageData( editor ).toolbar.balloon ).toEqual( {
					isMultiline: false,
					items: [ 'paragraph', 'heading1', 'heading2', 'blockQuote' ],
					shouldNotGroupWhenFull: false
				} );
			} );

			it( 'should properly forward `shouldNotGroupWhenFull` configuration entry', async () => {
				editor = await ClassicTestEditor.create( domElement, {
					balloonToolbar: {
						items: [ 'paragraph' ],
						shouldNotGroupWhenFull: true
					},
					plugins: [ BalloonToolbar, Paragraph, ParagraphButtonUI ]
				} );

				expect( getEditorUsageData( editor ).toolbar.balloon ).toEqual( {
					isMultiline: false,
					items: [ 'paragraph' ],
					shouldNotGroupWhenFull: true
				} );
			} );
		} );
	} );
} );

function makeBasePluginUsageData(
	name,
	{
		isContext = false,
		isOfficial = false,
		isPremium = false
	} = {}
) {
	return {
		name,
		isContext,
		isOfficial,
		isPremium
	};
}
