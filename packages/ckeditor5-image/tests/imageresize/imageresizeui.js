/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Image from '../../src/image';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import ImageResizeUI from '../../src/imageresize/imageresizeui';
import ImageStyle from '../../src/imagestyle';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Table from '@ckeditor/ckeditor5-table/src/table';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import iconSmall from '../../theme/icons/image-resize-small.svg';
import iconMedium from '../../theme/icons/image-resize-medium.svg';
import iconLarge from '../../theme/icons/image-resize-large.svg';
import iconFull from '../../theme/icons/image-resize-full.svg';

describe( 'ImageResizeUI', () => {
	let plugin, command, editor, editorElement;

	const resizeOptions = [ {
		name: 'imageResize:original',
		value: null,
		icon: 'original'
	},
	{
		name: 'imageResize:25',
		label: '25%',
		value: '25',
		icon: 'small'
	},
	{
		name: 'imageResize:50',
		label: '50%',
		value: '50',
		icon: 'medium'
	},
	{
		name: 'imageResize:75',
		label: '75%',
		value: '75',
		icon: 'large'
	} ];

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeUI ],
				image: {
					resizeUnit: '%',
					resizeOptions
				}
			} );

		command = editor.commands.get( 'imageResize' );
		plugin = editor.plugins.get( 'ImageResizeUI' );
	} );

	afterEach( async () => {
		if ( editorElement ) {
			editorElement.remove();
		}

		if ( editor ) {
			await editor.destroy();
		}
	} );

	describe( 'plugin', () => {
		it( 'should be named', () => {
			expect( ImageResizeUI.pluginName ).to.equal( 'ImageResizeUI' );
		} );

		it( 'should be disabled when command is disabled', () => {
			command.isEnabled = true;

			expect( plugin.isEnabled ).to.be.true;

			command.isEnabled = false;

			expect( plugin.isEnabled ).to.be.false;
		} );
	} );

	it( 'should create `_resizeUnit`', () => {
		const unit = plugin._resizeUnit;

		expect( unit ).to.equal( '%' );
	} );

	describe( 'init()', () => {
		it( 'should have set "%" resize unit', () => {
			const unit = editor.config.get( 'image.resizeUnit' );

			expect( unit ).to.equal( '%' );
		} );

		it( 'should have set "%" resize unit if not defined', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeUI ],
					image: {
						resizeOptions
					}
				} );

			const button = editor.ui.componentFactory.create( 'imageResize:50' );
			const command = editor.commands.get( 'imageResize' );

			command.isEnabled = true;

			button.fire( 'execute' );

			expect( command.value.width.includes( '%' ) ).to.be.true;

			await editor.destroy();
		} );

		it( 'should have set "px" resize unit', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeUI ],
					image: {
						resizeUnit: 'px',
						resizeOptions
					}
				} );

			const button = editor.ui.componentFactory.create( 'imageResize:50' );
			const command = editor.commands.get( 'imageResize' );

			command.isEnabled = true;

			button.fire( 'execute' );

			expect( command.value.width.includes( 'px' ) ).to.be.true;

			await editor.destroy();
		} );

		it( 'should not register a dropdown or buttons if no resize options passed', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeUI ],
					image: {
						resizeUnit: 'px'
					}
				} );

			const resizeOptions = editor.config.get( 'image.resizeOptions' );

			expect( resizeOptions ).to.be.undefined;
			expect( editor.ui.componentFactory.has( 'imageResize' ) ).to.be.false;

			await editor.destroy();
		} );
	} );

	describe( 'resize options dropdown', () => {
		it( 'should be disabled when plugin is disabled', () => {
			const dropdownView = editor.ui.componentFactory.create( 'imageResize' );

			plugin.isEnabled = true;

			expect( dropdownView.isEnabled ).to.be.true;

			plugin.isEnabled = false;

			expect( dropdownView.isEnabled ).to.be.false;
		} );

		it( 'should be an instance of `DropdownView` if component is created without a value suffix', () => {
			expect( editor.ui.componentFactory.create( 'imageResize' ) ).to.be.instanceof( DropdownView );
		} );

		it( 'should have 4 resize options in the `imageResize` dropdown', () => {
			const dropdownView = editor.ui.componentFactory.create( 'imageResize' );

			expect( dropdownView.listView.items.length ).to.equal( 4 );
			expect( dropdownView.listView.items.first.element.textContent ).to.equal( 'Original' );
			expect( dropdownView.listView.items._items[ 1 ].element.textContent ).to.equal( '25%' );
			expect( dropdownView.listView.items.last.element.textContent ).to.equal( '75%' );
		} );

		it( 'should be created with a proper tooltip', () => {
			const dropdownView = editor.ui.componentFactory.create( 'imageResize' );

			expect( dropdownView.buttonView.tooltip ).to.equal( 'Resize image' );
		} );

		it( 'should execute resize command with a proper value', () => {
			const dropdownView = editor.ui.componentFactory.create( 'imageResize' );
			const commandSpy = sinon.spy( command, 'execute' );
			const resizeBy50Percent = dropdownView.listView.items._items[ 1 ].children._items[ 0 ];

			command.isEnabled = true;

			resizeBy50Percent.fire( 'execute' );

			sinon.assert.calledOnce( commandSpy );
			expect( command.value.width ).to.equal( '25%' );
		} );
	} );

	describe( 'resize option button', () => {
		it( 'should be bound to `#isEnabled`', () => {
			const buttonView = editor.ui.componentFactory.create( 'imageResize:50' );

			plugin.isEnabled = true;

			expect( buttonView.isEnabled ).to.be.true;

			plugin.isEnabled = false;

			expect( buttonView.isEnabled ).to.be.false;
		} );

		it( 'should be an instance of `ButtonView` if component is created with a value suffix', () => {
			expect( editor.ui.componentFactory.create( 'imageResize:50' ) ).to.be.instanceof( ButtonView );
		} );

		it( 'should be created with invisible "50%" label when is provided', () => {
			const buttonView = editor.ui.componentFactory.create( 'imageResize:50' );
			buttonView.render();

			expect( buttonView.withText ).to.be.false;
			expect( buttonView.label ).to.equal( '50%' );
			expect( buttonView.labelView ).to.be.instanceOf( View );
		} );

		it( 'should be created with invisible "50%" label when is not provided', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeUI ],
					image: {
						resizeUnit: '%',
						resizeOptions: [ {
							name: 'imageResize:50',
							value: '50',
							icon: 'medium'
						} ]
					}
				} );

			const buttonView = editor.ui.componentFactory.create( 'imageResize:50' );
			buttonView.render();

			expect( buttonView.withText ).to.be.false;
			expect( buttonView.label ).to.equal( '50%' );
			expect( buttonView.labelView ).to.be.instanceOf( View );

			editor.destroy();
		} );

		it( 'should be created with a proper tooltip, depends on the set value', () => {
			const buttonViewOriginal = editor.ui.componentFactory.create( 'imageResize:original' );
			const buttonView50 = editor.ui.componentFactory.create( 'imageResize:50' );

			buttonViewOriginal.render();
			buttonView50.render();

			expect( buttonViewOriginal.tooltip ).to.equal( 'Resize image to the original size' );
			expect( buttonView50.tooltip ).to.equal( 'Resize image to 50%' );
		} );

		it( 'should have `commandValue` equal "50%"', () => {
			const buttonView = editor.ui.componentFactory.create( 'imageResize:50' );

			expect( buttonView.commandValue ).to.equal( '50%' );
		} );

		it( 'should execute `imageResize` command with "50%" value', () => {
			const buttonView = editor.ui.componentFactory.create( 'imageResize:50' );
			const command = editor.commands.get( 'imageResize' );
			const commandSpy = sinon.spy( command, 'execute' );

			command.isEnabled = true;

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( commandSpy );
			expect( command.value.width ).to.equal( '50%' );
		} );

		it( 'should have set a proper icon', () => {
			const buttonOriginal = editor.ui.componentFactory.create( 'imageResize:original' );
			const button25 = editor.ui.componentFactory.create( 'imageResize:25' );
			const button50 = editor.ui.componentFactory.create( 'imageResize:50' );
			const button75 = editor.ui.componentFactory.create( 'imageResize:75' );

			expect( buttonOriginal.icon ).to.deep.equal( iconFull );
			expect( button25.icon ).to.deep.equal( iconSmall );
			expect( button50.icon ).to.deep.equal( iconMedium );
			expect( button75.icon ).to.deep.equal( iconLarge );
		} );

		it( 'should throw the CKEditorError if no `icon` is provided', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeUI ],
					image: {
						resizeUnit: '%',
						resizeOptions: [ {
							name: 'imageResize:noicon',
							value: '100'
						} ],
						toolbar: [ 'imageResize:noicon' ]
					}
				} );

			const errMsg = 'The resize option "imageResize:noicon" misses an `icon` property ' +
				'or its value doesn\'t match the available options.';

			expectToThrowCKEditorError( () => {
				editor.ui.componentFactory.create( 'imageResize:noicon' );
			}, errMsg );

			editor.destroy();
		} );
	} );
} );
