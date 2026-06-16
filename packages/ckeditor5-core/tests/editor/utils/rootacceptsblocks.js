/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { Editor } from '../../../src/editor/editor.js';
import { rootAcceptsBlocks } from '../../../src/editor/utils/rootacceptsblocks.js';

describe( 'rootAcceptsBlocks()', () => {
	class TestEditor extends Editor {}

	it( 'should return true for a default $root', () => {
		const editor = new TestEditor();

		editor.model.document.createRoot( '$root', 'main' );

		expect( rootAcceptsBlocks( editor, 'main' ) ).toBe( true );

		editor.fire( 'ready' );
		return editor.destroy();
	} );

	it( 'should return false for an $inlineRoot', () => {
		const editor = new TestEditor();

		editor.model.document.createRoot( '$inlineRoot', 'main' );

		expect( rootAcceptsBlocks( editor, 'main' ) ).toBe( false );

		editor.fire( 'ready' );
		return editor.destroy();
	} );

	it( 'should evaluate each root independently in a multi-root setup', () => {
		const editor = new TestEditor();

		editor.model.document.createRoot( '$root', 'block' );
		editor.model.document.createRoot( '$inlineRoot', 'inline' );

		expect( rootAcceptsBlocks( editor, 'block' ) ).toBe( true );
		expect( rootAcceptsBlocks( editor, 'inline' ) ).toBe( false );

		editor.fire( 'ready' );
		return editor.destroy();
	} );

	it( 'should reflect schema rules added by plugins after editor construction', () => {
		const editor = new TestEditor();

		editor.model.schema.register( 'customRoot', { isLimit: true } );
		editor.model.document.createRoot( 'customRoot', 'main' );

		expect( rootAcceptsBlocks( editor, 'main' ) ).toBe( false );

		editor.model.schema.extend( '$block', { allowIn: 'customRoot' } );

		expect( rootAcceptsBlocks( editor, 'main' ) ).toBe( true );

		editor.fire( 'ready' );
		return editor.destroy();
	} );
} );
