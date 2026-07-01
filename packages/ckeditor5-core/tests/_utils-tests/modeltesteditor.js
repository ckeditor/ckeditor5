/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Editor } from '../../src/editor/editor.js';
import { EditingController, HtmlDataProcessor, ModelRootElement, _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { ModelTestEditor } from '../../tests/_utils/modeltesteditor.js';

describe( 'ModelTestEditor', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'creates an instance of editor', async () => {
			const editor = new ModelTestEditor( { foo: 1 } );

			expect( editor ).toBeInstanceOf( Editor );
			expect( editor.config.get( 'foo' ) ).toBe( 1 );
			expect( editor.data.processor ).toBeInstanceOf( HtmlDataProcessor );
			expect( editor.model.document.getRoot( 'main' ).name ).toBe( '$root' );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'should disable editing pipeline', () => {
			const spy = vi.spyOn( EditingController.prototype, 'destroy' );

			return ModelTestEditor.create( { foo: 1 } ).then( editor => {
				expect( spy ).toHaveBeenCalledOnce();

				return editor.destroy();
			} );
		} );

		it( 'creates main root element', async () => {
			const editor = new ModelTestEditor();

			expect( editor.model.document.getRoot( 'main' ) ).toBeInstanceOf( ModelRootElement );

			editor.fire( 'ready' );
			await editor.destroy();
		} );

		it( 'creates main root element with the given modelElement name', async () => {
			const editor = new ModelTestEditor( {
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

	describe( 'setData', () => {
		let editor;

		beforeEach( () => {
			return ModelTestEditor.create()
				.then( newEditor => {
					editor = newEditor;

					editor.model.schema.extend( '$text', { allowIn: '$root' } );
				} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should set data of the first root', () => {
			editor.model.document.createRoot( '$root', 'secondRoot' );

			editor.setData( 'foo' );

			expect( _getModelData( editor.model, { rootName: 'main', withoutSelection: true } ) ).toBe( 'foo' );
		} );
	} );

	describe( 'getData', () => {
		let editor;

		beforeEach( () => {
			return ModelTestEditor.create()
				.then( newEditor => {
					editor = newEditor;

					editor.model.schema.extend( '$text', { allowIn: '$root' } );
				} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should set data of the first root', () => {
			_setModelData( editor.model, 'foo' );

			expect( editor.getData() ).toBe( 'foo' );
		} );
	} );
} );
