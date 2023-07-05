/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { global } from '@ckeditor/ckeditor5-utils';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

import ShowBlocksEditing from '../src/showblocksediting';
import ShowBlocksUI from '../src/showblocksui';

describe( 'ShowBlocksUI', () => {
	let editor, element, button;

	beforeEach( () => {
		element = global.document.createElement( 'div' );
		global.document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ ShowBlocksEditing, ShowBlocksUI, SourceEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				button = editor.ui.componentFactory.create( 'showBlocks' );
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( ShowBlocksUI.pluginName ).to.equal( 'ShowBlocksUI' );
	} );

	describe( 'the "showBlocks" button', () => {
		it( 'should be an instance of ButtonView', () => {
			expect( button ).to.be.instanceOf( ButtonView );
		} );

		it( 'should have a label', () => {
			expect( button.label ).to.equal( 'Show blocks' );
		} );

		it( 'should have an icon', () => {
			expect( button.icon ).to.match( /^<svg/ );
		} );

		it( 'should have a tooltip', () => {
			expect( button.tooltip ).to.be.true;
		} );

		it( 'should have #isEnabled bound to the command isEnabled', () => {
			expect( button.isEnabled ).to.be.true;

			editor.commands.get( 'showBlocks' ).isEnabled = false;

			expect( button.isEnabled ).to.be.false;
		} );

		it( 'should have #isOn bound to the command value', () => {
			editor.commands.get( 'showBlocks' ).value = false;

			expect( button.isOn ).to.be.false;

			editor.commands.get( 'showBlocks' ).value = true;

			expect( button.isOn ).to.be.true;
		} );

		it( 'should have #isOn bound to the mode of SourceEditing plugin', async () => {
			editor.commands.get( 'showBlocks' ).value = true;

			editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = true;

			expect( button.isOn ).to.be.false;

			editor.plugins.get( 'SourceEditing' ).isSourceEditingMode = false;

			expect( button.isOn ).to.be.true;
		} );

		it( 'should execute the "showBlocks" command and focus the editing view', () => {
			sinon.spy( editor, 'execute' );
			sinon.spy( editor.editing.view, 'focus' );

			button.fire( 'execute' );

			sinon.assert.calledOnce( editor.execute );
			sinon.assert.calledWithExactly( editor.execute, 'showBlocks' );
			sinon.assert.calledOnce( editor.editing.view.focus );
		} );
	} );
} );
