/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { AccessibilityHelp, ButtonView } from '../../src/index.js';
import { env, global, keyCodes } from '@ckeditor/ckeditor5-utils';
import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { cloneDeep } from 'lodash-es';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import AccessibilityHelpContentView from '../../src/editorui/accessibilityhelpcontentview.js';
import { Plugin } from '@ckeditor/ckeditor5-core';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'AccessibilityHelp', () => {
	let editor, plugin, dialogPlugin, domElement;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		testUtils.sinon.stub( env, 'isMac' ).value( false );
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
		expect( AccessibilityHelp.pluginName ).to.equal( 'AccessibilityHelp' );
	} );

	it( 'should provide default categories, groups, and keystrokes', () => {
		expect( serializeKeystrokes( plugin.keystrokes ) ).to.deep.equal( [
			[
				'contentEditing',
				{
					description: 'These keyboard shortcuts allow for quick access to content editing features.',
					groups: [
						[
							'common',
							{
								id: 'common',
								keystrokes: [],
								label: undefined
							}
						]
					],
					id: 'contentEditing',
					label: 'Content editing keystrokes'
				}
			],
			[
				'navigation',
				{
					description: 'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.',
					groups: [
						[
							'common',
							{
								id: 'common',
								keystrokes: [
									{
										keystroke: 'Esc',
										label: 'Close contextual balloons, dropdowns, and dialogs'
									},
									{
										keystroke: 'Alt+0',
										label: 'Open the accessibility help dialog'
									},
									{
										keystroke: [ [ 'Tab' ], [ 'Shift+Tab' ] ],
										label: 'Move focus between form fields (inputs, buttons, etc.)'
									},
									{
										keystroke: 'Alt+F10',
										label: 'Move focus to the toolbar, navigate between toolbars',
										mayRequireFn: true
									},
									{
										keystroke: [
											[ 'arrowup' ],
											[ 'arrowright' ],
											[ 'arrowdown' ],
											[ 'arrowleft' ]
										],
										label: 'Navigate through the toolbar'
									},
									{
										keystroke: [
											[ 'Enter' ],
											[ 'Space' ]
										],
										label: 'Execute the currently focused button'
									}
								],
								label: undefined
							}
						]
					],
					id: 'navigation',
					label: 'User interface and content navigation keystrokes'
				}
			]
		] );
	} );

	describe( 'constructor()', () => {
		it( 'should have #contentView', () => {
			expect( plugin.contentView ).to.be.null;
		} );

		it( 'should have #keystrokes database', () => {
			expect( plugin.keystrokes ).to.be.a( 'map' );
		} );
	} );

	describe( 'init()', () => {
		it( 'should register the "accessibilityHelp" button in the factory that opens the dialog', () => {
			const buttonView = editor.ui.componentFactory.create( 'accessibilityHelp' );
			const dialogShowSpy = sinon.spy();
			dialogPlugin.on( 'show:accessibilityHelp', dialogShowSpy );

			expect( buttonView ).to.be.instanceOf( ButtonView );
			expect( buttonView.isOn ).to.be.false;
			expect( buttonView.label ).to.equal( 'Accessibility help' );
			expect( buttonView.icon ).to.match( /<svg / );
			expect( buttonView.tooltip ).to.be.true;
			expect( buttonView.keystroke ).to.equal( 'Alt+0' );

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( dialogShowSpy );
		} );

		it( 'should register Alt+0 keystroke that shows the dialog and cancels the event', () => {
			const dialogShowSpy = sinon.spy();
			const keyEventData = {
				keyCode: keyCodes[ '0' ],
				altKey: true,
				preventDefault: sinon.spy(),
				stopPropagation: sinon.spy()
			};

			dialogPlugin.on( 'show:accessibilityHelp', dialogShowSpy );

			const wasHandled = editor.keystrokes.press( keyEventData );

			expect( wasHandled ).to.be.true;
			expect( keyEventData.preventDefault.calledOnce ).to.be.true;

			sinon.assert.calledOnce( dialogShowSpy );
		} );

		describe( 'editor editing view root integration', () => {
			it( 'should inject label into a single root', () => {
				const viewRoot = editor.editing.view.document.getRoot( 'main' );
				const ariaLabel = viewRoot.getAttribute( 'aria-label' );

				expect( ariaLabel ).to.equal( 'Editor editing area: main. Press Alt+0 for help.' );
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

				for ( const rootName of multiRootEditor.model.document.getRootNames() ) {
					const viewRoot = multiRootEditor.editing.view.document.getRoot( rootName );
					const ariaLabel = viewRoot.getAttribute( 'aria-label' );

					expect( ariaLabel ).to.equal( `Rich Text Editor. Editing area: ${ rootName }. Press Alt+0 for help.` );
				}

				rootElA.remove();
				rootElB.remove();
				rootElC.remove();

				await multiRootEditor.destroy();
			} );
		} );
	} );

	describe( 'registerKeystrokeCategory()', () => {
		it( 'should add a new category', () => {
			plugin.registerKeystrokeCategory( {
				id: 'test',
				label: 'Test category',
				description: 'Test category description'
			} );

			const keystrokes = serializeKeystrokes( plugin.keystrokes );

			expect( keystrokes ).to.deep.include( [
				'test',
				{
					id: 'test',
					label: 'Test category',
					description: 'Test category description',
					groups: [
						[
							'common',
							{
								id: 'common',
								label: undefined,
								keystrokes: []
							}
						]
					]
				}
			] );
		} );

		it( 'should register child groups with keystrokes when specified', () => {
			plugin.registerKeystrokeCategory( {
				id: 'testcat',
				label: 'Test category',
				description: 'Test category description',
				groups: [
					{
						id: 'testgroup',
						label: 'Test group',
						keystrokes: [
							{
								label: 'Foo',
								keystroke: 'Alt+C'
							}
						]
					}
				]
			} );

			expect( serializeKeystrokes( plugin.keystrokes ) ).to.deep.include( [
				'testcat',
				{
					id: 'testcat',
					label: 'Test category',
					description: 'Test category description',
					groups: [
						[
							'common',
							{
								id: 'common',
								label: undefined,
								keystrokes: []
							}
						],
						[
							'testgroup',
							{
								id: 'testgroup',
								label: 'Test group',
								keystrokes: [
									{
										keystroke: 'Alt+C',
										label: 'Foo'
									}
								]
							}
						]
					]
				}
			] );
		} );
	} );

	describe( 'registerKeystrokeGroup()', () => {
		it( 'should add a new group in the default category', () => {
			plugin.registerKeystrokeGroup( {
				id: 'testgroup',
				label: 'Test group',
				keystrokes: [
					{
						keystroke: 'Alt+C',
						label: 'Foo'
					}
				]
			} );

			expect( serializeKeystrokes( plugin.keystrokes ) ).to.deep.include( [
				'contentEditing',
				{
					id: 'contentEditing',
					label: 'Content editing keystrokes',
					description: 'These keyboard shortcuts allow for quick access to content editing features.',
					groups: [
						[
							'common',
							{
								id: 'common',
								label: undefined,
								keystrokes: []
							}
						],
						[
							'testgroup',
							{
								id: 'testgroup',
								label: 'Test group',
								keystrokes: [
									{
										keystroke: 'Alt+C',
										label: 'Foo'
									}
								]
							}
						]
					]
				}
			] );
		} );

		it( 'should throw if the category was not found', () => {
			expectToThrowCKEditorError( () => {
				plugin.registerKeystrokeGroup( {
					id: 'testgroup',
					categoryId: 'unknown-category',
					label: 'Test group',
					keystrokes: [
						{
							keystroke: 'Alt+C',
							label: 'Foo'
						}
					]
				} );
			}, /^accessibility-help-unknown-category/, editor, { groupId: 'testgroup', categoryId: 'unknown-category' } );
		} );

		it( 'should add group to a specific category', () => {
			plugin.registerKeystrokeCategory( {
				id: 'testcat',
				label: 'Test category',
				description: 'Test category description'
			} );

			plugin.registerKeystrokeGroup( {
				id: 'testgroup',
				categoryId: 'testcat',
				label: 'Test group',
				keystrokes: [
					{
						keystroke: 'Alt+C',
						label: 'Foo'
					}
				]
			} );

			expect( serializeKeystrokes( plugin.keystrokes ) ).to.deep.include( [
				'testcat',
				{
					id: 'testcat',
					label: 'Test category',
					description: 'Test category description',
					groups: [
						[
							'common',
							{
								id: 'common',
								label: undefined,
								keystrokes: []
							}
						],
						[
							'testgroup',
							{
								id: 'testgroup',
								label: 'Test group',
								keystrokes: [
									{
										keystroke: 'Alt+C',
										label: 'Foo'
									}
								]
							}
						]
					]
				}
			] );
		} );
	} );

	describe( 'registerKeystrokes()', () => {
		it( 'should throw if the category does not exist', () => {
			expectToThrowCKEditorError( () => {
				plugin.registerKeystrokes( {
					categoryId: 'unknown-category',
					keystrokes: [
						{
							keystroke: 'Alt+C',
							label: 'Foo'
						}
					]
				} );
			}, /^accessibility-help-unknown-category/, editor, {
				categoryId: 'unknown-category',
				keystrokes: [
					{
						keystroke: 'Alt+C',
						label: 'Foo'
					}
				]
			} );
		} );

		it( 'should throw if the group does not exist', () => {
			expectToThrowCKEditorError( () => {
				plugin.registerKeystrokes( {
					groupId: 'unknown-group',
					keystrokes: [
						{
							keystroke: 'Alt+C',
							label: 'Foo'
						}
					]
				} );
			}, /^accessibility-help-unknown-group/, editor, {
				categoryId: 'contentEditing',
				groupId: 'unknown-group',
				keystrokes: [
					{
						keystroke: 'Alt+C',
						label: 'Foo'
					}
				]
			} );
		} );

		it( 'should register keystrokes in a specific group in a specific category', () => {
			plugin.registerKeystrokeCategory( {
				id: 'testcat',
				label: 'Test category',
				description: 'Test category description'
			} );

			plugin.registerKeystrokeGroup( {
				id: 'testgroup',
				categoryId: 'testcat',
				label: 'Test group'
			} );

			plugin.registerKeystrokes( {
				categoryId: 'testcat',
				groupId: 'testgroup',
				keystrokes: [
					{
						keystroke: 'Alt+C',
						label: 'Foo'
					}
				]
			} );

			expect( serializeKeystrokes( plugin.keystrokes ) ).to.deep.include( [
				'testcat',
				{
					id: 'testcat',
					label: 'Test category',
					description: 'Test category description',
					groups: [
						[
							'common',
							{
								id: 'common',
								label: undefined,
								keystrokes: []
							}
						],
						[
							'testgroup',
							{
								id: 'testgroup',
								label: 'Test group',
								keystrokes: [
									{
										keystroke: 'Alt+C',
										label: 'Foo'
									}
								]
							}
						]
					]
				}
			] );
		} );

		it( 'should add keystrokes to the default group and category ', () => {
			plugin.registerKeystrokes( {
				keystrokes: [
					{
						keystroke: 'Alt+C',
						label: 'Foo'
					}
				]
			} );

			expect( serializeKeystrokes( plugin.keystrokes ) ).to.deep.include( [
				'contentEditing',
				{
					description: 'These keyboard shortcuts allow for quick access to content editing features.',
					groups: [
						[
							'common',
							{
								id: 'common',
								keystrokes: [
									{
										keystroke: 'Alt+C',
										label: 'Foo'
									}
								],
								label: undefined
							}
						]
					],
					id: 'contentEditing',
					label: 'Content editing keystrokes'
				}
			] );
		} );
	} );

	describe( 'showing the dialog for the first time', () => {
		it( 'should create #contentView', () => {
			expect( plugin.contentView ).to.be.null;

			plugin._showDialog();

			expect( plugin.contentView ).to.be.instanceof( AccessibilityHelpContentView );
		} );

		describe( 'populating #keystrokes using plugins metadata', () => {
			class PluginThatRegistersKeystrokesInDefaultGroupAndCat extends Plugin {
				get accessibilityHelpMetadata() {
					return {
						keystrokes: [
							{
								keystroke: 'Alt+A',
								label: 'PluginA keystroke'
							}
						]
					};
				}
			}

			class PluginThatRegistersKeystrokesIntoNonExistingGroupAndCat extends Plugin {
				get accessibilityHelpMetadata() {
					return {
						keystrokes: [
							{
								categoryId: 'testcat',
								groupId: 'testgroup',
								keystrokes: [
									{
										keystroke: 'Alt+B',
										label: 'PluginB keystroke'
									}
								]
							}
						]
					};
				}
			}

			class PluginThatRegistersGroupWhenThereIsNoCategoryYet extends Plugin {
				get accessibilityHelpMetadata() {
					return {
						keystrokeGroups: [
							{
								id: 'testgroup',
								categoryId: 'testcat',
								label: 'Test group'
							}
						]
					};
				}
			}

			class PluginThatBringsTheCategoryOtherPluginsWantToRegisterInto extends Plugin {
				get accessibilityHelpMetadata() {
					return {
						keystrokeCategories: [
							{
								id: 'testcat',
								label: 'Test cat'
							}
						]
					};
				}
			}

			it( 'should populate #keystrokes using metadata from plugins', async () => {
				const editorWithPlugins = await ClassicTestEditor.create( domElement, {
					plugins: [
						PluginThatRegistersKeystrokesInDefaultGroupAndCat,
						PluginThatRegistersKeystrokesIntoNonExistingGroupAndCat,
						PluginThatBringsTheCategoryOtherPluginsWantToRegisterInto,
						PluginThatRegistersGroupWhenThereIsNoCategoryYet,

						AccessibilityHelp
					]
				} );

				const plugin = editorWithPlugins.plugins.get( AccessibilityHelp );

				plugin._showDialog();

				expect( serializeKeystrokes( plugin.keystrokes ) ).to.deep.equal( [
					[
						'contentEditing',
						{
							description: 'These keyboard shortcuts allow for quick access to content editing features.',
							groups: [
								[
									'common',
									{
										id: 'common',
										keystrokes: [
											{
												keystroke: 'Alt+A',
												label: 'PluginA keystroke'
											}
										],
										label: undefined
									}
								]
							],
							id: 'contentEditing',
							label: 'Content editing keystrokes'
						}
					],
					[
						'navigation',
						{
							description: 'Use the following keystrokes for more efficient navigation in the CKEditor 5 user interface.',
							groups: [
								[
									'common',
									{
										id: 'common',
										keystrokes: [
											{
												keystroke: 'Esc',
												label: 'Close contextual balloons, dropdowns, and dialogs'
											},
											{
												keystroke: 'Alt+0',
												label: 'Open the accessibility help dialog'
											},
											{
												keystroke: [ [ 'Tab' ], [ 'Shift+Tab' ] ],
												label: 'Move focus between form fields (inputs, buttons, etc.)'
											},
											{
												keystroke: 'Alt+F10',
												label: 'Move focus to the toolbar, navigate between toolbars',
												mayRequireFn: true
											},
											{
												keystroke: [
													[ 'arrowup' ],
													[ 'arrowright' ],
													[ 'arrowdown' ],
													[ 'arrowleft' ]
												],
												label: 'Navigate through the toolbar'
											},
											{
												keystroke: [
													[ 'Enter' ],
													[ 'Space' ]
												],
												label: 'Execute the currently focused button'
											},
											{
												'keystroke': 'Ctrl+F6',
												'label': 'Move focus in and out of an active dialog window',
												'mayRequireFn': true
											}
										],
										label: undefined
									}
								]
							],
							id: 'navigation',
							label: 'User interface and content navigation keystrokes'
						}
					],
					[
						'testcat',
						{
							groups: [
								[
									'common',
									{
										id: 'common',
										keystrokes: [],
										label: undefined
									}
								],
								[
									'testgroup',
									{
										id: 'testgroup',
										keystrokes: [
											{
												keystroke: 'Alt+B',
												label: 'PluginB keystroke'
											}
										],
										label: 'Test group'
									}
								]
							],
							id: 'testcat',
							label: 'Test cat',
							description: undefined
						}
					]
				] );

				await editorWithPlugins.destroy();
			} );
		} );
	} );

	function serializeKeystrokes( keystrokes ) {
		const serialized = Array.from( cloneDeep( keystrokes ).entries() );

		for ( const [ , categoryDef ] of serialized ) {
			categoryDef.groups = Array.from( categoryDef.groups.entries() );
		}

		return serialized;
	}
} );
