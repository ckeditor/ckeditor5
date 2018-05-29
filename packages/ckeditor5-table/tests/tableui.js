/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import TableEditing from '../src/tableediting';
import TableUI from '../src/tableui';

testUtils.createSinonSandbox();

describe( 'TableUI', () => {
	let editor, element;

	before( () => {
		addTranslations( 'en', {} );
		addTranslations( 'pl', {} );
	} );

	after( () => {
		clearTranslations();
	} );

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ TableEditing, TableUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'insertTable button', () => {
		let insertTable;

		beforeEach( () => {
			insertTable = editor.ui.componentFactory.create( 'insertTable' );
		} );

		it( 'should register insertTable buton', () => {
			expect( insertTable ).to.be.instanceOf( ButtonView );
			expect( insertTable.isOn ).to.be.false;
			expect( insertTable.label ).to.equal( 'Insert table' );
			expect( insertTable.icon ).to.match( /<svg / );
		} );

		it( 'should bind to insertTable command', () => {
			const command = editor.commands.get( 'insertTable' );

			command.isEnabled = true;
			expect( insertTable.isOn ).to.be.false;
			expect( insertTable.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( insertTable.isEnabled ).to.be.false;
		} );

		it( 'should execute insertTable command on button execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			insertTable.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'insertTable' );
		} );
	} );

	describe( 'insertRowBelow button', () => {
		let insertRow;

		beforeEach( () => {
			insertRow = editor.ui.componentFactory.create( 'insertRowBelow' );
		} );

		it( 'should register insertRowBelow button', () => {
			expect( insertRow ).to.be.instanceOf( ButtonView );
			expect( insertRow.isOn ).to.be.false;
			expect( insertRow.label ).to.equal( 'Insert row' );
			expect( insertRow.icon ).to.match( /<svg / );
		} );

		it( 'should bind to insertRow command', () => {
			const command = editor.commands.get( 'insertRowBelow' );

			command.isEnabled = true;
			expect( insertRow.isOn ).to.be.false;
			expect( insertRow.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( insertRow.isEnabled ).to.be.false;
		} );

		it( 'should execute insertRow command on button execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			insertRow.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'insertRowBelow' );
		} );
	} );

	describe( 'insertColumnAfter button', () => {
		let insertColumn;

		beforeEach( () => {
			insertColumn = editor.ui.componentFactory.create( 'insertColumnAfter' );
		} );

		it( 'should register insertColumn buton', () => {
			expect( insertColumn ).to.be.instanceOf( ButtonView );
			expect( insertColumn.isOn ).to.be.false;
			expect( insertColumn.label ).to.equal( 'Insert column' );
			expect( insertColumn.icon ).to.match( /<svg / );
		} );

		it( 'should bind to insertColumn command', () => {
			const command = editor.commands.get( 'insertColumnAfter' );

			command.isEnabled = true;
			expect( insertColumn.isOn ).to.be.false;
			expect( insertColumn.isEnabled ).to.be.true;

			command.isEnabled = false;
			expect( insertColumn.isEnabled ).to.be.false;
		} );

		it( 'should execute insertColumn command on button execute event', () => {
			const executeSpy = testUtils.sinon.spy( editor, 'execute' );

			insertColumn.fire( 'execute' );

			sinon.assert.calledOnce( executeSpy );
			sinon.assert.calledWithExactly( executeSpy, 'insertColumnAfter' );
		} );
	} );
} );
