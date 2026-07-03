/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { AccessibilityHelp, ButtonView, MenuBarMenuListItemButtonView } from '../../../src/index.js';
import { env, global, keyCodes } from '@ckeditor/ckeditor5-utils';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { AccessibilityHelpContentView } from '../../../src/editorui/accessibilityhelp/accessibilityhelpcontentview.js';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';

describe( 'AccessibilityHelp', () => {
	let editor, plugin, dialogPlugin, domElement;

	beforeEach( async () => {
		vi.spyOn( env, 'isMac', 'get' ).mockReturnValue( false );
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				AccessibilityHelp
			]
		} );

		plugin = editor.plugins.get( AccessibilityHelp );
		dialogPlugin = editor.plugins.get( 'Dialog' );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( AccessibilityHelp.pluginName ).toBe( 'AccessibilityHelp' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( AccessibilityHelp.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( AccessibilityHelp.isPremiumPlugin ).toBe( false );
	} );

	describe( 'constructor()', () => {
		it( 'should have #contentView', () => {
			expect( plugin.contentView ).toBeNull();
		} );
	} );

	describe( 'init()', () => {
		it( 'should register Alt+0 keystroke that shows the dialog and cancels the event', () => {
			const dialogShowSpy = vi.fn();
			const keyEventData = {
				keyCode: keyCodes[ '0' ],
				altKey: true,
				preventDefault: vi.fn(),
				stopPropagation: vi.fn()
			};

			dialogPlugin.on( 'show:accessibilityHelp', dialogShowSpy );

			const wasHandled = editor.keystrokes.press( keyEventData );

			expect( wasHandled ).toBe( true );
			expect( keyEventData.preventDefault ).toHaveBeenCalledOnce();

			expect( dialogShowSpy ).toHaveBeenCalledOnce();
		} );

		describe( 'UI buttons', () => {
			let button;

			describe( 'toolbar', () => {
				beforeEach( () => {
					button = editor.ui.componentFactory.create( 'accessibilityHelp' );
				} );

				testButton( 'Accessibility help', 'Alt+0', ButtonView );

				it( 'should have tooltip', () => {
					expect( button.tooltip ).toBe( true );
				} );
			} );

			describe( 'menu bar', () => {
				beforeEach( () => {
					button = editor.ui.componentFactory.create( 'menuBar:accessibilityHelp' );
				} );

				testButton( 'Accessibility', 'Alt+0', MenuBarMenuListItemButtonView );
			} );

			function testButton( label, featureKeystroke, Component ) {
				it( 'should register feature component', () => {
					expect( button ).toBeInstanceOf( Component );
				} );

				it( 'should create UI component with correct attribute values', () => {
					expect( button.isOn ).toBe( false );
					expect( button.label ).toBe( label );
					expect( button.icon ).toMatch( /<svg / );
				} );

				it( 'should show dialog  on model execute event', () => {
					const dialogShowSpy = vi.fn();
					dialogPlugin.on( 'show:accessibilityHelp', dialogShowSpy );

					button.fire( 'execute' );

					expect( dialogShowSpy ).toHaveBeenCalledOnce();
				} );

				it( 'should set keystroke in the model', () => {
					expect( button.keystroke ).toBe( featureKeystroke );
				} );

				it( 'should set isOn=true if dialog is visible', () => {
					button.fire( 'execute' );

					expect( dialogPlugin.id ).toBe( 'accessibilityHelp' );
					expect( button.isOn ).toBe( true );

					button.fire( 'execute' );

					expect( dialogPlugin.id ).toBeNull();
					expect( button.isOn ).toBe( false );
				} );
			}
		} );

		describe( 'editor editing view root integration', () => {
			it( 'should inject label into a single root', () => {
				const viewRoot = editor.editing.view.document.getRoot( 'main' );
				const ariaLabel = viewRoot.getAttribute( 'aria-label' );

				expect( ariaLabel ).toBe( 'Rich Text Editor. Editing area: main. Press Alt+0 for help.' );
			} );

			it( 'should inject a label into a root with no aria-label', async () => {
				const editor = await ClassicTestEditor.create( domElement, {
					plugins: [
						AccessibilityHelp
					],
					label: ''
				} );

				const viewRoot = editor.editing.view.document.getRoot( 'main' );
				const ariaLabel = viewRoot.getAttribute( 'aria-label' );

				expect( ariaLabel ).toBe( 'Press Alt+0 for help.' );

				await editor.destroy();
			} );

			it( 'should work for multiple roots (MultiRootEditor)', async () => {
				const rootElA = global.document.createElement( 'div' );
				const rootElB = global.document.createElement( 'div' );
				const rootElC = global.document.createElement( 'div' );

				global.document.body.appendChild( rootElA );
				global.document.body.appendChild( rootElB );
				global.document.body.appendChild( rootElC );

				const multiRootEditor = await MultiRootEditor.create( { rootElA, rootElB, rootElC }, {
					plugins: [ AccessibilityHelp ]
				} );

				assertEditorRootLabels( multiRootEditor );

				await multiRootEditor.destroy();

				for ( const editable of Object.values( multiRootEditor.ui.view.editables ) ) {
					editable.element.remove();
				}
			} );

			it( 'should work for dynamic roots', async () => {
				const rootElA = global.document.createElement( 'div' );
				const rootElB = global.document.createElement( 'div' );
				const rootElC = global.document.createElement( 'div' );

				global.document.body.appendChild( rootElA );
				global.document.body.appendChild( rootElB );
				global.document.body.appendChild( rootElC );

				const multiRootEditor = await MultiRootEditor.create( { rootElA, rootElB, rootElC }, {
					plugins: [ AccessibilityHelp, UndoEditing ]
				} );

				multiRootEditor.on( 'addRoot', ( evt, root ) => {
					const domElement = multiRootEditor.createEditable( root );
					global.document.body.appendChild( domElement );
				} );

				multiRootEditor.on( 'detachRoot', ( evt, root ) => {
					const domElement = multiRootEditor.detachEditable( root );
					domElement.remove();
				} );

				multiRootEditor.addRoot( 'dynamicRoot', { isUndoable: true } );

				assertEditorRootLabels( multiRootEditor );

				multiRootEditor.detachRoot( multiRootEditor.model.document.getRoot( 'dynamicRoot' ), true );

				assertEditorRootLabels( multiRootEditor );

				multiRootEditor.execute( 'undo' );

				assertEditorRootLabels( multiRootEditor );

				await multiRootEditor.destroy();

				for ( const editable of Object.values( multiRootEditor.ui.view.editables ) ) {
					editable.element.remove();
				}
			} );

			function assertEditorRootLabels( editor ) {
				for ( const rootName of editor.model.document.getRootNames() ) {
					const viewRoot = editor.editing.view.document.getRoot( rootName );
					const ariaLabel = viewRoot.getAttribute( 'aria-label' );

					expect( ariaLabel ).toBe( `Rich Text Editor. Editing area: ${ rootName }. Press Alt+0 for help.` );
				}
			}
		} );
	} );

	describe( 'showing the dialog for the first time', () => {
		it( 'should create #contentView', () => {
			expect( plugin.contentView ).toBeNull();

			plugin._toggleDialog();

			expect( plugin.contentView ).toBeInstanceOf( AccessibilityHelpContentView );
		} );
	} );
} );
