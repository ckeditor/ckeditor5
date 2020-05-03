/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import SelectAllEditing from '../src/selectallediting';
import SelectAllCommand from '../src/selectallcommand';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'SelectAllEditing', () => {
	let editor, viewDocument;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ SelectAllEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;

				sinon.spy( editor, 'execute' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( SelectAllEditing.pluginName ).to.equal( 'SelectAllEditing' );
	} );

	it( 'should register the "selectAll" command', () => {
		const command = editor.commands.get( 'selectAll' );

		expect( command ).to.be.instanceOf( SelectAllCommand );
	} );

	describe( 'Ctrl+A keystroke listener', () => {
		it( 'should execute the "selectAll" command', () => {
			const domEventDataMock = {
				keyCode: keyCodes.a,
				ctrlKey: true,
				preventDefault: sinon.spy()
			};

			viewDocument.fire( 'keydown', domEventDataMock );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'selectAll' );
		} );

		it( 'should prevent the default action', () => {
			const domEventDataMock = {
				keyCode: keyCodes.a,
				ctrlKey: true,
				preventDefault: sinon.spy()
			};

			viewDocument.fire( 'keydown', domEventDataMock );

			sinon.assert.calledOnce( domEventDataMock.preventDefault );
		} );

		it( 'should not react to other keystrokes', () => {
			const domEventDataMock = {
				keyCode: keyCodes.x,
				ctrlKey: true,
				preventDefault: sinon.spy()
			};

			viewDocument.fire( 'keydown', domEventDataMock );

			sinon.assert.notCalled( editor.execute );
			sinon.assert.notCalled( domEventDataMock.preventDefault );
		} );
	} );
} );
