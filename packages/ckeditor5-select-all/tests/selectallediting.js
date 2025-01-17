/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import SelectAllEditing from '../src/selectallediting.js';
import SelectAllCommand from '../src/selectallcommand.js';
import env from '@ckeditor/ckeditor5-utils/src/env.js';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard.js';

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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SelectAllEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SelectAllEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).to.deep.include( {
			label: 'Select all',
			keystroke: 'CTRL+A'
		} );
	} );

	it( 'should register the "selectAll" command', () => {
		const command = editor.commands.get( 'selectAll' );

		expect( command ).to.be.instanceOf( SelectAllCommand );
	} );

	describe( 'Ctrl+A keystroke listener', () => {
		it( 'should execute the "selectAll" command', () => {
			const domEventDataMock = {
				keyCode: keyCodes.a,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy()
			};

			viewDocument.fire( 'keydown', domEventDataMock );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'selectAll' );
		} );

		it( 'should prevent the default action', () => {
			const domEventDataMock = {
				keyCode: keyCodes.a,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy()
			};

			viewDocument.fire( 'keydown', domEventDataMock );

			sinon.assert.calledOnce( domEventDataMock.preventDefault );
		} );

		it( 'should not react to other keystrokes', () => {
			const domEventDataMock = {
				keyCode: keyCodes.x,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: sinon.spy()
			};

			viewDocument.fire( 'keydown', domEventDataMock );

			sinon.assert.notCalled( editor.execute );
			sinon.assert.notCalled( domEventDataMock.preventDefault );
		} );
	} );
} );
