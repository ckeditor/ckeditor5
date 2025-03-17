/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { ListItemView } from '@ckeditor/ckeditor5-ui';
import TableEditing from '../../src/tableediting.js';
import TableLayoutUI from '../../src/tablelayout/tablelayoutui.js';
import TableLayoutEditing from '../../src/tablelayout/tablelayoutediting.js';
import InsertTableView from '../../src/ui/inserttableview.js';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview.js';
import { IconTableLayout, IconTableProperties } from '@ckeditor/ckeditor5-icons';
import TableProperties from '../../src/tableproperties.js';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview.js';
import TableTypeCommand from '../../src/tablelayout/commands/tabletypecommand.js';
import TableUI from '../../src/tableui.js';

describe( 'TableLayoutUI', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ TableEditing, TableLayoutUI, TableLayoutEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableLayoutUI.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableLayoutUI.isPremiumPlugin ).to.be.false;
	} );

	describe( 'insertTableLayout dropdown', () => {
		let insertTableLayout;

		beforeEach( () => {
			insertTableLayout = editor.ui.componentFactory.create( 'insertTableLayout' );
			insertTableLayout.render();

			document.body.appendChild( insertTableLayout.element );

			// Dropdown is lazy loaded, so make sure it's open. See https://github.com/ckeditor/ckeditor5/issues/6193.
			insertTableLayout.isOpen = true;
		} );

		afterEach( () => {
			insertTableLayout.element.remove();
		} );

		it( 'should register insertTableLayout button', () => {
			expect( insertTableLayout ).to.be.instanceOf( DropdownView );
			expect( insertTableLayout.buttonView.label ).to.equal( 'Insert table layout' );
			expect( insertTableLayout.buttonView.icon ).to.equal( IconTableLayout );
		} );

		it( 'should bind to insertTableLayout command', () => {
			const command = editor.commands.get( 'insertTableLayout' );

			command.isEnabled = true;
			expect( insertTableLayout.buttonView.isOn ).to.be.true;
			expect( insertTableLayout.buttonView.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( insertTableLayout.buttonView.isEnabled ).to.be.false;
		} );

		it( 'should execute insertTableLayout command on button execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			const tableSizeView = insertTableLayout.panelView.children.first;

			tableSizeView.rows = 2;
			tableSizeView.columns = 7;

			insertTableLayout.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'insertTableLayout', { rows: 2, columns: 7 } );
		} );

		it( 'is not fully initialized until open', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertTableLayout' );

			for ( const childView of dropdown.panelView.children ) {
				expect( childView ).not.to.be.instanceOf( InsertTableView );
			}
		} );

		describe( 'on open', () => {
			let insertTableLayout;

			beforeEach( () => {
				insertTableLayout = editor.ui.componentFactory.create( 'insertTableLayout' );

				insertTableLayout.render();
				document.body.appendChild( insertTableLayout.element );

				insertTableLayout.isOpen = true; // Dropdown is lazy loaded (#6193).
				insertTableLayout.isOpen = false;
			} );

			afterEach( () => {
				insertTableLayout.element.remove();
				insertTableLayout.destroy();
			} );

			it( 'should focus the first tile in the grid', () => {
				const spy = sinon.spy( insertTableLayout.panelView.children.first.items.first, 'focus' );

				insertTableLayout.buttonView.fire( 'open' );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'menuBar:insertTableLayout menu bar menu', () => {
		let menuView;

		beforeEach( () => {
			menuView = editor.ui.componentFactory.create( 'menuBar:insertTableLayout' );
			menuView.render();

			document.body.appendChild( menuView.element );

			menuView.isOpen = true;
		} );

		afterEach( () => {
			menuView.element.remove();
		} );

		it( 'should set properties on a button', () => {
			expect( menuView.buttonView.label ).to.equal( 'Table layout' );
			expect( menuView.buttonView.icon ).to.equal( IconTableLayout );
		} );

		it( 'should bind #isEnabled to the InsertTableLayoutCommand', () => {
			const command = editor.commands.get( 'insertTableLayout' );

			expect( menuView.isEnabled ).to.be.true;

			command.forceDisabled( 'foo' );
			expect( menuView.isEnabled ).to.be.false;

			command.clearForceDisabled( 'foo' );
			expect( menuView.isEnabled ).to.be.true;
		} );

		it( 'should render InsertTableView', () => {
			expect( menuView.panelView.children.first ).to.be.instanceOf( InsertTableView );
		} );

		it( 'should delegate #execute from InsertTableView to the MenuBarMenuView', () => {
			const spy = sinon.spy();

			menuView.on( 'execute', spy );

			menuView.panelView.children.first.fire( 'execute' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should execute the insertTableLayout command upon the #execute event and focus editing', () => {
			const command = editor.commands.get( 'insertTableLayout' );
			const commandSpy = sinon.spy( command, 'execute' );
			const focusSpy = sinon.spy( editor.editing.view, 'focus' );
			const insertView = menuView.panelView.children.first;

			insertView.rows = 3;
			insertView.columns = 5;

			insertView.fire( 'execute' );

			sinon.assert.calledOnceWithExactly( commandSpy, { rows: 3, columns: 5 } );
			sinon.assert.calledOnce( focusSpy );
			sinon.assert.callOrder( commandSpy, focusSpy );
		} );

		it( 'should reset column and rows selection on reopen', () => {
			const insertView = menuView.panelView.children.first;

			insertView.rows = 3;
			insertView.columns = 5;

			menuView.isOpen = false;

			expect( insertView.rows ).to.equal( 1 );
			expect( insertView.columns ).to.equal( 1 );

			menuView.isOpen = true;

			expect( insertView.rows ).to.equal( 1 );
			expect( insertView.columns ).to.equal( 1 );
		} );
	} );

	describe( 'tableProperties dropdown', () => {
		let tablePropertiesDropdown;

		beforeEach( async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableProperties, TableEditing, TableLayoutUI, TableLayoutEditing, TableUI ]
			} );

			// Register TableTypeCommand
			const command = new TableTypeCommand( editor );
			sinon.spy( command, 'execute' );
			editor.commands.add( 'tableType', command );
		} );

		afterEach( () => {
			tablePropertiesDropdown?.element.remove();

			return editor.destroy();
		} );

		it( 'should register tableProperties dropdown with a split button', () => {
			const tablePropertiesDropdown = renderTablePropertiesDropdown();

			expect( tablePropertiesDropdown.buttonView ).to.be.instanceOf( SplitButtonView );
			expect( tablePropertiesDropdown.buttonView.tooltip ).to.equal( 'Choose table type' );
		} );

		it( 'should contain layout and content table options in the dropdown', () => {
			const tablePropertiesDropdown = renderTablePropertiesDropdown();
			const items = tablePropertiesDropdown.panelView.children.first.items;

			expect( items.length ).to.equal( 2 );
			expect( [ ...items ].every( item => item instanceof ListItemView ) ).to.be.true;

			expect( items.get( 0 ).children.first.label ).to.equal( 'Table layout' );
			expect( items.get( 1 ).children.first.label ).to.equal( 'Table content' );
		} );

		it( 'should execute tableType command when an item is selected', () => {
			const tablePropertiesDropdown = renderTablePropertiesDropdown();
			const items = tablePropertiesDropdown.panelView.children.first.items;
			const command = editor.commands.get( 'tableType' );

			items.get( 0 ).children.first.fire( 'execute' );

			sinon.assert.calledOnce( command.execute );
			sinon.assert.calledWithExactly( command.execute, 'layout' );

			command.execute.resetHistory();

			items.get( 1 ).children.first.fire( 'execute' );

			sinon.assert.calledOnce( command.execute );
			sinon.assert.calledWithExactly( command.execute, 'content' );
		} );

		it( 'should bind list items to the tableType command state', () => {
			const tablePropertiesDropdown = renderTablePropertiesDropdown();
			const items = tablePropertiesDropdown.panelView.children.first.items;
			const command = editor.commands.get( 'tableType' );

			// Test isOn binding.
			command.value = 'layout';
			expect( items.get( 0 ).children.first.isOn ).to.be.true;
			expect( items.get( 1 ).children.first.isOn ).to.be.false;

			command.value = 'content';
			expect( items.get( 0 ).children.first.isOn ).to.be.false;
			expect( items.get( 1 ).children.first.isOn ).to.be.true;

			// Test isEnabled binding.
			command.isEnabled = false;
			expect( items.get( 0 ).children.first.isEnabled ).to.be.false;
			expect( items.get( 1 ).children.first.isEnabled ).to.be.false;

			command.isEnabled = true;
			expect( items.get( 0 ).children.first.isEnabled ).to.be.true;
			expect( items.get( 1 ).children.first.isEnabled ).to.be.true;
		} );

		function renderTablePropertiesDropdown() {
			tablePropertiesDropdown = editor.ui.componentFactory.create( 'tableProperties' );
			tablePropertiesDropdown.render();

			document.body.appendChild( tablePropertiesDropdown.element );

			tablePropertiesDropdown.isOpen = true;
			return tablePropertiesDropdown;
		}
	} );

	describe( 'tableProperties dropdown without TablePropertiesUI', () => {
		let tablePropertiesDropdown;

		beforeEach( async () => {
			await editor.destroy();

			// Create editor without TableProperties plugin
			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableLayoutUI, TableLayoutEditing, TableUI ]
			} );

			// Register TableTypeCommand
			const command = new TableTypeCommand( editor );
			sinon.spy( command, 'execute' );
			editor.commands.add( 'tableType', command );
		} );

		afterEach( () => {
			tablePropertiesDropdown?.element.remove();

			return editor.destroy();
		} );

		it( 'should create a standalone button when TablePropertiesUI is not available', () => {
			const tablePropertiesDropdown = renderTablePropertiesDropdown();
			const baseButton = tablePropertiesDropdown.buttonView.actionView;

			expect( baseButton.label ).to.equal( 'Table type' );
			expect( baseButton.icon ).to.equal( IconTableProperties );
			expect( baseButton.tooltip ).to.be.true;
		} );

		it( 'should open dropdown when base button is clicked', () => {
			const tablePropertiesDropdown = renderTablePropertiesDropdown();
			const baseButton = tablePropertiesDropdown.buttonView.actionView;

			expect( tablePropertiesDropdown.isOpen ).to.be.false;

			baseButton.fire( 'execute' );

			expect( tablePropertiesDropdown.isOpen ).to.be.true;

			baseButton.fire( 'execute' );

			expect( tablePropertiesDropdown.isOpen ).to.be.false;
		} );

		it( 'should bind isOn of the base button to isOpen of the dropdown', () => {
			const tablePropertiesDropdown = renderTablePropertiesDropdown();
			const baseButton = tablePropertiesDropdown.buttonView.actionView;

			expect( baseButton.isOn ).to.be.false;

			tablePropertiesDropdown.isOpen = true;

			expect( baseButton.isOn ).to.be.true;

			tablePropertiesDropdown.isOpen = false;

			expect( baseButton.isOn ).to.be.false;
		} );

		function renderTablePropertiesDropdown() {
			tablePropertiesDropdown = editor.ui.componentFactory.create( 'tableProperties' );
			tablePropertiesDropdown.render();

			document.body.appendChild( tablePropertiesDropdown.element );

			return tablePropertiesDropdown;
		}
	} );
} );
