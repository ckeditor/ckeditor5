/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import TableEditing from '../src/tableediting';
import TableUI from '../src/tableui';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { _clear as clearTranslations, add as addTranslations } from '@ckeditor/ckeditor5-utils/src/translation-service';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

testUtils.createSinonSandbox();

describe( 'TableUI', () => {
	let editor, element, insertTable;

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

				insertTable = editor.ui.componentFactory.create( 'insertTable' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'insertTable button', () => {
		it( 'should register insertTable buton', () => {
			expect( insertTable ).to.be.instanceOf( ButtonView );
			expect( insertTable.isOn ).to.be.false;
			expect( insertTable.label ).to.equal( 'Insert table' );
			expect( insertTable.icon ).to.match( /<svg / );
		} );

		it( 'should bind to insertTable command', () => {
			const command = editor.commands.get( 'insertTable' );

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
} );
