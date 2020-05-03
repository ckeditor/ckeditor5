/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SelectAllEditing from '../src/selectallediting';
import SelectAllUI from '../src/selectallui';

describe( 'SelectAllUI', () => {
	let editor, editorElement, button;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ SelectAllEditing, SelectAllUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				button = editor.ui.componentFactory.create( 'selectAll' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( SelectAllUI.pluginName ).to.equal( 'SelectAllUI' );
	} );

	describe( 'the "selectAll" button', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );

		it( 'should have a label', () => {
			expect( button.label ).to.equal( 'Select all' );
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).to.match( /^<svg/ );
		} );

		it( 'should have a keystroke', () => {
			expect( button.keystroke ).to.equal( 'Ctrl+A' );
		} );

		it( 'should have a tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have #isEnabled bound to the command state', () => {
			expect( button.isEnabled ).to.be.true;

			editor.commands.get( 'selectAll' ).isEnabled = false;

			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should execute the "selectAll" command and focus the editing view', () => {
			sinon.spy( editor, 'execute' );
			sinon.spy( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'selectAll' );
			sinon.assert.calledOnce( editor.editing.view.focus );
		} );
	} );
} );
