/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import { ListItemView, DropdownView, SplitButtonView } from '@ckeditor/ckeditor5-ui';
import { TableEditing } from '../../src/tableediting.js';
import { TableLayoutUI } from '../../src/tablelayout/tablelayoutui.js';
import { TableLayoutEditing } from '../../src/tablelayout/tablelayoutediting.js';
import { InsertTableView } from '../../src/ui/inserttableview.js';
import { IconTableLayout, IconTableProperties } from '@ckeditor/ckeditor5-icons';
import { TableProperties } from '../../src/tableproperties.js';
import { TableTypeCommand } from '../../src/tablelayout/commands/tabletypecommand.js';
import { TableUI } from '../../src/tableui.js';

describe( 'TableLayoutUI', () => {
	let editor, element;

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ TableEditing, TableLayoutUI, TableLayoutEditing, Paragraph ]
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
		expect( TableLayoutUI.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableLayoutUI.isPremiumPlugin ).toBe( false );
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
			expect( insertTableLayout ).toBeInstanceOf( DropdownView );
			expect( insertTableLayout.buttonView.label ).toEqual( 'Insert table layout' );
			expect( insertTableLayout.buttonView.icon ).toEqual( IconTableLayout );
		} );

		it( 'should bind to insertTableLayout command', () => {
			const command = editor.commands.get( 'insertTableLayout' );

			command.isEnabled = true;
			expect( insertTableLayout.buttonView.isOn ).toBe( true );
			expect( insertTableLayout.buttonView.isEnabled ).toBe( true );

			command.isEnabled = false;
			expect( insertTableLayout.buttonView.isEnabled ).toBe( false );
		} );

		it( 'should execute insertTableLayout command on button execute event', () => {
			const executeSpy = vi.spyOn( editor, 'execute' );

			const tableSizeView = insertTableLayout.panelView.children.first;

			tableSizeView.rows = 2;
			tableSizeView.columns = 7;

			insertTableLayout.fire( 'execute' );

			expect( executeSpy ).toHaveBeenCalledOnce();
			expect( executeSpy ).toHaveBeenCalledWith( 'insertTableLayout', { rows: 2, columns: 7 } );
		} );

		it( 'is not fully initialized until open', () => {
			const dropdown = editor.ui.componentFactory.create( 'insertTableLayout' );

			for ( const childView of dropdown.panelView.children ) {
				expect( childView ).not.toBeInstanceOf( InsertTableView );
			}
		} );

		describe( 'on open', () => {
			let insertTableLayout;

			beforeEach( () => {
				insertTableLayout = editor.ui.componentFactory.create( 'insertTableLayout' );

				insertTableLayout.render();
				document.body.appendChild( insertTableLayout.element );

				insertTableLayout.isOpen = true; // Dropdown is lazy loaded (https://github.com/ckeditor/ckeditor5/issues/6193).
				insertTableLayout.isOpen = false;
			} );

			afterEach( () => {
				insertTableLayout.element.remove();
				insertTableLayout.destroy();
			} );

			it( 'should focus the first tile in the grid', () => {
				const spy = vi.spyOn( insertTableLayout.panelView.children.first.items.first, 'focus' );

				insertTableLayout.buttonView.fire( 'open' );

				expect( spy ).toHaveBeenCalledOnce();
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
			expect( menuView.buttonView.label ).toEqual( 'Table layout' );
			expect( menuView.buttonView.icon ).toEqual( IconTableLayout );
		} );

		it( 'should bind #isEnabled to the InsertTableLayoutCommand', () => {
			const command = editor.commands.get( 'insertTableLayout' );

			expect( menuView.isEnabled ).toBe( true );

			command.forceDisabled( 'foo' );
			expect( menuView.isEnabled ).toBe( false );

			command.clearForceDisabled( 'foo' );
			expect( menuView.isEnabled ).toBe( true );
		} );

		it( 'should render InsertTableView', () => {
			expect( menuView.panelView.children.first ).toBeInstanceOf( InsertTableView );
		} );

		it( 'should delegate #execute from InsertTableView to the MenuBarMenuView', () => {
			const spy = vi.fn();

			menuView.on( 'execute', spy );

			menuView.panelView.children.first.fire( 'execute' );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should execute the insertTableLayout command upon the #execute event and focus editing', () => {
			const command = editor.commands.get( 'insertTableLayout' );
			const commandSpy = vi.spyOn( command, 'execute' );
			const focusSpy = vi.spyOn( editor.editing.view, 'focus' );
			const insertView = menuView.panelView.children.first;

			insertView.rows = 3;
			insertView.columns = 5;

			insertView.fire( 'execute' );

			expect( commandSpy ).toHaveBeenCalledOnce();
			expect( commandSpy ).toHaveBeenCalledWith( { rows: 3, columns: 5 } );
			expect( focusSpy ).toHaveBeenCalledOnce();
			expect( commandSpy.mock.invocationCallOrder[ 0 ] ).toBeLessThan( focusSpy.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'should reset column and rows selection on reopen', () => {
			const insertView = menuView.panelView.children.first;

			insertView.rows = 3;
			insertView.columns = 5;

			menuView.isOpen = false;

			expect( insertView.rows ).toEqual( 1 );
			expect( insertView.columns ).toEqual( 1 );

			menuView.isOpen = true;

			expect( insertView.rows ).toEqual( 1 );
			expect( insertView.columns ).toEqual( 1 );
		} );
	} );

	describe( 'tableProperties dropdown extending', () => {
		let tablePropertiesDropdown;

		beforeEach( async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableProperties, TableEditing, TableLayoutUI, TableLayoutEditing, TableUI ]
			} );

			// Register TableTypeCommand
			const command = new TableTypeCommand( editor );
			vi.spyOn( command, 'execute' );
			editor.commands.add( 'tableType', command );

			// Render dropdown.
			tablePropertiesDropdown = editor.ui.componentFactory.create( 'tableProperties' );
			tablePropertiesDropdown.render();

			document.body.appendChild( tablePropertiesDropdown.element );

			tablePropertiesDropdown.isOpen = true;
		} );

		afterEach( () => {
			tablePropertiesDropdown?.element.remove();

			return editor.destroy();
		} );

		it( 'should register tableProperties dropdown with a split button', () => {
			expect( tablePropertiesDropdown.buttonView ).toBeInstanceOf( SplitButtonView );
			expect( tablePropertiesDropdown.buttonView.tooltip ).toEqual( 'Choose table type' );
		} );

		it( 'should contain layout and content table options in the dropdown', () => {
			const items = tablePropertiesDropdown.panelView.children.first.items;

			expect( items.length ).toEqual( 2 );
			expect( [ ...items ].every( item => item instanceof ListItemView ) ).toBe( true );

			expect( items.get( 0 ).children.first.label ).toEqual( 'Layout table' );
			expect( items.get( 1 ).children.first.label ).toEqual( 'Content table' );
		} );

		it( 'should execute tableType command when an item is selected', () => {
			const items = tablePropertiesDropdown.panelView.children.first.items;
			const command = editor.commands.get( 'tableType' );

			items.get( 0 ).children.first.fire( 'execute' );

			expect( command.execute ).toHaveBeenCalledOnce();
			expect( command.execute ).toHaveBeenCalledWith( 'layout' );

			command.execute.mockClear();

			items.get( 1 ).children.first.fire( 'execute' );

			expect( command.execute ).toHaveBeenCalledOnce();
			expect( command.execute ).toHaveBeenCalledWith( 'content' );
		} );

		it( 'should bind list items to the tableType command state', () => {
			const items = tablePropertiesDropdown.panelView.children.first.items;
			const command = editor.commands.get( 'tableType' );

			// Test isOn binding.
			command.value = 'layout';
			expect( items.get( 0 ).children.first.isOn ).toBe( true );
			expect( items.get( 1 ).children.first.isOn ).toBe( false );

			command.value = 'content';
			expect( items.get( 0 ).children.first.isOn ).toBe( false );
			expect( items.get( 1 ).children.first.isOn ).toBe( true );

			// Test isEnabled binding.
			command.isEnabled = false;
			expect( items.get( 0 ).children.first.isEnabled ).toBe( false );
			expect( items.get( 1 ).children.first.isEnabled ).toBe( false );

			command.isEnabled = true;
			expect( items.get( 0 ).children.first.isEnabled ).toBe( true );
			expect( items.get( 1 ).children.first.isEnabled ).toBe( true );
		} );

		it( 'should not register tableProperties if TablePropertiesUI is not present', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableLayoutUI, TableLayoutEditing ]
			} );

			const dropdown = editor.ui.componentFactory.has( 'tableProperties' );

			expect( dropdown ).toBe( false );
		} );
	} );

	describe( 'tableType dropdown', () => {
		let dropdown;

		beforeEach( async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( element, {
				plugins: [ TableEditing, TableLayoutUI, TableLayoutEditing, TableUI ]
			} );

			const command = new TableTypeCommand( editor );
			vi.spyOn( command, 'execute' );
			editor.commands.add( 'tableType', command );

			dropdown = editor.ui.componentFactory.create( 'tableType' );
			dropdown.render();
			document.body.appendChild( dropdown.element );
		} );

		afterEach( () => {
			dropdown?.element.remove();

			return editor.destroy();
		} );

		it( 'should create DropdownView', () => {
			expect( dropdown ).toBeInstanceOf( DropdownView );
		} );

		it( 'should create a button with proper attributes', () => {
			expect( dropdown.buttonView.label ).toEqual( 'Table type' );
			expect( dropdown.buttonView.icon ).toEqual( IconTableProperties );
			expect( dropdown.buttonView.tooltip ).toEqual( 'Choose table type' );
		} );

		it( 'should open dropdown when base button is clicked', () => {
			expect( dropdown.isOpen ).toBe( false );

			dropdown.buttonView.fire( 'execute' );

			expect( dropdown.isOpen ).toBe( true );

			dropdown.buttonView.fire( 'execute' );

			expect( dropdown.isOpen ).toBe( false );
		} );

		it( 'should contain layout and content table options in the dropdown', () => {
			dropdown.isOpen = true;

			const items = dropdown.panelView.children.first.items;

			expect( items.length ).toEqual( 2 );
			expect( [ ...items ].every( item => item instanceof ListItemView ) ).toBe( true );

			expect( items.get( 0 ).children.first.label ).toEqual( 'Layout table' );
			expect( items.get( 1 ).children.first.label ).toEqual( 'Content table' );
		} );

		it( 'should execute tableType command when an item is selected', () => {
			dropdown.isOpen = true;

			const items = dropdown.panelView.children.first.items;
			const command = editor.commands.get( 'tableType' );

			items.get( 0 ).children.first.fire( 'execute' );

			expect( command.execute ).toHaveBeenCalledOnce();
			expect( command.execute ).toHaveBeenCalledWith( 'layout' );

			command.execute.mockClear();

			items.get( 1 ).children.first.fire( 'execute' );

			expect( command.execute ).toHaveBeenCalledOnce();
			expect( command.execute ).toHaveBeenCalledWith( 'content' );
		} );

		it( 'should bind list items to the tableType command state', () => {
			dropdown.isOpen = true;

			const items = dropdown.panelView.children.first.items;
			const command = editor.commands.get( 'tableType' );

			// Test isOn binding.
			command.value = 'layout';
			expect( items.get( 0 ).children.first.isOn ).toBe( true );
			expect( items.get( 1 ).children.first.isOn ).toBe( false );

			command.value = 'content';
			expect( items.get( 0 ).children.first.isOn ).toBe( false );
			expect( items.get( 1 ).children.first.isOn ).toBe( true );

			// Test isEnabled binding.
			command.isEnabled = false;
			expect( items.get( 0 ).children.first.isEnabled ).toBe( false );
			expect( items.get( 1 ).children.first.isEnabled ).toBe( false );

			command.isEnabled = true;
			expect( items.get( 0 ).children.first.isEnabled ).toBe( true );
			expect( items.get( 1 ).children.first.isEnabled ).toBe( true );
		} );
	} );
} );
