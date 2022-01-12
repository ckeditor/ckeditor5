/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Image from '../../src/image';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import ImageResizeButtons from '../../src/imageresize/imageresizebuttons';
import ImageStyle from '../../src/imagestyle';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Table from '@ckeditor/ckeditor5-table/src/table';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';

import iconSmall from '@ckeditor/ckeditor5-core/theme/icons/object-size-small.svg';
import iconMedium from '@ckeditor/ckeditor5-core/theme/icons/object-size-medium.svg';
import iconLarge from '@ckeditor/ckeditor5-core/theme/icons/object-size-large.svg';
import iconFull from '@ckeditor/ckeditor5-core/theme/icons/object-size-full.svg';

describe( 'ImageResizeButtons', () => {
	let plugin, command, editor, editorElement;

	const resizeOptions = [ {
		name: 'resizeImage:original',
		value: null
	},
	{
		name: 'resizeImage:25',
		value: '25'
	},
	{
		name: 'resizeImage:50',
		value: '50'
	},
	{
		name: 'resizeImage:75',
		value: '75'
	} ];

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor
			.create( editorElement, {
				plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeButtons ],
				image: {
					resizeOptions
				}
			} );

		command = editor.commands.get( 'resizeImage' );
		plugin = editor.plugins.get( 'ImageResizeButtons' );
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
			expect( ImageResizeButtons.pluginName ).to.equal( 'ImageResizeButtons' );
		} );
	} );

	describe( 'constructor()', () => {
		it( 'should create `_resizeUnit` with default value of `%`', () => {
			const unit = plugin._resizeUnit;

			expect( unit ).to.equal( '%' );
		} );
	} );

	describe( 'init()', () => {
		it( 'should be disabled when command is disabled', () => {
			command.isEnabled = true;

			expect( plugin.isEnabled ).to.be.true;

			command.isEnabled = false;

			expect( plugin.isEnabled ).to.be.false;
		} );
	} );

	describe( 'resize options dropdown', () => {
		it( 'should be disabled when plugin is disabled', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );

			plugin.isEnabled = true;

			expect( dropdownView.isEnabled ).to.be.true;

			plugin.isEnabled = false;

			expect( dropdownView.isEnabled ).to.be.false;
		} );

		it( 'should be an instance of `DropdownView` if component is created without a value suffix', () => {
			expect( editor.ui.componentFactory.create( 'resizeImage' ) ).to.be.instanceof( DropdownView );
		} );

		it( 'should register `imageResize dropdown as an alias for the `resizeImage` dropdown', () => {
			const dropdownCreator = editor.ui.componentFactory._components.get( 'resizeImage'.toLowerCase() );
			const dropdownAliasCreator = editor.ui.componentFactory._components.get( 'imageResize'.toLowerCase() );

			expect( dropdownCreator.callback ).to.equal( dropdownAliasCreator.callback );
		} );

		it( 'should have 4 resize options in the `resizeImage` dropdown', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );

			expect( dropdownView.listView.items.length ).to.equal( 4 );
			expect( dropdownView.listView.items.first.element.textContent ).to.equal( 'Original' );
			expect( dropdownView.listView.items._items[ 1 ].element.textContent ).to.equal( '25%' );
			expect( dropdownView.listView.items.last.element.textContent ).to.equal( '75%' );
		} );

		it( 'should be created with a proper tooltip', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );

			expect( dropdownView.buttonView.tooltip ).to.equal( 'Resize image' );
		} );

		it( 'should execute resize command with a proper value', () => {
			const dropdownView = editor.ui.componentFactory.create( 'resizeImage' );
			const commandSpy = sinon.spy( command, 'execute' );
			const resizeBy50Percent = dropdownView.listView.items._items[ 1 ].children._items[ 0 ];

			command.isEnabled = true;

			resizeBy50Percent.fire( 'execute' );

			sinon.assert.calledOnce( commandSpy );
			expect( command.value.width ).to.equal( '25%' );
		} );
	} );

	describe( 'resize option button', () => {
		let editor, plugin;

		beforeEach( async () => {
			editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeButtons ],
					image: {
						resizeUnit: '%',
						resizeOptions: [ {
							name: 'resizeImage:original',
							value: null,
							icon: 'original'
						},
						{
							name: 'resizeImage:25',
							value: '25',
							icon: 'small'
						},
						{
							name: 'resizeImage:50',
							value: '50',
							icon: 'medium'
						},
						{
							name: 'resizeImage:75',
							value: '75',
							icon: 'large'
						} ],
						toolbar: [ 'resizeImage:original', 'resizeImage:25', 'resizeImage:50', 'resizeImage:75' ]
					}
				} );

			plugin = editor.plugins.get( 'ImageResizeButtons' );
		} );

		afterEach( async () => {
			if ( editorElement ) {
				editorElement.remove();
			}

			if ( editor ) {
				await editor.destroy();
			}
		} );

		it( 'should be bound to `#isEnabled`', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeImage:50' );

			plugin.isEnabled = true;

			expect( buttonView.isEnabled ).to.be.true;

			plugin.isEnabled = false;

			expect( buttonView.isEnabled ).to.be.false;
		} );

		it( 'should be an instance of `ButtonView` if component is created with a value suffix', () => {
			expect( editor.ui.componentFactory.create( 'resizeImage:50' ) ).to.be.instanceof( ButtonView );
		} );

		it( 'should be created with invisible "Resize image: 30%" label when is provided', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeButtons ],
					image: {
						resizeUnit: '%',
						resizeOptions: [ {
							name: 'resizeImage:30',
							value: '30',
							label: 'Resize image: 30%',
							icon: 'small'
						} ],
						toolbar: [ 'resizeImage:30' ]
					}
				} );

			const buttonView = editor.ui.componentFactory.create( 'resizeImage:30' );
			buttonView.render();

			expect( buttonView.withText ).to.be.false;
			expect( buttonView.label ).to.equal( 'Resize image: 30%' );
			expect( buttonView.labelView ).to.be.instanceOf( View );

			editor.destroy();
		} );

		it( 'should be created with invisible "Resize image to 50%" label when is not provided', async () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeImage:50' );
			buttonView.render();

			expect( buttonView.withText ).to.be.false;
			expect( buttonView.label ).to.equal( 'Resize image to 50%' );
			expect( buttonView.labelView ).to.be.instanceOf( View );

			editor.destroy();
		} );

		it( 'should be created with a proper tooltip, depends on the set value', () => {
			const buttonViewOriginal = editor.ui.componentFactory.create( 'resizeImage:original' );
			const buttonView50 = editor.ui.componentFactory.create( 'resizeImage:50' );

			buttonViewOriginal.render();
			buttonView50.render();

			expect( buttonViewOriginal.tooltip ).to.equal( 'Resize image to the original size' );
			expect( buttonView50.tooltip ).to.equal( 'Resize image to 50%' );
		} );

		it( 'should execute `resizeImage` command with "50%" value', () => {
			const buttonView = editor.ui.componentFactory.create( 'resizeImage:50' );
			const command = editor.commands.get( 'resizeImage' );
			const commandSpy = sinon.spy( command, 'execute' );

			command.isEnabled = true;

			buttonView.fire( 'execute' );

			sinon.assert.calledOnce( commandSpy );
			expect( command.value.width ).to.equal( '50%' );
		} );

		it( 'should have set a proper icon', () => {
			const buttonOriginal = editor.ui.componentFactory.create( 'resizeImage:original' );
			const button25 = editor.ui.componentFactory.create( 'resizeImage:25' );
			const button50 = editor.ui.componentFactory.create( 'resizeImage:50' );
			const button75 = editor.ui.componentFactory.create( 'resizeImage:75' );

			expect( buttonOriginal.icon ).to.deep.equal( iconFull );
			expect( button25.icon ).to.deep.equal( iconSmall );
			expect( button50.icon ).to.deep.equal( iconMedium );
			expect( button75.icon ).to.deep.equal( iconLarge );
		} );

		it( 'should throw the CKEditorError if no `icon` is provided', async () => {
			const editor = await ClassicTestEditor
				.create( editorElement, {
					plugins: [ Image, ImageStyle, Paragraph, Undo, Table, ImageResizeButtons ],
					image: {
						resizeUnit: '%',
						resizeOptions: [ {
							name: 'resizeImage:noicon',
							value: '100'
						} ],
						toolbar: [ 'resizeImage:noicon' ]
					}
				} );

			expectToThrowCKEditorError( () => {
				editor.ui.componentFactory.create( 'resizeImage:noicon' );
			}, 'imageresizebuttons-missing-icon', editor );

			editor.destroy();
		} );
	} );
} );
