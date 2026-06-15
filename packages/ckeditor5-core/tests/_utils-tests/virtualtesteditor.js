/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

import { Editor } from '../../src/editor/editor.js';
import { VirtualTestEditor } from '../../tests/_utils/virtualtesteditor.js';

import { HtmlDataProcessor, ModelRootElement } from '@ckeditor/ckeditor5-engine';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'VirtualTestEditor', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'creates an instance of editor', async () => {
			const editor = new VirtualTestEditor( { foo: 1 } );

			expect( editor ).toBeInstanceOf( Editor );
			expect( editor.data.processor ).toBeInstanceOf( HtmlDataProcessor );
			expect( editor.config.get( 'foo' ) ).toBe( 1 );
			expect( editor.model.document.getRoot( 'main' ).name ).toBe( '$root' );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates main root element', async () => {
			const editor = new VirtualTestEditor();

			expect( editor.model.document.getRoot( 'main' ) ).toBeInstanceOf( ModelRootElement );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates main root element with the given modelElement name', async () => {
			const editor = new VirtualTestEditor( {
				root: {
					modelElement: 'customRoot',
					initialData: ''
				}
			} );

			expect( editor.model.document.getRoot( 'main' ).name ).toBe( 'customRoot' );

			editor.fire( 'ready' );
			await editor.destroy();
		} );
	} );

	describe( 'static create()', () => {
		it( 'initializes the data controller with the `config.initialData`', () => {
			return VirtualTestEditor.create( { initialData: '<p>foo</p>', plugins: [ Paragraph ] } )
				.then( editor => {
					expect( editor.getData() ).toBe( '<p>foo</p>' );

					return editor.destroy();
				} );
		} );

		it( 'initializes the data controller with an empty string if the `config.initialData` is not provided', () => {
			return VirtualTestEditor.create()
				.then( editor => {
					expect( editor.getData() ).toBe( '' );

					return editor.destroy();
				} );
		} );

		it( 'fires the `data#ready` event once', () => {
			const dataReadySpy = vi.fn();

			const Plugin = function( editor ) {
				editor.data.on( 'ready', dataReadySpy );
			};

			return VirtualTestEditor.create( { plugins: [ Plugin ] } )
				.then( editor => {
					expect( dataReadySpy ).toHaveBeenCalledOnce();

					return editor.destroy();
				} );
		} );
	} );
} );
