/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { SelectAllEditing } from '../src/selectallediting.js';
import { SelectAllCommand } from '../src/selectallcommand.js';
import { env, keyCodes } from '@ckeditor/ckeditor5-utils';

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

				vi.spyOn( editor, 'execute' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have a name', () => {
		expect( SelectAllEditing.pluginName ).toBe( 'SelectAllEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SelectAllEditing.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SelectAllEditing.isPremiumPlugin ).toBe( false );
	} );

	it( 'should add keystroke accessibility info', () => {
		expect( editor.accessibility.keystrokeInfos.get( 'contentEditing' ).groups.get( 'common' ).keystrokes ).toContainEqual( {
			label: 'Select all',
			keystroke: 'CTRL+A'
		} );
	} );

	it( 'should register the "selectAll" command', () => {
		const command = editor.commands.get( 'selectAll' );

		expect( command ).toBeInstanceOf( SelectAllCommand );
	} );

	describe( 'Ctrl+A keystroke listener', () => {
		it( 'should execute the "selectAll" command', () => {
			const domEventDataMock = {
				keyCode: keyCodes.a,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: vi.fn()
			};

			viewDocument.fire( 'keydown', domEventDataMock );

			expect( editor.execute ).toHaveBeenCalledTimes( 1 );
			expect( editor.execute ).toHaveBeenCalledWith( 'selectAll' );
		} );

		it( 'should prevent the default action', () => {
			const domEventDataMock = {
				keyCode: keyCodes.a,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: vi.fn()
			};

			viewDocument.fire( 'keydown', domEventDataMock );

			expect( domEventDataMock.preventDefault ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not react to other keystrokes', () => {
			const domEventDataMock = {
				keyCode: keyCodes.x,
				ctrlKey: !env.isMac,
				metaKey: env.isMac,
				preventDefault: vi.fn()
			};

			viewDocument.fire( 'keydown', domEventDataMock );

			expect( editor.execute ).not.toHaveBeenCalled();
			expect( domEventDataMock.preventDefault ).not.toHaveBeenCalled();
		} );
	} );
} );
