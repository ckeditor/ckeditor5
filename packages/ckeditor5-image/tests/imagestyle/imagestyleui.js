/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import utils from '../../src/imagestyle/utils';
import ImageToolbar from '../../src/imagetoolbar';
import ImageStyleEditing from '../../src/imagestyle/imagestyleediting';
import ImageStyleUI from '../../src/imagestyle/imagestyleui';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageInlineEditing from '../../src/image/imageinlineediting';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import { SplitButtonView } from '../../../../src/ui';

describe( 'ImageStyleUI', () => {
	let editor, editorElement, factory, defaultDropdowns;

	const { DEFAULT_OPTIONS, getDefaultDropdownDefinitions } = utils;
	const allStyles = Object.values( DEFAULT_OPTIONS );
	const customDropdowns = [ {
		name: 'imageStyle:custom',
		title: 'Custom title',
		defaultItem: 'imageStyle:inline',
		items: [ 'imageStyle:inline', 'imageStyle:alignLeft' ]
	}, {
		name: 'imageStyle:custom2',
		defaultItem: 'imageStyle:block',
		items: [ 'imageStyle:block', 'imageStyle:side' ]
	} ];

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: { options: allStyles },
					toolbar: customDropdowns
				}
			} );

		factory = editor.ui.componentFactory;
		defaultDropdowns = getDefaultDropdownDefinitions( editor.plugins );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( ImageStyleUI.pluginName ).to.equal( 'ImageStyleUI' );
	} );

	it( 'should require ImageStyleEditing plugin', () => {
		expect( ImageStyleUI.requires ).to.deep.equal( [ ImageStyleEditing ] );
	} );

	describe( 'init()', () => {
		it( 'should register a button for each of the provided styles', () => {
			allStyles.forEach( ( { name } ) => {
				expect( factory.has( `imageStyle:${ name }` ) ).to.be.true;
			} );
		} );

		it( 'should register a drop-down for each of the default provided dropdowns', () => {
			defaultDropdowns.forEach( ( { name } ) => {
				expect( factory.has( name ) ).to.be.true;
			} );
		} );

		it( 'should register a drop-down for each of the custom defined dropdowns', () => {
			customDropdowns.forEach( ( { name } ) => {
				expect( factory.has( name ) ).to.be.true;
			} );
		} );
	} );

	describe( 'localizedDefaultStylesTitles()', () => {
		it( 'should return localized titles of default styles', () => {
			expect( editor.plugins.get( ImageStyleUI ).localizedDefaultStylesTitles ).to.deep.equal( {
				'Full size image': 'Full size image',
				'Side image': 'Side image',
				'Left aligned image': 'Left aligned image',
				'Centered image': 'Centered image',
				'Right aligned image': 'Right aligned image',
				'Wrap text': 'Wrap text',
				'Break text': 'Break text',
				'In line': 'In line'
			} );
		} );
	} );

	describe( 'style buttons', () => {
		let buttons;

		beforeEach( () => {
			buttons = allStyles.map( style => ( {
				config: style,
				buttonView: factory.create( `imageStyle:${ style.name }` )
			} ) );
		} );

		it( 'should set the button properties properly', () => {
			for ( const { config, buttonView } of buttons ) {
				expect( buttonView ).to.be.instanceOf( ButtonView );
				expect( buttonView.label ).to.equal( config.title );
				expect( buttonView.icon ).to.equal( config.icon );
				expect( buttonView.tooltip ).to.be.true;
				expect( buttonView.isToggleable ).to.be.true;
			}
		} );

		it( 'should enable the button if the command is enabled', () => {
			const command = editor.commands.get( 'imageStyle' );

			for ( const { buttonView } of buttons ) {
				command.isEnabled = true;
				expect( buttonView.isEnabled ).to.be.true;
				command.isEnabled = false;
				expect( buttonView.isEnabled ).to.be.false;
			}
		} );

		it( 'should set the #isOn property based on the command value', () => {
			const command = editor.commands.get( 'imageStyle' );

			for ( const { config, buttonView } of buttons ) {
				command.value = config.name;
				expect( buttonView.isOn ).to.be.true;
				command.value = false;
				expect( buttonView.isOn ).to.be.false;
				command.value = 'someCustomValue';
				expect( buttonView.isOn ).to.be.false;
			}
		} );

		it( 'should execute the command when the button is being clicked', () => {
			const commandSpy = sinon.spy( editor, 'execute' );
			const focusSpy = sinon.stub( editor.editing.view, 'focus' );

			for ( const { config, buttonView } of buttons ) {
				buttonView.fire( 'execute' );

				sinon.assert.calledOnce( commandSpy );
				sinon.assert.calledWithExactly( commandSpy, 'imageStyle', { value: config.name } );
				sinon.assert.called( focusSpy );

				commandSpy.resetHistory();
			}
		} );

		it( 'should not add buttons to image toolbar if configuration is present', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const customEditor = await ClassicTestEditor
				.create( customEditorElement, {
					plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
					image: {
						styles: { styles: allStyles },
						toolbar: [ 'foo', 'bar' ]
					}
				} );

			expect( customEditor.config.get( 'image.toolbar' ) ).to.deep.equal( [ 'foo', 'bar' ] );

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should translate buttons if taken from default styles', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			class TranslationMock extends Plugin {
				init() { sinon.stub( this.editor, 't' ).returns( 'Default title' ); }
			}

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ TranslationMock, ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: { options: allStyles },
					toolbar: [ ...defaultDropdowns, ...customDropdowns ]
				}
			} );

			const buttonView = customEditor.ui.componentFactory.create( 'imageStyle:alignLeft' );

			expect( buttonView.label ).to.equal( 'Default title' );

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should pass through the defined title if the translation is missing', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: {
						options: [ { name: 'foo', modelElements: [ 'imageBlock' ], title: 'Custom title' } ]
					}
				}
			} );

			const buttonView = customEditor.ui.componentFactory.create( 'imageStyle:foo' );

			expect( buttonView.label ).to.equal( 'Custom title' );

			customEditorElement.remove();
			await customEditor.destroy();
		} );
	} );

	describe( 'drop-downs', () => {
		let dropdowns;

		testUtils.createSinonSandbox();

		beforeEach( () => {
			dropdowns = [ ...defaultDropdowns, ...customDropdowns ].map( dropdown => {
				const view = factory.create( dropdown.name );

				return { view, buttonView: view.buttonView, config: dropdown };
			} );
		} );

		it( 'should define the drop-down properties and children properly', () => {
			for ( const { config, view, buttonView } of dropdowns ) {
				const defaultItem = allStyles.find( style => style.name === config.defaultItem.replace( 'imageStyle:', '' ) );

				expect( view ).to.be.instanceOf( DropdownView );
				expect( buttonView ).to.be.instanceOf( SplitButtonView );

				expect( buttonView.label ).to.equal( ( config.title ? `${ config.title }: ` : '' ) + defaultItem.title );
				expect( buttonView.tooltip ).to.be.true;
				expect( buttonView.class ).to.be.null;

				expect( view.toolbarView.items ).to.have.lengthOf( config.items.length );

				view.toolbarView.items.map( item => {
					expect( item ).to.be.instanceOf( ButtonView );
				} );
			}
		} );

		it( 'should translate the drop-down title if taken from default styles', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			class TranslationMock extends Plugin {
				init() { sinon.stub( this.editor, 't' ).returns( 'Default title' ); }
			}

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ TranslationMock, ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: { options: allStyles },
					toolbar: defaultDropdowns
				}
			} );

			const dropdownView = customEditor.ui.componentFactory.create( 'imageStyle:wrapText' );

			expect( dropdownView.buttonView.label ).to.equal( 'Default title: Default title' );

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should pass through the defined title if the translation is missing', async () => {
			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: { options: allStyles },
					toolbar: customDropdowns
				}
			} );

			const dropdownView = customEditor.ui.componentFactory.create( 'imageStyle:custom' );

			expect( dropdownView.buttonView.label ).to.equal( 'Custom title: In line' );

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should warn and filter out the items that are not defined as the styles while creating a toolbar', async () => {
			sinon.stub( console, 'warn' );

			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const dropdown = {
				name: 'imageStyle:test',
				title: 'Test',
				items: [ 'imageStyle:alignLeft', 'imageStyle:foo', 'imageStyle:bar' ],
				defaultItem: 'imageStyle:alignLeft'
			};

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ ImageBlockEditing, ImageInlineEditing, ImageToolbar, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: { options: allStyles },
					toolbar: [ dropdown ]
				}
			} );

			sinon.assert.calledOnce( console.warn );
			sinon.assert.calledWithExactly( console.warn,
				sinon.match( /^image-style-configuration-definition-invalid/ ),
				{ dropdown },
				sinon.match.string // Link to the documentation
			);

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		it( 'should warn and filter out the items that are not supported by the loaded plugins while creating a toolbar', async () => {
			sinon.stub( console, 'warn' );

			const customEditorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( customEditorElement );

			const dropdown = {
				name: 'imageStyle:Bar',
				title: 'Bar',
				items: [ 'imageStyle:alignLeft', 'imageStyle:foo' ],
				defaultItem: 'imageStyle:alignLeft'
			};

			const customEditor = await ClassicTestEditor.create( customEditorElement, {
				plugins: [ ImageBlockEditing, ImageToolbar, ImageStyleEditing, ImageStyleUI ],
				image: {
					styles: {
						options: [ { name: 'foo', modelElements: [ 'imageInline' ], icon: '' }, 'alignLeft' ]
					},
					toolbar: [ dropdown ]
				}
			} );

			sinon.assert.calledTwice( console.warn );
			sinon.assert.calledWithExactly( console.warn,
				sinon.match( /^image-style-missing-dependency/ ),
				{
					style: { name: 'foo', modelElements: [ 'imageInline' ], icon: '' },
					missingPlugins: [ 'ImageInlineEditing' ]
				},
				sinon.match.string // Link to the documentation
			);
			sinon.assert.calledWithExactly( console.warn,
				sinon.match( /^image-style-configuration-definition-invalid/ ),
				{ dropdown },
				sinon.match.string // Link to the documentation
			);

			customEditorElement.remove();
			await customEditor.destroy();
		} );

		describe( 'when at least one of the nested buttons is on', () => {
			beforeEach( () => {
				dropdowns = dropdowns.map( dropdown => {
					const activeButton = dropdown.view.toolbarView.items.first;

					activeButton.isOn = true;

					return { ...dropdown, activeButton };
				} );
			} );

			it( 'should inherit the icon, state and label from the active nested button', () => {
				for ( const { config, buttonView, activeButton } of dropdowns ) {
					expect( buttonView.icon ).to.equal( activeButton.icon );
					expect( buttonView.label ).to.equal( ( config.title ? `${ config.title }: ` : '' ) + activeButton.label );
					expect( buttonView.isOn ).to.be.true;
				}
			} );

			it( 'should have the "ck-splitbutton_flatten" class', () => {
				for ( const { buttonView } of dropdowns ) {
					expect( buttonView.class ).to.equal( 'ck-splitbutton_flatten' );
				}
			} );

			it( 'it should open the dropDown view when the button is being clicked', () => {
				const commandSpy = sinon.spy( editor, 'execute' );

				for ( const { view, buttonView } of dropdowns ) {
					buttonView.fire( 'execute' );

					sinon.assert.notCalled( commandSpy );
					expect( view.isOpen ).to.be.true;
				}
			} );

			it( 'it should close the open dropDown view when the button is being clicked', () => {
				const commandSpy = sinon.spy( editor, 'execute' );

				for ( const { view, buttonView } of dropdowns ) {
					buttonView.fire( 'execute' );
					buttonView.fire( 'execute' );

					sinon.assert.notCalled( commandSpy );
					expect( view.isOpen ).to.be.false;
				}
			} );
		} );

		describe( 'when none of the nested buttons are on', () => {
			it( 'should inherit the icon and label of the defaultItem', () => {
				for ( const { buttonView, config } of dropdowns ) {
					const defaultItem = DEFAULT_OPTIONS[ config.defaultItem.replace( 'imageStyle:', '' ) ];

					expect( buttonView.icon ).to.equal( defaultItem.icon );
					expect( buttonView.label ).to.equal( ( config.title ? `${ config.title }: ` : '' ) + defaultItem.title );
				}
			} );

			it( 'should not have the "ck-splitbutton_flatten" class', () => {
				for ( const { buttonView } of dropdowns ) {
					expect( buttonView.class ).to.be.null;
				}
			} );

			it( 'it should execute the command with proper value when the button is being clicked', () => {
				const commandSpy = sinon.spy( editor, 'execute' );
				const focusSpy = sinon.stub( editor.editing.view, 'focus' );

				for ( const { buttonView, config, view } of dropdowns ) {
					buttonView.fire( 'execute' );

					expect( view.isOpen ).to.be.false;

					sinon.assert.calledOnce( commandSpy );
					sinon.assert.calledWithExactly( commandSpy, 'imageStyle', { value: config.defaultItem.replace( 'imageStyle:', '' ) } );
					sinon.assert.called( focusSpy );

					commandSpy.resetHistory();
				}
			} );
		} );

		it( 'should be enabled when at least one of the nested buttons are enabled', () => {
			for ( const dropdown of dropdowns ) {
				const dropdownItems = dropdown.view.toolbarView.items;

				for ( const item of dropdownItems ) {
					item.isEnabled = false;
				}

				dropdownItems.first.isEnabled = true;
			}

			for ( const { buttonView, config } of dropdowns ) {
				expect( buttonView.isEnabled, `Failing dropdown name: "${ config.name }"` ).to.be.true;
			}
		} );

		it( 'should be disabled when none of the nested buttons are enabled', () => {
			for ( const dropdown of dropdowns ) {
				const dropdownItems = dropdown.view.toolbarView.items;

				for ( const item of dropdownItems ) {
					item.isEnabled = false;
				}
			}

			for ( const { buttonView, config } of dropdowns ) {
				expect( buttonView.isEnabled, `Failing dropdown name: "${ config.name }"` ).to.be.false;
			}
		} );
	} );
} );

