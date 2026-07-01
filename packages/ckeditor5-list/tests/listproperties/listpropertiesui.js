/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// TODO change to new plugin
import {
	IconBulletedList,
	IconNumberedList,
	IconListStyleCircle,
	IconListStyleDecimal,
	IconListStyleDecimalLeadingZero,
	IconListStyleDisc,
	IconListStyleLowerLatin,
	IconListStyleLowerRoman,
	IconListStyleSquare,
	IconListStyleUpperLatin,
	IconListStyleUpperRoman
} from '@ckeditor/ckeditor5-icons';
import { LegacyListProperties } from '../../src/legacylistproperties.js';
import { ListPropertiesUI } from '../../src/listproperties/listpropertiesui.js';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import { DropdownView, View, ButtonView, LabeledFieldView, SwitchButtonView, MenuBarMenuView } from '@ckeditor/ckeditor5-ui';

import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

describe( 'ListPropertiesUI', () => {
	let editorElement, editor, model, listStyleCommand, listPropertiesView;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, BlockQuote, LegacyListProperties, UndoEditing ],
			list: {
				properties: {
					styles: true,
					startIndex: true,
					reversed: true
				}
			}
		} ).then( newEditor => {
			editor = newEditor;
			model = editor.model;

			listStyleCommand = editor.commands.get( 'listStyle' );
		} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ListPropertiesUI.pluginName ).toBe( 'ListPropertiesUI' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ListPropertiesUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ListPropertiesUI.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListPropertiesUI ) ).toBeInstanceOf( ListPropertiesUI );
	} );

	describe( 'init()', () => {
		describe( 'toolbar components', () => {
			describe( 'component registration', () => {
				it( 'should register a dropdown as "bulletedList" in the component factory when `styles` property is enabled', () => {
					return withEditor( { styles: true }, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'bulletedList' ) ).toBe( true );

						const bulletedListDropdown = componentFactory.create( 'bulletedList' );

						expect( bulletedListDropdown ).toBeInstanceOf( DropdownView );
					} );
				} );

				it( 'should not register a dropdown as "bulletedList" in the component factory when `styles` ' +
					'property is not enabled', () => {
					return withEditor( {
						styles: false,
						startIndex: true,
						reversed: true
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'bulletedList' ) ).toBe( false );
					} );
				} );

				it( 'should not register a dropdown as "bulletedList" in the component factory when only `numbered` list ' +
					'is enabled', () => {
					return withEditor( {
						styles: {
							listTypes: [ 'numbered' ]
						},
						startIndex: false,
						reversed: true
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'bulletedList' ) ).toBe( false );
					} );
				} );

				it( 'should not register a dropdown as "bulletedList" in the component factory when only `numbered` list ' +
					'is enabled', () => {
					return withEditor( {
						styles: 'numbered',
						startIndex: false,
						reversed: true
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'bulletedList' ) ).toBe( false );
					} );
				} );

				it( 'should not register a dropdown as "bulletedList" in the component factory when only `numbered` list ' +
					'is enabled', () => {
					return withEditor( {
						styles: [ 'numbered' ],
						startIndex: false,
						reversed: true
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'bulletedList' ) ).toBe( false );
					} );
				} );

				it( 'should register a dropdown as "numberedList" in the component factory when `numbered` list ' +
					'is disabled but startIndex is enabled', () => {
					return withEditor( {
						styles: {
							listTypes: [ 'bulleted' ]
						},
						startIndex: true,
						reversed: false
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'numberedList' ) ).toBe( true );
					} );
				} );

				it( 'should register a dropdown as "numberedList" in the component factory when `numbered` list ' +
					'is disabled but reversed is enabled', () => {
					return withEditor( {
						styles: {
							listTypes: [ 'bulleted' ]
						},
						startIndex: false,
						reversed: true
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'numberedList' ) ).toBe( true );
					} );
				} );

				it( 'should register a dropdown as "numberedList" in the component factory when `numbered` list ' +
					'is disabled but other features is enabled', () => {
					return withEditor( {
						styles: {
							listTypes: [ 'bulleted' ]
						},
						startIndex: true,
						reversed: true
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'numberedList' ) ).toBe( true );
					} );
				} );

				it( 'should not register a dropdown as "numberedList" in the component factory when only `bulleted` list ' +
					'is enabled and other features are not enabled as well', () => {
					return withEditor( {
						styles: {
							listTypes: [ 'bulleted' ]
						},
						startIndex: false,
						reversed: false
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'numberedList' ) ).toBe( false );
					} );
				} );

				it( 'should not register a dropdown as "numberedList" and "bulletedList" in the component ' +
					'factory when `numbered` and `bulleted` list are disabled (other features are not enabled as well)', () => {
					return withEditor( {
						styles: {
							listTypes: []
						},
						startIndex: false,
						reversed: false
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'numberedList' ) ).toBe( false );
						expect( componentFactory.has( 'bulletedList' ) ).toBe( false );
					} );
				} );

				for ( const property of [ 'styles', 'startIndex', 'reversed' ] ) {
					const listPropertiesConfig = {
						styles: false,
						startIndex: false,
						reversed: false
					};
					listPropertiesConfig[ property ] = true;

					it(
						`should register a dropdown as "numberedList" in the component factory when \`${ property }\` property is enabled`,
						() => {
							return withEditor( listPropertiesConfig, editor => {
								const componentFactory = editor.ui.componentFactory;

								expect( componentFactory.has( 'numberedList' ) ).toBe( true );

								const numberedListDropdown = componentFactory.create( 'numberedList' );

								expect( numberedListDropdown ).toBeInstanceOf( DropdownView );
							} );
						}
					);
				}

				it( 'should not register a dropdown as "numberedList" in the component factory when no property is enabled', () => {
					return withEditor( {
						styles: false,
						startIndex: false,
						reversed: false
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'numberedList' ) ).toBe( false );
					} );
				} );

				describe( 'listStyleTypes config entry', () => {
					it( 'should register buttons filtered by listStyleTypes for bulleted list', () => {
						return withEditor( {
							styles: {
								listStyleTypes: {
									bulleted: [ 'disc', 'circle' ]
								}
							}
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const bulletedListDropdown = componentFactory.create( 'bulletedList' );

							bulletedListDropdown.render();
							document.body.appendChild( bulletedListDropdown.element );

							// Trigger lazy init
							bulletedListDropdown.isOpen = true;
							bulletedListDropdown.isOpen = false;

							const listPropertiesView = bulletedListDropdown.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.tooltip ) ).toEqual( [ 'Disc', 'Circle' ] );

							bulletedListDropdown.element.remove();
						} );
					} );

					it( 'should register buttons filtered by listStyleTypes for numbered list', () => {
						return withEditor( {
							styles: {
								listStyleTypes: {
									numbered: [ 'decimal', 'lower-roman' ]
								}
							}
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const numberedListDropdown = componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.tooltip ) ).toEqual( [ 'Decimal', 'Lower–roman' ] );

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should register all buttons when listStyleTypes is undefined', () => {
						return withEditor( {
							styles: true
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const numberedListDropdown = componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.tooltip ) ).toEqual( [
								'Decimal',
								'Decimal with leading zero',
								'Lower–roman',
								'Upper-roman',
								'Lower-latin',
								'Upper-latin'
							] );

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should register all buttons when listStyleTypes does not define current list type', () => {
						return withEditor( {
							styles: {
								listStyleTypes: {
									bulleted: [ 'disc' ]
								}
							}
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const numberedListDropdown = componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.tooltip ) ).toEqual( [
								'Decimal',
								'Decimal with leading zero',
								'Lower–roman',
								'Upper-roman',
								'Lower-latin',
								'Upper-latin',
								'Arabic-indic'
							] );

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should register no buttons when listStyleTypes has empty array', () => {
						return withEditor( {
							styles: {
								listStyleTypes: {
									numbered: [],
									bulleted: []
								}
							}
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const numberedListDropdown = componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;

							expect( listPropertiesView.stylesView ).toBeNull();

							numberedListDropdown.element.remove();
						} );
					} );
				} );
			} );

			describe( 'bulleted list dropdown', () => {
				let bulletedListCommand, bulletedListDropdown;

				beforeEach( () => {
					bulletedListCommand = editor.commands.get( 'bulletedList' );
					bulletedListDropdown = editor.ui.componentFactory.create( 'bulletedList' );

					bulletedListDropdown.render();
					document.body.appendChild( bulletedListDropdown.element );

					// Trigger lazy init.
					bulletedListDropdown.isOpen = true;
					bulletedListDropdown.isOpen = false;

					listPropertiesView = bulletedListDropdown.panelView.children.first;
				} );

				afterEach( () => {
					bulletedListDropdown.element.remove();
				} );

				it( 'should registered as "bulletedList" in the component factory', () => {
					expect( bulletedListDropdown ).toBeInstanceOf( DropdownView );
				} );

				it( 'should have #isEnabled bound to the "bulletedList" command state', () => {
					expect( bulletedListDropdown.isEnabled ).toBe( true );

					bulletedListCommand.isEnabled = true;
					expect( bulletedListDropdown.isEnabled ).toBe( true );

					bulletedListCommand.isEnabled = false;
					expect( bulletedListDropdown.isEnabled ).toBe( false );
				} );

				it( 'should have a specific CSS class', () => {
					expect( bulletedListDropdown.class ).toBe( 'ck-list-styles-dropdown' );
				} );

				it( 'should not have numbered list properties', () => {
					expect( listPropertiesView.stylesView ).toBeInstanceOf( View );
					expect( listPropertiesView.startIndexFieldView ).toBeNull();
					expect( listPropertiesView.reversedSwitchButtonView ).toBeNull();
				} );

				describe( 'main split button', () => {
					let mainButtonView;

					beforeEach( () => {
						mainButtonView = bulletedListDropdown.buttonView;
					} );

					it( 'should have a #label', () => {
						expect( mainButtonView.label ).toBe( 'Bulleted List' );
					} );

					it( 'should have an #icon', () => {
						expect( mainButtonView.icon ).toBe( IconBulletedList );
					} );

					it( 'should have a #tooltip based on a label', () => {
						expect( mainButtonView.tooltip ).toBe( true );
					} );

					it( 'should be toggleable', () => {
						expect( mainButtonView.isToggleable ).toBe( true );
					} );

					it( 'should have the #isOn state bound to the value of the "bulletedList" command', () => {
						expect( mainButtonView.isOn ).toBe( false );

						bulletedListCommand.value = 'foo';
						expect( mainButtonView.isOn ).toBe( true );

						bulletedListCommand.value = null;
						expect( mainButtonView.isOn ).toBe( false );
					} );

					it( 'should execute the "bulletedList" command and focus the editing view when clicked', () => {
						vi.spyOn( editor, 'execute' );
						vi.spyOn( editor.editing.view, 'focus' );

						mainButtonView.fire( 'execute' );
						expect( editor.execute ).toHaveBeenCalledWith( 'bulletedList' );
						expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
						expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
							editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
						);
					} );
				} );

				describe( 'grid with style buttons', () => {
					let stylesView;

					beforeEach( () => {
						stylesView = listPropertiesView.stylesView;
					} );

					it( 'should have a proper ARIA label', () => {
						expect( stylesView.element.getAttribute( 'aria-label' ) ).toBe( 'Bulleted list styles toolbar' );
					} );

					it( 'should bring the "disc" list style button', () => {
						const buttonView = stylesView.children.first;

						expect( buttonView.label ).toBe( 'Toggle the disc list style' );
						expect( buttonView.tooltip ).toBe( 'Disc' );
						expect( buttonView.icon ).toBe( IconListStyleDisc );
					} );

					it( 'should bring the "circle" list style button', () => {
						const buttonView = stylesView.children.get( 1 );

						expect( buttonView.label ).toBe( 'Toggle the circle list style' );
						expect( buttonView.tooltip ).toBe( 'Circle' );
						expect( buttonView.icon ).toBe( IconListStyleCircle );
					} );

					it( 'should bring the "square" list style button', () => {
						const buttonView = stylesView.children.get( 2 );

						expect( buttonView.label ).toBe( 'Toggle the square list style' );
						expect( buttonView.tooltip ).toBe( 'Square' );
						expect( buttonView.icon ).toBe( IconListStyleSquare );
					} );

					it( 'should only bring the style buttons supported by the command', () => {
						return withEditor( { styles: true }, editor => {
							const listStyleCommand = editor.commands.get( 'listStyle' );

							listStyleCommand.isStyleTypeSupported = style => style == 'square';

							const componentFactory = editor.ui.componentFactory;
							const bulletedListDropdown = componentFactory.create( 'bulletedList' );

							bulletedListDropdown.isOpen = true;

							const listPropertiesView = bulletedListDropdown.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.label ) ).toEqual( [
								'Toggle the square list style'
							] );
						} );
					} );

					it( 'should close the drop-down when any button gets executed', () => {
						const spy = vi.fn();

						bulletedListDropdown.on( 'execute', spy );
						listPropertiesView.fire( 'execute' );

						expect( spy ).toHaveBeenCalledOnce();
					} );

					it( 'on dropdown open should focus the first active button', () => {
						const button = stylesView.children.get( 1 );
						const spy = vi.spyOn( button, 'focus' );

						button.isOn = true;
						bulletedListDropdown.isOpen = true;
						expect( spy ).toHaveBeenCalledOnce();
					} );

					describe( 'style button', () => {
						let styleButtonView;

						beforeEach( () => {
							// "circle"
							styleButtonView = stylesView.children.get( 1 );

							vi.spyOn( editor, 'execute' );
							vi.spyOn( editor.editing.view, 'focus' );
						} );

						it( 'should be instances of ButtonView', () => {
							expect( styleButtonView ).toBeInstanceOf( ButtonView );
						} );

						it( 'should change its #isOn state when the value of the "listStyleCommand" command changes', () => {
							expect( styleButtonView.isOn ).toBe( false );

							listStyleCommand.value = 'foo';
							expect( styleButtonView.isOn ).toBe( false );

							listStyleCommand.value = 'circle';
							expect( styleButtonView.isOn ).toBe( true );

							listStyleCommand.value = null;
							expect( styleButtonView.isOn ).toBe( false );
						} );

						it( 'should apply the new style if none was set', () => {
							_setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'circle' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should apply the new style if a different one was set', () => {
							_setModelData( model, '<listItem listType="bulleted" listStyle="square" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'circle' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should remove (toggle) the style if the same style was set', () => {
							_setModelData( model, '<listItem listType="bulleted" listStyle="circle" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'bulletedList' );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should execute the "bulletedList" command and apply the style if selection was not anchored in a list', () => {
							_setModelData( model, '<paragraph>foo[]</paragraph>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'bulletedList' );
							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'circle' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should create the single undo step while selection was not anchored in a list', () => {
							_setModelData( model, '<paragraph>foo[]</paragraph>' );

							styleButtonView.fire( 'execute' );

							expect( _getModelData( model ) ).toBe(
								'<listItem listIndent="0" listStyle="circle" listType="bulleted">foo[]</listItem>'
							);

							editor.execute( 'undo' );

							expect( _getModelData( model ) ).toBe(
								'<paragraph>foo[]</paragraph>'
							);
						} );
					} );
				} );
			} );

			describe( 'numbered list dropdown', () => {
				let numberedListCommand, numberedListDropdown;

				beforeEach( () => {
					numberedListCommand = editor.commands.get( 'numberedList' );
					numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

					numberedListDropdown.render();
					document.body.appendChild( numberedListDropdown.element );

					// Trigger lazy init.
					numberedListDropdown.isOpen = true;
					numberedListDropdown.isOpen = false;

					listPropertiesView = numberedListDropdown.panelView.children.first;
				} );

				afterEach( () => {
					numberedListDropdown.element.remove();
				} );

				it( 'should have #isEnabled bound to the "numberedList" command state', () => {
					expect( numberedListDropdown.isEnabled ).toBe( true );

					numberedListCommand.isEnabled = true;
					expect( numberedListDropdown.isEnabled ).toBe( true );

					numberedListCommand.isEnabled = false;
					expect( numberedListDropdown.isEnabled ).toBe( false );
				} );

				it( 'should have a specific CSS class', () => {
					expect( numberedListDropdown.class ).toBe( 'ck-list-styles-dropdown' );
				} );

				describe( 'support of config.list.properties', () => {
					it( 'should have styles grid, start index, and reversed fields when all properties are enabled in the config', () => {
						return withEditor( {
							styles: true,
							startIndex: true,
							reversed: true
						}, editor => {
							const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;

							expect( listPropertiesView.stylesView ).toBeInstanceOf( View );
							expect( listPropertiesView.startIndexFieldView ).toBeInstanceOf( LabeledFieldView );
							expect( listPropertiesView.reversedSwitchButtonView ).toBeInstanceOf( SwitchButtonView );

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should not have styles grid when `numbered` is disabled in the config (other features are enabled)', () => {
						return withEditor( {
							styles: {
								listTypes: []
							},
							startIndex: true,
							reversed: true
						}, editor => {
							const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;

							expect( listPropertiesView.stylesView ).toBeNull();
							expect( listPropertiesView.startIndexFieldView ).toBeInstanceOf( LabeledFieldView );
							expect( listPropertiesView.reversedSwitchButtonView ).toBeInstanceOf( SwitchButtonView );

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should have only the styles grid when start index and reversed properties are disabled', () => {
						return withEditor( {
							styles: true,
							startIndex: false,
							reversed: false
						}, editor => {
							const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;

							expect( listPropertiesView.stylesView ).toBeInstanceOf( View );
							expect( listPropertiesView.startIndexFieldView ).toBeNull();
							expect( listPropertiesView.reversedSwitchButtonView ).toBeNull();

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should have only the numbered list property UI when styles are disabled', async () => {
						return withEditor( {
							styles: false,
							startIndex: true,
							reversed: true
						}, editor => {
							const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;

							expect( listPropertiesView.stylesView ).toBeNull();
							expect( listPropertiesView.startIndexFieldView ).toBeInstanceOf( LabeledFieldView );
							expect( listPropertiesView.reversedSwitchButtonView ).toBeInstanceOf( SwitchButtonView );

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should focus the start index field on open when styles are disabled', () => {
						return withEditor( {
							styles: false,
							startIndex: true,
							reversed: true
						}, editor => {
							const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;
							const startIndexFieldView = listPropertiesView.startIndexFieldView;

							// Force clear is necessary on CI.
							listPropertiesView.focusTracker.focusedElement = null;

							const spy = vi.spyOn( startIndexFieldView, 'focus' );

							numberedListDropdown.isOpen = true;

							expect( spy ).toHaveBeenCalledOnce();

							numberedListDropdown.element.remove();
							numberedListDropdown.destroy();
						} );
					} );
				} );

				describe( 'main split button', () => {
					let mainButtonView;

					beforeEach( () => {
						mainButtonView = numberedListDropdown.buttonView;
					} );

					it( 'should have a #label', () => {
						expect( mainButtonView.label ).toBe( 'Numbered List' );
					} );

					it( 'should have an #icon', () => {
						expect( mainButtonView.icon ).toBe( IconNumberedList );
					} );

					it( 'should have a #tooltip based on a label', () => {
						expect( mainButtonView.tooltip ).toBe( true );
					} );

					it( 'should be toggleable', () => {
						expect( mainButtonView.isToggleable ).toBe( true );
					} );

					it( 'should have the #isOn state bound to the value of the "numberedList" command', () => {
						expect( mainButtonView.isOn ).toBe( false );

						numberedListCommand.value = 'foo';
						expect( mainButtonView.isOn ).toBe( true );

						numberedListCommand.value = null;
						expect( mainButtonView.isOn ).toBe( false );
					} );

					it( 'should execute the "numberedList" command and focus the editing view when clicked', () => {
						vi.spyOn( editor, 'execute' );
						vi.spyOn( editor.editing.view, 'focus' );

						mainButtonView.fire( 'execute' );
						expect( editor.execute ).toHaveBeenCalledWith( 'numberedList' );
						expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
						expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
							editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
						);
					} );
				} );

				describe( 'grid with style buttons', () => {
					let stylesView;

					beforeEach( () => {
						stylesView = listPropertiesView.stylesView;
					} );

					it( 'should have a proper ARIA label', () => {
						expect( stylesView.element.getAttribute( 'aria-label' ) ).toBe( 'Numbered list styles toolbar' );
					} );

					it( 'should bring the "decimal" list style button', () => {
						const buttonView = stylesView.children.first;

						expect( buttonView.label ).toBe( 'Toggle the decimal list style' );
						expect( buttonView.tooltip ).toBe( 'Decimal' );
						expect( buttonView.icon ).toBe( IconListStyleDecimal );
					} );

					it( 'should bring the "decimal-leading-zero" list style button', () => {
						const buttonView = stylesView.children.get( 1 );

						expect( buttonView.label ).toBe( 'Toggle the decimal with leading zero list style' );
						expect( buttonView.tooltip ).toBe( 'Decimal with leading zero' );
						expect( buttonView.icon ).toBe( IconListStyleDecimalLeadingZero );
					} );

					it( 'should bring the "lower-roman" list style button', () => {
						const buttonView = stylesView.children.get( 2 );

						expect( buttonView.label ).toBe( 'Toggle the lower–roman list style' );
						expect( buttonView.tooltip ).toBe( 'Lower–roman' );
						expect( buttonView.icon ).toBe( IconListStyleLowerRoman );
					} );

					it( 'should bring the "upper-roman" list style button', () => {
						const buttonView = stylesView.children.get( 3 );

						expect( buttonView.label ).toBe( 'Toggle the upper–roman list style' );
						expect( buttonView.tooltip ).toBe( 'Upper-roman' );
						expect( buttonView.icon ).toBe( IconListStyleUpperRoman );
					} );

					it( 'should bring the "lower–latin" list style button', () => {
						const buttonView = stylesView.children.get( 4 );

						expect( buttonView.label ).toBe( 'Toggle the lower–latin list style' );
						expect( buttonView.tooltip ).toBe( 'Lower-latin' );
						expect( buttonView.icon ).toBe( IconListStyleLowerLatin );
					} );

					it( 'should bring the "upper–latin" list style button', () => {
						const buttonView = stylesView.children.get( 5 );

						expect( buttonView.label ).toBe( 'Toggle the upper–latin list style' );
						expect( buttonView.tooltip ).toBe( 'Upper-latin' );
						expect( buttonView.icon ).toBe( IconListStyleUpperLatin );
					} );

					it( 'should only bring the style buttons supported by the command', () => {
						return withEditor( { styles: true }, editor => {
							const listStyleCommand = editor.commands.get( 'listStyle' );

							listStyleCommand.isStyleTypeSupported = style => style != 'lower-latin' && style != 'decimal';

							const componentFactory = editor.ui.componentFactory;
							const numberedListDropdown = componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.label ) ).toEqual( [
								'Toggle the decimal with leading zero list style',
								'Toggle the lower–roman list style',
								'Toggle the upper–roman list style',
								'Toggle the upper–latin list style'
							] );

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should close the drop-down when any button gets executed', () => {
						const spy = vi.fn();

						numberedListDropdown.on( 'execute', spy );
						listPropertiesView.fire( 'execute' );

						expect( spy ).toHaveBeenCalledOnce();
					} );

					it( 'on dropdown open should focus the first active button', () => {
						const button = stylesView.children.get( 1 );
						const spy = vi.spyOn( button, 'focus' );

						button.isOn = true;
						numberedListDropdown.isOpen = true;
						expect( spy ).toHaveBeenCalledOnce();
					} );

					describe( 'style button', () => {
						let styleButtonView;

						beforeEach( () => {
							// "decimal-leading-zero""
							styleButtonView = stylesView.children.get( 1 );

							vi.spyOn( editor, 'execute' );
							vi.spyOn( editor.editing.view, 'focus' );
						} );

						it( 'should be instances of ButtonView', () => {
							expect( styleButtonView ).toBeInstanceOf( ButtonView );
						} );

						it( 'should change its #isOn state when the value of the "listStyleCommand" command changes', () => {
							expect( styleButtonView.isOn ).toBe( false );

							listStyleCommand.value = 'foo';
							expect( styleButtonView.isOn ).toBe( false );

							listStyleCommand.value = 'decimal-leading-zero';
							expect( styleButtonView.isOn ).toBe( true );

							listStyleCommand.value = null;
							expect( styleButtonView.isOn ).toBe( false );
						} );

						it( 'should apply the new style if none was set', () => {
							_setModelData( model, '<listItem listType="numbered" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'decimal-leading-zero' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should apply the new style if a different one was set', () => {
							_setModelData( model, '<listItem listType="numbered" listStyle="square" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'decimal-leading-zero' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should remove (toggle) the style if the same style was set', () => {
							_setModelData(
								model,
								'<listItem listType="numbered" listStyle="decimal-leading-zero" listIndent="0">[]foo</listItem>'
							);

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'numberedList' );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should execute the "numberedList" command and apply the style if selection was not anchored in a list', () => {
							_setModelData( model, '<paragraph>foo[]</paragraph>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'numberedList' );
							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'decimal-leading-zero' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should create the single undo step while selection was not anchored in a list', () => {
							_setModelData( model, '<paragraph>foo[]</paragraph>' );

							styleButtonView.fire( 'execute' );

							expect( _getModelData( model ) ).toBe(
								'<listItem ' +
									'listIndent="0" ' +
									'listReversed="false" ' +
									'listStart="1" ' +
									'listStyle="decimal-leading-zero" ' +
									'listType="numbered">' +
									'foo[]' +
								'</listItem>'
							);

							editor.execute( 'undo' );

							expect( _getModelData( model ) ).toBe(
								'<paragraph>foo[]</paragraph>'
							);
						} );
					} );
				} );

				describe( 'list start input', () => {
					let listStartCommand, startIndexFieldView;

					beforeEach( () => {
						listStartCommand = editor.commands.get( 'listStart' );
						startIndexFieldView = listPropertiesView.startIndexFieldView;
					} );

					it( 'should bind #isEnabled to the list start command', () => {
						listStartCommand.isEnabled = true;
						expect( startIndexFieldView.isEnabled ).toBe( true );

						listStartCommand.isEnabled = false;
						expect( startIndexFieldView.isEnabled ).toBe( false );
					} );

					it( 'should bind #value to the list start command', () => {
						listStartCommand.value = 123;
						expect( startIndexFieldView.fieldView.value ).toBe( 123 );

						listStartCommand.value = 321;
						expect( startIndexFieldView.fieldView.value ).toBe( 321 );
					} );

					it( 'should execute the list start command when the list property view fires #listStart', () => {
						const spy = vi.spyOn( editor, 'execute' );

						listPropertiesView.fire( 'listStart', { startIndex: 1234 } );

						expect( spy ).toHaveBeenCalledOnce();
						expect( spy ).toHaveBeenCalledWith( 'listStart', { startIndex: 1234 } );
					} );
				} );

				describe( 'list reversed switch button', () => {
					let listReversedCommand, reversedSwitchButtonView;

					beforeEach( () => {
						listReversedCommand = editor.commands.get( 'listReversed' );
						reversedSwitchButtonView = listPropertiesView.reversedSwitchButtonView;
					} );

					it( 'should bind #isEnabled to the list reversed command', () => {
						listReversedCommand.isEnabled = true;
						expect( reversedSwitchButtonView.isEnabled ).toBe( true );

						listReversedCommand.isEnabled = false;
						expect( reversedSwitchButtonView.isEnabled ).toBe( false );
					} );

					it( 'should bind #isOn to the list reversed command', () => {
						listReversedCommand.value = true;
						expect( reversedSwitchButtonView.isOn ).toBe( true );

						listReversedCommand.value = false;
						expect( reversedSwitchButtonView.isOn ).toBe( false );
					} );

					it( 'should execute the list reversed command when the list property view fires #listReversed', () => {
						const spy = vi.spyOn( editor, 'execute' );

						listPropertiesView.fire( 'listReversed' );

						expect( spy ).toHaveBeenCalledOnce();
						expect( spy ).toHaveBeenCalledWith( 'listReversed', { reversed: true } );
					} );
				} );
			} );
		} );

		describe( 'menu bar components', () => {
			describe( 'component registration', () => {
				it( 'should register a menu as "menuBar:bulletedList" in the component factory when `styles` property is enabled', () => {
					return withEditor( { styles: true }, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'menuBar:bulletedList' ) ).toBe( true );

						const bulletedListDropdown = componentFactory.create( 'menuBar:bulletedList' );

						expect( bulletedListDropdown ).toBeInstanceOf( MenuBarMenuView );
					} );
				} );

				it( 'should not register a dropdown as "menuBar:bulletedList" in the component factory when `styles` ' +
					'property is not enabled', () => {
					return withEditor( {
						styles: false,
						startIndex: true,
						reversed: true
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'menuBar:bulletedList' ) ).toBe( false );
					} );
				} );

				it( 'should not register a dropdown as "menuBar:numberedList" in the component factory when no property is enabled', () => {
					return withEditor( {
						styles: false,
						startIndex: false,
						reversed: false
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'menuBar:numberedList' ) ).toBe( false );
					} );
				} );

				it( 'should not register a menu as "menuBar:bulletedList" in the component factory when `bulleted` ' +
					'list is disabled', () => {
					return withEditor( { styles: {
						listTypes: [ 'numbered' ]
					} }, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'menuBar:bulletedList' ) ).toBe( false );
					} );
				} );

				it( 'should not register a dropdown as "menuBar:numberedList" in the component factory when ' +
					'`numbered` list is disabled', () => {
					return withEditor( {
						styles: {
							listTypes: [ 'bulleted' ]
						},
						startIndex: false,
						reversed: false
					}, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'menuBar:numberedList' ) ).toBe( false );
					} );
				} );

				it( 'should not register a menu as "menuBar:bulletedList" in the component factory when `bulleted` and ' +
					'`numbered` list are disabled', () => {
					return withEditor( { styles: {
						listTypes: []
					} }, editor => {
						const componentFactory = editor.ui.componentFactory;

						expect( componentFactory.has( 'menuBar:numberedList' ) ).toBe( false );
						expect( componentFactory.has( 'menuBar:bulletedList' ) ).toBe( false );
					} );
				} );

				describe( 'listStyleTypes config entry', () => {
					it( 'should register buttons filtered by listStyleTypes for bulleted list in menu bar', () => {
						return withEditor( {
							styles: {
								listStyleTypes: {
									bulleted: [ 'disc', 'circle' ]
								}
							}
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const bulletedListMenu = componentFactory.create( 'menuBar:bulletedList' );

							bulletedListMenu.render();
							document.body.appendChild( bulletedListMenu.element );

							// Trigger lazy init
							bulletedListMenu.isOpen = true;
							bulletedListMenu.isOpen = false;

							const listPropertiesView = bulletedListMenu.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.tooltip ) ).toEqual( [ 'Disc', 'Circle' ] );

							bulletedListMenu.element.remove();
						} );
					} );

					it( 'should register buttons filtered by listStyleTypes for numbered list in menu bar', () => {
						return withEditor( {
							styles: {
								listStyleTypes: {
									numbered: [ 'decimal', 'lower-roman' ]
								}
							}
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const numberedListMenu = componentFactory.create( 'menuBar:numberedList' );

							numberedListMenu.render();
							document.body.appendChild( numberedListMenu.element );

							// Trigger lazy init
							numberedListMenu.isOpen = true;
							numberedListMenu.isOpen = false;

							const listPropertiesView = numberedListMenu.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.tooltip ) ).toEqual( [ 'Decimal', 'Lower–roman' ] );

							numberedListMenu.element.remove();
						} );
					} );

					it( 'should register all buttons when listStyleTypes is undefined in menu bar', () => {
						return withEditor( {
							styles: true
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const numberedListMenu = componentFactory.create( 'menuBar:numberedList' );

							numberedListMenu.render();
							document.body.appendChild( numberedListMenu.element );

							// Trigger lazy init
							numberedListMenu.isOpen = true;
							numberedListMenu.isOpen = false;

							const listPropertiesView = numberedListMenu.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.tooltip ) ).toEqual( [
								'Decimal',
								'Decimal with leading zero',
								'Lower–roman',
								'Upper-roman',
								'Lower-latin',
								'Upper-latin'
							] );

							numberedListMenu.element.remove();
						} );
					} );

					it( 'should register all buttons when listStyleTypes does not define current list type in menu bar', () => {
						return withEditor( {
							styles: {
								listStyleTypes: {
									bulleted: [ 'disc' ]
								}
							}
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const numberedListMenu = componentFactory.create( 'menuBar:numberedList' );

							numberedListMenu.render();
							document.body.appendChild( numberedListMenu.element );

							// Trigger lazy init
							numberedListMenu.isOpen = true;
							numberedListMenu.isOpen = false;

							const listPropertiesView = numberedListMenu.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.tooltip ) ).toEqual( [
								'Decimal',
								'Decimal with leading zero',
								'Lower–roman',
								'Upper-roman',
								'Lower-latin',
								'Upper-latin',
								'Arabic-indic'
							] );

							numberedListMenu.element.remove();
						} );
					} );

					it( 'should register no buttons when listStyleTypes has empty array in menu bar', () => {
						return withEditor( {
							styles: {
								listStyleTypes: {
									numbered: [],
									bulleted: []
								}
							}
						}, editor => {
							const componentFactory = editor.ui.componentFactory;
							const numberedListMenu = componentFactory.create( 'menuBar:numberedList' );

							numberedListMenu.render();
							document.body.appendChild( numberedListMenu.element );

							// Trigger lazy init
							numberedListMenu.isOpen = true;
							numberedListMenu.isOpen = false;

							const listPropertiesView = numberedListMenu.panelView.children.first;

							expect( listPropertiesView.stylesView ).toBeNull();

							numberedListMenu.element.remove();
						} );
					} );
				} );
			} );

			describe( 'bulleted list menu', () => {
				let bulletedListCommand, bulletedListMenu;

				beforeEach( () => {
					bulletedListCommand = editor.commands.get( 'bulletedList' );
					bulletedListMenu = editor.ui.componentFactory.create( 'menuBar:bulletedList' );

					bulletedListMenu.render();
					document.body.appendChild( bulletedListMenu.element );

					// Trigger lazy init.
					bulletedListMenu.isOpen = true;
					bulletedListMenu.isOpen = false;

					listPropertiesView = bulletedListMenu.panelView.children.first;
				} );

				afterEach( () => {
					bulletedListMenu.element.remove();
				} );

				it( 'should registered as "bulletedList" in the component factory', () => {
					expect( bulletedListMenu ).toBeInstanceOf( MenuBarMenuView );
				} );

				it( 'should have #isEnabled bound to the "bulletedList" command state', () => {
					expect( bulletedListMenu.isEnabled ).toBe( true );

					bulletedListCommand.isEnabled = true;
					expect( bulletedListMenu.isEnabled ).toBe( true );

					bulletedListCommand.isEnabled = false;
					expect( bulletedListMenu.isEnabled ).toBe( false );
				} );

				it( 'should not have numbered list properties', () => {
					expect( listPropertiesView.stylesView ).toBeInstanceOf( View );
					expect( listPropertiesView.startIndexFieldView ).toBeNull();
					expect( listPropertiesView.reversedSwitchButtonView ).toBeNull();
				} );

				describe( 'menu button', () => {
					let mainButtonView;

					beforeEach( () => {
						mainButtonView = bulletedListMenu.buttonView;
					} );

					it( 'should have a #label', () => {
						expect( mainButtonView.label ).toBe( 'Bulleted List' );
					} );

					it( 'should have an #icon', () => {
						expect( mainButtonView.icon ).toBe( IconBulletedList );
					} );
				} );

				describe( 'grid with style buttons', () => {
					let stylesView;

					beforeEach( () => {
						stylesView = listPropertiesView.stylesView;
					} );

					it( 'should have a proper ARIA label', () => {
						expect( stylesView.element.getAttribute( 'aria-label' ) ).toBe( 'Bulleted list styles toolbar' );
					} );

					it( 'should bring the "disc" list style button', () => {
						const buttonView = stylesView.children.first;

						expect( buttonView.label ).toBe( 'Toggle the disc list style' );
						expect( buttonView.tooltip ).toBe( 'Disc' );
						expect( buttonView.icon ).toBe( IconListStyleDisc );
					} );

					it( 'should bring the "circle" list style button', () => {
						const buttonView = stylesView.children.get( 1 );

						expect( buttonView.label ).toBe( 'Toggle the circle list style' );
						expect( buttonView.tooltip ).toBe( 'Circle' );
						expect( buttonView.icon ).toBe( IconListStyleCircle );
					} );

					it( 'should bring the "square" list style button', () => {
						const buttonView = stylesView.children.get( 2 );

						expect( buttonView.label ).toBe( 'Toggle the square list style' );
						expect( buttonView.tooltip ).toBe( 'Square' );
						expect( buttonView.icon ).toBe( IconListStyleSquare );
					} );

					it( 'should only bring the style buttons supported by the command', () => {
						return withEditor( { styles: true }, editor => {
							const listStyleCommand = editor.commands.get( 'listStyle' );

							listStyleCommand.isStyleTypeSupported = style => style == 'square';

							const componentFactory = editor.ui.componentFactory;
							const bulletedListDropdown = componentFactory.create( 'bulletedList' );

							bulletedListDropdown.isOpen = true;

							const listPropertiesView = bulletedListDropdown.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.label ) ).toEqual( [
								'Toggle the square list style'
							] );
						} );
					} );

					describe( 'style button', () => {
						let styleButtonView;

						beforeEach( () => {
							// "circle"
							styleButtonView = stylesView.children.get( 1 );

							vi.spyOn( editor, 'execute' );
							vi.spyOn( editor.editing.view, 'focus' );
						} );

						it( 'should be instances of ButtonView', () => {
							expect( styleButtonView ).toBeInstanceOf( ButtonView );
						} );

						it( 'should change its #isOn state when the value of the "listStyleCommand" command changes', () => {
							expect( styleButtonView.isOn ).toBe( false );

							listStyleCommand.value = 'foo';
							expect( styleButtonView.isOn ).toBe( false );

							listStyleCommand.value = 'circle';
							expect( styleButtonView.isOn ).toBe( true );

							listStyleCommand.value = null;
							expect( styleButtonView.isOn ).toBe( false );
						} );

						it( 'should apply the new style if none was set', () => {
							_setModelData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'circle' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should apply the new style if a different one was set', () => {
							_setModelData( model, '<listItem listType="bulleted" listStyle="square" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'circle' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should remove (toggle) the style if the same style was set', () => {
							_setModelData( model, '<listItem listType="bulleted" listStyle="circle" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'bulletedList' );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should execute the "bulletedList" command and apply the style if selection was not anchored in a list', () => {
							_setModelData( model, '<paragraph>foo[]</paragraph>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'bulletedList' );
							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'circle' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should create the single undo step while selection was not anchored in a list', () => {
							_setModelData( model, '<paragraph>foo[]</paragraph>' );

							styleButtonView.fire( 'execute' );

							expect( _getModelData( model ) ).toBe(
								'<listItem listIndent="0" listStyle="circle" listType="bulleted">foo[]</listItem>'
							);

							editor.execute( 'undo' );

							expect( _getModelData( model ) ).toBe(
								'<paragraph>foo[]</paragraph>'
							);
						} );
					} );
				} );
			} );

			describe( 'numbered list menu', () => {
				let numberedListCommand, numberedListMenu;

				beforeEach( () => {
					numberedListCommand = editor.commands.get( 'numberedList' );
					numberedListMenu = editor.ui.componentFactory.create( 'menuBar:numberedList' );

					numberedListMenu.render();
					document.body.appendChild( numberedListMenu.element );

					// Trigger lazy init.
					numberedListMenu.isOpen = true;
					numberedListMenu.isOpen = false;

					listPropertiesView = numberedListMenu.panelView.children.first;
				} );

				afterEach( () => {
					numberedListMenu.element.remove();
				} );

				it( 'should have #isEnabled bound to the "numberedList" command state', () => {
					expect( numberedListMenu.isEnabled ).toBe( true );

					numberedListCommand.isEnabled = true;
					expect( numberedListMenu.isEnabled ).toBe( true );

					numberedListCommand.isEnabled = false;
					expect( numberedListMenu.isEnabled ).toBe( false );
				} );

				describe( 'support of config.list.properties', () => {
					it( 'should have styles grid, start index, and reversed fields when all properties are enabled in the config', () => {
						return withEditor( {
							styles: true,
							startIndex: true,
							reversed: true
						}, editor => {
							const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;

							expect( listPropertiesView.stylesView ).toBeInstanceOf( View );
							expect( listPropertiesView.startIndexFieldView ).toBeInstanceOf( LabeledFieldView );
							expect( listPropertiesView.reversedSwitchButtonView ).toBeInstanceOf( SwitchButtonView );

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should have only the styles grid when start index and reversed properties are disabled', () => {
						return withEditor( {
							styles: true,
							startIndex: false,
							reversed: false
						}, editor => {
							const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;

							expect( listPropertiesView.stylesView ).toBeInstanceOf( View );
							expect( listPropertiesView.startIndexFieldView ).toBeNull();
							expect( listPropertiesView.reversedSwitchButtonView ).toBeNull();

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should have only the numbered list property UI when styles are disabled', async () => {
						return withEditor( {
							styles: false,
							startIndex: true,
							reversed: true
						}, editor => {
							const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;

							expect( listPropertiesView.stylesView ).toBeNull();
							expect( listPropertiesView.startIndexFieldView ).toBeInstanceOf( LabeledFieldView );
							expect( listPropertiesView.reversedSwitchButtonView ).toBeInstanceOf( SwitchButtonView );

							numberedListDropdown.element.remove();
						} );
					} );

					it( 'should focus the start index field on open when styles are disabled', () => {
						return withEditor( {
							styles: false,
							startIndex: true,
							reversed: true
						}, editor => {
							const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;
							const startIndexFieldView = listPropertiesView.startIndexFieldView;

							// Force clear is necessary on CI.
							listPropertiesView.focusTracker.focusedElement = null;

							const spy = vi.spyOn( startIndexFieldView, 'focus' );

							numberedListDropdown.isOpen = true;

							expect( spy ).toHaveBeenCalledOnce();

							numberedListDropdown.element.remove();
							numberedListDropdown.destroy();
						} );
					} );
				} );

				describe( 'menu button', () => {
					let mainButtonView;

					beforeEach( () => {
						mainButtonView = numberedListMenu.buttonView;
					} );

					it( 'should have a #label', () => {
						expect( mainButtonView.label ).toBe( 'Numbered List' );
					} );

					it( 'should have an #icon', () => {
						expect( mainButtonView.icon ).toBe( IconNumberedList );
					} );
				} );

				describe( 'grid with style buttons', () => {
					let stylesView;

					beforeEach( () => {
						stylesView = listPropertiesView.stylesView;
					} );

					it( 'should have a proper ARIA label', () => {
						expect( stylesView.element.getAttribute( 'aria-label' ) ).toBe( 'Numbered list styles toolbar' );
					} );

					it( 'should bring the "decimal" list style button', () => {
						const buttonView = stylesView.children.first;

						expect( buttonView.label ).toBe( 'Toggle the decimal list style' );
						expect( buttonView.tooltip ).toBe( 'Decimal' );
						expect( buttonView.icon ).toBe( IconListStyleDecimal );
					} );

					it( 'should bring the "decimal-leading-zero" list style button', () => {
						const buttonView = stylesView.children.get( 1 );

						expect( buttonView.label ).toBe( 'Toggle the decimal with leading zero list style' );
						expect( buttonView.tooltip ).toBe( 'Decimal with leading zero' );
						expect( buttonView.icon ).toBe( IconListStyleDecimalLeadingZero );
					} );

					it( 'should bring the "lower-roman" list style button', () => {
						const buttonView = stylesView.children.get( 2 );

						expect( buttonView.label ).toBe( 'Toggle the lower–roman list style' );
						expect( buttonView.tooltip ).toBe( 'Lower–roman' );
						expect( buttonView.icon ).toBe( IconListStyleLowerRoman );
					} );

					it( 'should bring the "upper-roman" list style button', () => {
						const buttonView = stylesView.children.get( 3 );

						expect( buttonView.label ).toBe( 'Toggle the upper–roman list style' );
						expect( buttonView.tooltip ).toBe( 'Upper-roman' );
						expect( buttonView.icon ).toBe( IconListStyleUpperRoman );
					} );

					it( 'should bring the "lower–latin" list style button', () => {
						const buttonView = stylesView.children.get( 4 );

						expect( buttonView.label ).toBe( 'Toggle the lower–latin list style' );
						expect( buttonView.tooltip ).toBe( 'Lower-latin' );
						expect( buttonView.icon ).toBe( IconListStyleLowerLatin );
					} );

					it( 'should bring the "upper–latin" list style button', () => {
						const buttonView = stylesView.children.get( 5 );

						expect( buttonView.label ).toBe( 'Toggle the upper–latin list style' );
						expect( buttonView.tooltip ).toBe( 'Upper-latin' );
						expect( buttonView.icon ).toBe( IconListStyleUpperLatin );
					} );

					it( 'should only bring the style buttons supported by the command', () => {
						return withEditor( { styles: true }, editor => {
							const listStyleCommand = editor.commands.get( 'listStyle' );

							listStyleCommand.isStyleTypeSupported = style => style != 'lower-latin' && style != 'decimal';

							const componentFactory = editor.ui.componentFactory;
							const numberedListDropdown = componentFactory.create( 'numberedList' );

							numberedListDropdown.render();
							document.body.appendChild( numberedListDropdown.element );

							// Trigger lazy init.
							numberedListDropdown.isOpen = true;
							numberedListDropdown.isOpen = false;

							const listPropertiesView = numberedListDropdown.panelView.children.first;
							const stylesView = listPropertiesView.stylesView;

							expect( stylesView.children.map( b => b.label ) ).toEqual( [
								'Toggle the decimal with leading zero list style',
								'Toggle the lower–roman list style',
								'Toggle the upper–roman list style',
								'Toggle the upper–latin list style'
							] );

							numberedListDropdown.element.remove();
						} );
					} );

					describe( 'style button', () => {
						let styleButtonView;

						beforeEach( () => {
							// "decimal-leading-zero""
							styleButtonView = stylesView.children.get( 1 );

							vi.spyOn( editor, 'execute' );
							vi.spyOn( editor.editing.view, 'focus' );
						} );

						it( 'should be instances of ButtonView', () => {
							expect( styleButtonView ).toBeInstanceOf( ButtonView );
						} );

						it( 'should change its #isOn state when the value of the "listStyleCommand" command changes', () => {
							expect( styleButtonView.isOn ).toBe( false );

							listStyleCommand.value = 'foo';
							expect( styleButtonView.isOn ).toBe( false );

							listStyleCommand.value = 'decimal-leading-zero';
							expect( styleButtonView.isOn ).toBe( true );

							listStyleCommand.value = null;
							expect( styleButtonView.isOn ).toBe( false );
						} );

						it( 'should apply the new style if none was set', () => {
							_setModelData( model, '<listItem listType="numbered" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'decimal-leading-zero' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should apply the new style if a different one was set', () => {
							_setModelData( model, '<listItem listType="numbered" listStyle="square" listIndent="0">[]foo</listItem>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'decimal-leading-zero' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should remove (toggle) the style if the same style was set', () => {
							_setModelData(
								model,
								'<listItem listType="numbered" listStyle="decimal-leading-zero" listIndent="0">[]foo</listItem>'
							);

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'numberedList' );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should execute the "numberedList" command and apply the style if selection was not anchored in a list', () => {
							_setModelData( model, '<paragraph>foo[]</paragraph>' );

							styleButtonView.fire( 'execute' );

							expect( editor.execute ).toHaveBeenCalledWith( 'numberedList' );
							expect( editor.execute ).toHaveBeenCalledWith( 'listStyle', { type: 'decimal-leading-zero' } );
							expect( editor.editing.view.focus ).toHaveBeenCalledOnce();
							expect( editor.execute.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
								editor.editing.view.focus.mock.invocationCallOrder[ 0 ]
							);
						} );

						it( 'should create the single undo step while selection was not anchored in a list', () => {
							_setModelData( model, '<paragraph>foo[]</paragraph>' );

							styleButtonView.fire( 'execute' );

							expect( _getModelData( model ) ).toBe(
								'<listItem ' +
									'listIndent="0" ' +
									'listReversed="false" ' +
									'listStart="1" ' +
									'listStyle="decimal-leading-zero" ' +
									'listType="numbered">' +
									'foo[]' +
								'</listItem>'
							);

							editor.execute( 'undo' );

							expect( _getModelData( model ) ).toBe(
								'<paragraph>foo[]</paragraph>'
							);
						} );
					} );
				} );
			} );
		} );
	} );

	async function withEditor( listPropertiesConfig, callback ) {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ LegacyListProperties ],
			list: {
				properties: listPropertiesConfig
			}
		} );

		callback( editor );

		editorElement.remove();
		await editor.destroy();
	}
} );
