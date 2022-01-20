/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ListProperties from '../../src/listproperties';
import ListPropertiesUI from '../../src/listproperties/listpropertiesui';

import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import { View, ButtonView, LabeledFieldView, SwitchButtonView } from '@ckeditor/ckeditor5-ui';

import bulletedListIcon from '../../theme/icons/bulletedlist.svg';
import numberedListIcon from '../../theme/icons/numberedlist.svg';
import listStyleDiscIcon from '../../theme/icons/liststyledisc.svg';
import listStyleCircleIcon from '../../theme/icons/liststylecircle.svg';
import listStyleSquareIcon from '../../theme/icons/liststylesquare.svg';
import listStyleDecimalIcon from '../../theme/icons/liststyledecimal.svg';
import listStyleDecimalWithLeadingZeroIcon from '../../theme/icons/liststyledecimalleadingzero.svg';
import listStyleLowerRomanIcon from '../../theme/icons/liststylelowerroman.svg';
import listStyleUpperRomanIcon from '../../theme/icons/liststyleupperroman.svg';
import listStyleLowerLatinIcon from '../../theme/icons/liststylelowerlatin.svg';
import listStyleUpperLatinIcon from '../../theme/icons/liststyleupperlatin.svg';

import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

describe( 'ListPropertiesUI', () => {
	let editorElement, editor, model, listStyleCommand, listPropertiesView;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, BlockQuote, ListProperties, UndoEditing ],
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
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ListPropertiesUI.pluginName ).to.equal( 'ListPropertiesUI' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ListPropertiesUI ) ).to.be.instanceOf( ListPropertiesUI );
	} );

	describe( 'init()', () => {
		describe( 'component registration', () => {
			it( 'should register a dropdown as "bulletedList" in the component factory when `styles` property is enabled', () => {
				return withEditor( { styles: true }, editor => {
					const componentFactory = editor.ui.componentFactory;

					expect( componentFactory.has( 'bulletedList' ) ).to.be.true;

					const bulletedListDropdown = componentFactory.create( 'bulletedList' );

					expect( bulletedListDropdown ).to.be.instanceOf( DropdownView );
				} );
			} );

			it( 'should not register a dropdown as "bulletedList" in the component factory when `styles` property is not enabled', () => {
				return withEditor( {
					styles: false,
					startIndex: true,
					reversed: true
				}, editor => {
					const componentFactory = editor.ui.componentFactory;

					expect( componentFactory.has( 'bulletedList' ) ).to.be.false;
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

							expect( componentFactory.has( 'numberedList' ) ).to.be.true;

							const numberedListDropdown = componentFactory.create( 'numberedList' );

							expect( numberedListDropdown ).to.be.instanceOf( DropdownView );
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

					expect( componentFactory.has( 'numberedList' ) ).to.be.false;
				} );
			} );
		} );

		describe( 'bulleted list dropdown', () => {
			let bulletedListCommand, bulletedListDropdown;

			beforeEach( () => {
				bulletedListCommand = editor.commands.get( 'bulletedList' );
				bulletedListDropdown = editor.ui.componentFactory.create( 'bulletedList' );
				listPropertiesView = bulletedListDropdown.panelView.children.first;
			} );

			it( 'should registered as "bulletedList" in the component factory', () => {
				expect( bulletedListDropdown ).to.be.instanceOf( DropdownView );
			} );

			it( 'should have #isEnabled bound to the "bulletedList" command state', () => {
				expect( bulletedListDropdown.isEnabled ).to.be.true;

				bulletedListCommand.isEnabled = true;
				expect( bulletedListDropdown.isEnabled ).to.be.true;

				bulletedListCommand.isEnabled = false;
				expect( bulletedListDropdown.isEnabled ).to.be.false;
			} );

			it( 'should have a specific CSS class', () => {
				expect( bulletedListDropdown.class ).to.equal( 'ck-list-styles-dropdown' );
			} );

			it( 'should not have numbered list properties', () => {
				expect( listPropertiesView.stylesView ).to.be.instanceOf( View );
				expect( listPropertiesView.startIndexFieldView ).to.be.null;
				expect( listPropertiesView.reversedSwitchButtonView ).to.be.null;
			} );

			describe( 'main split button', () => {
				let mainButtonView;

				beforeEach( () => {
					mainButtonView = bulletedListDropdown.buttonView;
				} );

				it( 'should have a #label', () => {
					expect( mainButtonView.label ).to.equal( 'Bulleted List' );
				} );

				it( 'should have an #icon', () => {
					expect( mainButtonView.icon ).to.equal( bulletedListIcon );
				} );

				it( 'should have a #tooltip based on a label', () => {
					expect( mainButtonView.tooltip ).to.be.true;
				} );

				it( 'should be toggleable', () => {
					expect( mainButtonView.isToggleable ).to.be.true;
				} );

				it( 'should have the #isOn state bound to the value of the "bulletedList" command', () => {
					expect( mainButtonView.isOn ).to.be.false;

					bulletedListCommand.value = 'foo';
					expect( mainButtonView.isOn ).to.be.true;

					bulletedListCommand.value = null;
					expect( mainButtonView.isOn ).to.be.false;
				} );

				it( 'should execute the "bulletedList" command and focus the editing view when clicked', () => {
					sinon.spy( editor, 'execute' );
					sinon.spy( editor.editing.view, 'focus' );

					mainButtonView.fire( 'execute' );
					sinon.assert.calledWithExactly( editor.execute, 'bulletedList' );
					sinon.assert.calledOnce( editor.editing.view.focus );
					sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
				} );
			} );

			describe( 'grid with style buttons', () => {
				let stylesView;

				beforeEach( () => {
					stylesView = listPropertiesView.stylesView;
				} );

				it( 'should have a proper ARIA label', () => {
					expect( stylesView.element.getAttribute( 'aria-label' ) ).to.equal( 'Bulleted list styles toolbar' );
				} );

				it( 'should bring the "disc" list style button', () => {
					const buttonView = stylesView.children.first;

					expect( buttonView.label ).to.equal( 'Toggle the disc list style' );
					expect( buttonView.tooltip ).to.equal( 'Disc' );
					expect( buttonView.icon ).to.equal( listStyleDiscIcon );
				} );

				it( 'should bring the "circle" list style button', () => {
					const buttonView = stylesView.children.get( 1 );

					expect( buttonView.label ).to.equal( 'Toggle the circle list style' );
					expect( buttonView.tooltip ).to.equal( 'Circle' );
					expect( buttonView.icon ).to.equal( listStyleCircleIcon );
				} );

				it( 'should bring the "square" list style button', () => {
					const buttonView = stylesView.children.get( 2 );

					expect( buttonView.label ).to.equal( 'Toggle the square list style' );
					expect( buttonView.tooltip ).to.equal( 'Square' );
					expect( buttonView.icon ).to.equal( listStyleSquareIcon );
				} );

				it( 'should close the drop-down when any button gets executed', () => {
					const spy = sinon.spy();

					bulletedListDropdown.on( 'execute', spy );
					listPropertiesView.fire( 'execute' );

					sinon.assert.calledOnce( spy );
				} );

				describe( 'style button', () => {
					let styleButtonView;

					beforeEach( () => {
						// "circle"
						styleButtonView = stylesView.children.get( 1 );

						sinon.spy( editor, 'execute' );
						sinon.spy( editor.editing.view, 'focus' );
					} );

					it( 'should be instances of ButtonView', () => {
						expect( styleButtonView ).to.be.instanceOf( ButtonView );
					} );

					it( 'should change its #isOn state when the value of the "listStyleCommand" command changes', () => {
						expect( styleButtonView.isOn ).to.be.false;

						listStyleCommand.value = 'foo';
						expect( styleButtonView.isOn ).to.be.false;

						listStyleCommand.value = 'circle';
						expect( styleButtonView.isOn ).to.be.true;

						listStyleCommand.value = null;
						expect( styleButtonView.isOn ).to.be.false;
					} );

					it( 'should apply the new style if none was set', () => {
						setData( model, '<listItem listType="bulleted" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyle', { type: 'circle' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should apply the new style if a different one was set', () => {
						setData( model, '<listItem listType="bulleted" listStyle="square" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyle', { type: 'circle' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should remove (toggle) the style if the same style was set', () => {
						setData( model, '<listItem listType="bulleted" listStyle="circle" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyle', { type: 'default' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should execute the "bulletedList" command and apply the style if selection was not anchored in a list', () => {
						setData( model, '<paragraph>foo[]</paragraph>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'bulletedList' );
						sinon.assert.calledWithExactly( editor.execute, 'listStyle', { type: 'circle' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should create the single undo step while selection was not anchored in a list', () => {
						setData( model, '<paragraph>foo[]</paragraph>' );

						styleButtonView.fire( 'execute' );

						expect( getData( model ) ).to.equal(
							'<listItem listIndent="0" listStyle="circle" listType="bulleted">foo[]</listItem>'
						);

						editor.execute( 'undo' );

						expect( getData( model ) ).to.equal(
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
				listPropertiesView = numberedListDropdown.panelView.children.first;
			} );

			it( 'should have #isEnabled bound to the "numberedList" command state', () => {
				expect( numberedListDropdown.isEnabled ).to.be.true;

				numberedListCommand.isEnabled = true;
				expect( numberedListDropdown.isEnabled ).to.be.true;

				numberedListCommand.isEnabled = false;
				expect( numberedListDropdown.isEnabled ).to.be.false;
			} );

			it( 'should have a specific CSS class', () => {
				expect( numberedListDropdown.class ).to.equal( 'ck-list-styles-dropdown' );
			} );

			describe( 'support of config.list.properties', () => {
				it( 'should have styles grid, start index, and reversed fields when all properties are enabled in the config', () => {
					return withEditor( {
						styles: true,
						startIndex: true,
						reversed: true
					}, editor => {
						const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );
						const listPropertiesView = numberedListDropdown.panelView.children.first;

						expect( listPropertiesView.stylesView ).to.be.instanceOf( View );
						expect( listPropertiesView.startIndexFieldView ).to.be.instanceOf( LabeledFieldView );
						expect( listPropertiesView.reversedSwitchButtonView ).to.be.instanceOf( SwitchButtonView );
					} );
				} );

				it( 'should have only the styles grid when start index and reversed properties are disabled', () => {
					return withEditor( {
						styles: true,
						startIndex: false,
						reversed: false
					}, editor => {
						const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );
						const listPropertiesView = numberedListDropdown.panelView.children.first;

						expect( listPropertiesView.stylesView ).to.be.instanceOf( View );
						expect( listPropertiesView.startIndexFieldView ).to.be.null;
						expect( listPropertiesView.reversedSwitchButtonView ).to.be.null;
					} );
				} );

				it( 'should have only the numbered list property UI when styles are disabled', async () => {
					return withEditor( {
						styles: false,
						startIndex: true,
						reversed: true
					}, editor => {
						const numberedListDropdown = editor.ui.componentFactory.create( 'numberedList' );
						const listPropertiesView = numberedListDropdown.panelView.children.first;

						expect( listPropertiesView.stylesView ).to.be.null;
						expect( listPropertiesView.startIndexFieldView ).to.be.instanceOf( LabeledFieldView );
						expect( listPropertiesView.reversedSwitchButtonView ).to.be.instanceOf( SwitchButtonView );
					} );
				} );
			} );

			describe( 'main split button', () => {
				let mainButtonView;

				beforeEach( () => {
					mainButtonView = numberedListDropdown.buttonView;
				} );

				it( 'should have a #label', () => {
					expect( mainButtonView.label ).to.equal( 'Numbered List' );
				} );

				it( 'should have an #icon', () => {
					expect( mainButtonView.icon ).to.equal( numberedListIcon );
				} );

				it( 'should have a #tooltip based on a label', () => {
					expect( mainButtonView.tooltip ).to.be.true;
				} );

				it( 'should be toggleable', () => {
					expect( mainButtonView.isToggleable ).to.be.true;
				} );

				it( 'should have the #isOn state bound to the value of the "numberedList" command', () => {
					expect( mainButtonView.isOn ).to.be.false;

					numberedListCommand.value = 'foo';
					expect( mainButtonView.isOn ).to.be.true;

					numberedListCommand.value = null;
					expect( mainButtonView.isOn ).to.be.false;
				} );

				it( 'should execute the "numberedList" command and focus the editing view when clicked', () => {
					sinon.spy( editor, 'execute' );
					sinon.spy( editor.editing.view, 'focus' );

					mainButtonView.fire( 'execute' );
					sinon.assert.calledWithExactly( editor.execute, 'numberedList' );
					sinon.assert.calledOnce( editor.editing.view.focus );
					sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
				} );
			} );

			describe( 'grid with style buttons', () => {
				let stylesView;

				beforeEach( () => {
					stylesView = listPropertiesView.stylesView;
				} );

				it( 'should have a proper ARIA label', () => {
					expect( stylesView.element.getAttribute( 'aria-label' ) ).to.equal( 'Numbered list styles toolbar' );
				} );

				it( 'should bring the "decimal" list style button', () => {
					const buttonView = stylesView.children.first;

					expect( buttonView.label ).to.equal( 'Toggle the decimal list style' );
					expect( buttonView.tooltip ).to.equal( 'Decimal' );
					expect( buttonView.icon ).to.equal( listStyleDecimalIcon );
				} );

				it( 'should bring the "decimal-leading-zero" list style button', () => {
					const buttonView = stylesView.children.get( 1 );

					expect( buttonView.label ).to.equal( 'Toggle the decimal with leading zero list style' );
					expect( buttonView.tooltip ).to.equal( 'Decimal with leading zero' );
					expect( buttonView.icon ).to.equal( listStyleDecimalWithLeadingZeroIcon );
				} );

				it( 'should bring the "lower-roman" list style button', () => {
					const buttonView = stylesView.children.get( 2 );

					expect( buttonView.label ).to.equal( 'Toggle the lower–roman list style' );
					expect( buttonView.tooltip ).to.equal( 'Lower–roman' );
					expect( buttonView.icon ).to.equal( listStyleLowerRomanIcon );
				} );

				it( 'should bring the "upper-roman" list style button', () => {
					const buttonView = stylesView.children.get( 3 );

					expect( buttonView.label ).to.equal( 'Toggle the upper–roman list style' );
					expect( buttonView.tooltip ).to.equal( 'Upper-roman' );
					expect( buttonView.icon ).to.equal( listStyleUpperRomanIcon );
				} );

				it( 'should bring the "lower–latin" list style button', () => {
					const buttonView = stylesView.children.get( 4 );

					expect( buttonView.label ).to.equal( 'Toggle the lower–latin list style' );
					expect( buttonView.tooltip ).to.equal( 'Lower-latin' );
					expect( buttonView.icon ).to.equal( listStyleLowerLatinIcon );
				} );

				it( 'should bring the "upper–latin" list style button', () => {
					const buttonView = stylesView.children.get( 5 );

					expect( buttonView.label ).to.equal( 'Toggle the upper–latin list style' );
					expect( buttonView.tooltip ).to.equal( 'Upper-latin' );
					expect( buttonView.icon ).to.equal( listStyleUpperLatinIcon );
				} );

				it( 'should close the drop-down when any button gets executed', () => {
					const spy = sinon.spy();

					numberedListDropdown.on( 'execute', spy );
					listPropertiesView.fire( 'execute' );

					sinon.assert.calledOnce( spy );
				} );

				describe( 'style button', () => {
					let styleButtonView;

					beforeEach( () => {
						// "decimal-leading-zero""
						styleButtonView = stylesView.children.get( 1 );

						sinon.spy( editor, 'execute' );
						sinon.spy( editor.editing.view, 'focus' );
					} );

					it( 'should be instances of ButtonView', () => {
						expect( styleButtonView ).to.be.instanceOf( ButtonView );
					} );

					it( 'should change its #isOn state when the value of the "listStyleCommand" command changes', () => {
						expect( styleButtonView.isOn ).to.be.false;

						listStyleCommand.value = 'foo';
						expect( styleButtonView.isOn ).to.be.false;

						listStyleCommand.value = 'decimal-leading-zero';
						expect( styleButtonView.isOn ).to.be.true;

						listStyleCommand.value = null;
						expect( styleButtonView.isOn ).to.be.false;
					} );

					it( 'should apply the new style if none was set', () => {
						setData( model, '<listItem listType="numbered" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyle', { type: 'decimal-leading-zero' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should apply the new style if a different one was set', () => {
						setData( model, '<listItem listType="numbered" listStyle="square" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyle', { type: 'decimal-leading-zero' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should remove (toggle) the style if the same style was set', () => {
						setData( model, '<listItem listType="numbered" listStyle="decimal-leading-zero" listIndent="0">[]foo</listItem>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'listStyle', { type: 'default' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should execute the "numberedList" command and apply the style if selection was not anchored in a list', () => {
						setData( model, '<paragraph>foo[]</paragraph>' );

						styleButtonView.fire( 'execute' );

						sinon.assert.calledWithExactly( editor.execute, 'numberedList' );
						sinon.assert.calledWithExactly( editor.execute, 'listStyle', { type: 'decimal-leading-zero' } );
						sinon.assert.calledOnce( editor.editing.view.focus );
						sinon.assert.callOrder( editor.execute, editor.editing.view.focus );
					} );

					it( 'should create the single undo step while selection was not anchored in a list', () => {
						setData( model, '<paragraph>foo[]</paragraph>' );

						styleButtonView.fire( 'execute' );

						expect( getData( model ) ).to.equal(
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

						expect( getData( model ) ).to.equal(
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
					expect( startIndexFieldView.isEnabled ).to.be.true;

					listStartCommand.isEnabled = false;
					expect( startIndexFieldView.isEnabled ).to.be.false;
				} );

				it( 'should bind #value to the list start command', () => {
					listStartCommand.value = 123;
					expect( startIndexFieldView.fieldView.value ).to.equal( 123 );

					listStartCommand.value = 321;
					expect( startIndexFieldView.fieldView.value ).to.equal( 321 );
				} );

				it( 'should execute the list start command when the list property view fires #listStart', () => {
					const spy = sinon.spy( editor, 'execute' );

					listPropertiesView.fire( 'listStart', { startIndex: 1234 } );

					sinon.assert.calledOnce( spy );
					sinon.assert.calledWithExactly( spy, 'listStart', { startIndex: 1234 } );
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
					expect( reversedSwitchButtonView.isEnabled ).to.be.true;

					listReversedCommand.isEnabled = false;
					expect( reversedSwitchButtonView.isEnabled ).to.be.false;
				} );

				it( 'should bind #isOn to the list reversed command', () => {
					listReversedCommand.value = true;
					expect( reversedSwitchButtonView.isOn ).to.be.true;

					listReversedCommand.value = false;
					expect( reversedSwitchButtonView.isOn ).to.be.false;
				} );

				it( 'should execute the list reversed command when the list property view fires #listReversed', () => {
					const spy = sinon.spy( editor, 'execute' );

					listPropertiesView.fire( 'listReversed' );

					sinon.assert.calledOnce( spy );
					sinon.assert.calledWithExactly( spy, 'listReversed', { reversed: true } );
				} );
			} );
		} );
	} );

	async function withEditor( listPropertiesConfig, callback ) {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ ListProperties ],
			list: {
				properties: listPropertiesConfig
			}
		} );

		callback( editor );

		editorElement.remove();
		await editor.destroy();
	}
} );
