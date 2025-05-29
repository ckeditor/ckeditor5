/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Editor } from '@ckeditor/ckeditor5-core';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { cloneDeep } from 'es-toolkit/compat';

describe( 'Accessibility', () => {
	let editor, accessibility;

	beforeEach( () => {
		editor = new Editor();
		accessibility = editor.accessibility;
	} );

	afterEach( async () => {
		if ( editor.state === 'initializing' ) {
			editor.fire( 'ready' );
		}

		await editor.destroy();
	} );

	it( 'should provide default categories, groups, and keystrokes', () => {
		expect( serializeKeystrokes( accessibility.keystrokeInfos ) ).to.deep.equal( [
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
										label: 'Navigate through the toolbar or menu bar'
									},
									{
										keystroke: [
											[ 'Enter' ],
											[ 'Space' ]
										],
										// eslint-disable-next-line @stylistic/max-len
										label: 'Execute the currently focused button. Executing buttons that interact with the editor content moves the focus back to the content.'
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

	it( 'should add info specific to the menu bar when available', async () => {
		const editor = new Editor( {
			menuBar: {
				isVisible: true
			}
		} );

		const accessibility = editor.accessibility;
		const keystrokes = serializeKeystrokes( accessibility.keystrokeInfos );

		expect( keystrokes[ 1 ][ 1 ].groups[ 0 ][ 1 ].keystrokes ).to.deep.include( {
			label: 'Move focus to the menu bar, navigate between menu bars',
			keystroke: 'Alt+F9',
			mayRequireFn: true
		} );

		editor.fire( 'ready' );
		await editor.destroy();
	} );

	describe( 'addKeystrokeInfoCategory()', () => {
		it( 'should add a new category', () => {
			accessibility.addKeystrokeInfoCategory( {
				id: 'test',
				label: 'Test category',
				description: 'Test category description'
			} );

			const keystrokes = serializeKeystrokes( accessibility.keystrokeInfos );

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

		it( 'should add child groups with keystrokes when specified', () => {
			accessibility.addKeystrokeInfoCategory( {
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

			expect( serializeKeystrokes( accessibility.keystrokeInfos ) ).to.deep.include( [
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

	describe( 'addKeystrokeInfoGroup()', () => {
		it( 'should add a new group in the default category', () => {
			accessibility.addKeystrokeInfoGroup( {
				id: 'testgroup',
				label: 'Test group',
				keystrokes: [
					{
						keystroke: 'Alt+C',
						label: 'Foo'
					}
				]
			} );

			expect( serializeKeystrokes( accessibility.keystrokeInfos ) ).to.deep.include( [
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
				accessibility.addKeystrokeInfoGroup( {
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
			}, /^accessibility-unknown-keystroke-info-category/, editor, { groupId: 'testgroup', categoryId: 'unknown-category' } );
		} );

		it( 'should add group to a specific category', () => {
			accessibility.addKeystrokeInfoCategory( {
				id: 'testcat',
				label: 'Test category',
				description: 'Test category description'
			} );

			accessibility.addKeystrokeInfoGroup( {
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

			expect( serializeKeystrokes( accessibility.keystrokeInfos ) ).to.deep.include( [
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

	describe( 'addKeystrokeInfos()', () => {
		it( 'should throw if the category does not exist', () => {
			expectToThrowCKEditorError( () => {
				accessibility.addKeystrokeInfos( {
					categoryId: 'unknown-category',
					keystrokes: [
						{
							keystroke: 'Alt+C',
							label: 'Foo'
						}
					]
				} );
			}, /^accessibility-unknown-keystroke-info-category/, editor, {
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
				accessibility.addKeystrokeInfos( {
					groupId: 'unknown-group',
					keystrokes: [
						{
							keystroke: 'Alt+C',
							label: 'Foo'
						}
					]
				} );
			}, /^accessibility-unknown-keystroke-info-group/, editor, {
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

		it( 'should add keystrokes to a specific group in a specific category', () => {
			accessibility.addKeystrokeInfoCategory( {
				id: 'testcat',
				label: 'Test category',
				description: 'Test category description'
			} );

			accessibility.addKeystrokeInfoGroup( {
				id: 'testgroup',
				categoryId: 'testcat',
				label: 'Test group'
			} );

			accessibility.addKeystrokeInfos( {
				categoryId: 'testcat',
				groupId: 'testgroup',
				keystrokes: [
					{
						keystroke: 'Alt+C',
						label: 'Foo'
					}
				]
			} );

			expect( serializeKeystrokes( accessibility.keystrokeInfos ) ).to.deep.include( [
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
			accessibility.addKeystrokeInfos( {
				keystrokes: [
					{
						keystroke: 'Alt+C',
						label: 'Foo'
					}
				]
			} );

			expect( serializeKeystrokes( accessibility.keystrokeInfos ) ).to.deep.include( [
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

	function serializeKeystrokes( keystrokes ) {
		const serialized = Array.from( cloneDeep( keystrokes ).entries() );

		for ( const [ , categoryDef ] of serialized ) {
			categoryDef.groups = Array.from( categoryDef.groups.entries() );
		}

		return serialized;
	}
} );
