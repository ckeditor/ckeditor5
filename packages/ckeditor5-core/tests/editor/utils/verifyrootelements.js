/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Editor } from '../../../src/editor/editor.js';
import { verifyRootElements } from '../../../src/editor/utils/verifyrootelements.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'verifyRootElements()', () => {
	class TestEditor extends Editor {}

	it( 'should throw if a root element is not a limit element', () => {
		const editor = new TestEditor();

		editor.model.schema.register( 'nonLimit', { isBlock: true } );
		editor.model.document.createRoot( 'nonLimit', 'main' );

		expectToThrowCKEditorError( () => verifyRootElements( editor ), /editor-root-element-is-not-limit/ );

		editor.fire( 'ready' );
		return editor.destroy();
	} );

	it( 'should not throw if a root element is a limit element', () => {
		const editor = new TestEditor();

		editor.model.document.createRoot( '$root', 'main' );

		verifyRootElements( editor );

		editor.fire( 'ready' );
		return editor.destroy();
	} );

	it( 'should verify roots that are not yet loaded', () => {
		const editor = new TestEditor();

		editor.model.schema.register( 'nonLimit', { isBlock: true } );

		const root = editor.model.document.createRoot( 'nonLimit', 'main' );
		root._isLoaded = false;

		expectToThrowCKEditorError( () => verifyRootElements( editor ), /editor-root-element-is-not-limit/ );

		editor.fire( 'ready' );
		return editor.destroy();
	} );

	it( 'should skip detached roots', () => {
		const editor = new TestEditor();

		editor.model.schema.register( 'nonLimit', { isBlock: true } );

		const root = editor.model.document.createRoot( 'nonLimit', 'main' );
		root._isAttached = false;

		verifyRootElements( editor );

		editor.fire( 'ready' );
		return editor.destroy();
	} );

	it( 'should not throw if all roots are limit elements', () => {
		const editor = new TestEditor();

		editor.model.document.createRoot( '$root', 'main' );
		editor.model.document.createRoot( '$root', 'secondRoot' );
		editor.model.document.createRoot( '$root', 'thirdRoot' );

		verifyRootElements( editor );

		editor.fire( 'ready' );
		return editor.destroy();
	} );

	it( 'should throw if any root element is not a limit element', () => {
		const editor = new TestEditor();

		editor.model.schema.register( 'nonLimit', { isBlock: true } );

		editor.model.document.createRoot( '$root', 'main' );
		editor.model.document.createRoot( 'nonLimit', 'secondRoot' );
		editor.model.document.createRoot( '$root', 'thirdRoot' );

		expectToThrowCKEditorError( () => verifyRootElements( editor ), /editor-root-element-is-not-limit/ );

		editor.fire( 'ready' );
		return editor.destroy();
	} );

	it( 'should report the offending root name and element name in the thrown error', () => {
		const editor = new TestEditor();

		editor.model.schema.register( 'nonLimit', { isBlock: true } );

		editor.model.document.createRoot( '$root', 'main' );
		editor.model.document.createRoot( 'nonLimit', 'secondRoot' );

		let thrownError;

		try {
			verifyRootElements( editor );
		} catch ( err ) {
			thrownError = err;
		}

		expect( thrownError.data ).to.deep.equal( {
			rootName: 'secondRoot',
			elementName: 'nonLimit'
		} );

		editor.fire( 'ready' );
		return editor.destroy();
	} );
} );
