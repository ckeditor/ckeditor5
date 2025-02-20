/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import TableEditing from '../../src/tableediting.js';
import TableLayoutUI from '../../src/tablelayout/tablelayoutui.js';
import InsertTableView from '../../src/ui/inserttableview.js';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview.js';
import { IconTableLayout } from '@ckeditor/ckeditor5-icons';

describe( 'TableLayoutUI', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ TableEditing, TableLayoutUI ]
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
} );
