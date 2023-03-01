/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import MultiRootEditor from '../src/ckeditor';
import BaseMultiRootEditor from '@ckeditor/ckeditor5-editor-multi-root/src/multirooteditor';
import { describeMemoryUsage, testMemoryUsage } from '@ckeditor/ckeditor5-core/tests/_utils/memory';

describe( 'MultiRootEditor build', () => {
	let editor, fooElement, barElement;

	beforeEach( () => {
		fooElement = document.createElement( 'div' );
		fooElement.innerHTML = '<p><strong>foo</strong></p>';

		barElement = document.createElement( 'div' );
		barElement.innerHTML = '<p>bar</p>';

		document.body.appendChild( fooElement );
		document.body.appendChild( barElement );
	} );

	afterEach( () => {
		fooElement.remove();
		barElement.remove();
	} );

	describe( 'build', () => {
		it( 'contains plugins', () => {
			expect( MultiRootEditor.builtinPlugins ).to.not.be.empty;
		} );

		it( 'contains config', () => {
			expect( MultiRootEditor.defaultConfig.toolbar ).to.not.be.empty;
			expect( MultiRootEditor.defaultConfig.image ).to.not.be.empty;
			expect( MultiRootEditor.defaultConfig.table ).to.not.be.empty;
			expect( MultiRootEditor.defaultConfig.language ).to.not.be.undefined;
		} );
	} );

	describe( 'create()', () => {
		beforeEach( () => {
			return MultiRootEditor.create( { foo: fooElement, bar: barElement } )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'creates an instance which inherits from the MultiRootEditor', () => {
			expect( editor ).to.be.instanceof( MultiRootEditor );
			expect( editor ).to.be.instanceof( BaseMultiRootEditor );
		} );

		it( 'loads data from the editor element', () => {
			expect( editor.getData( { rootName: 'foo' } ) ).to.equal( '<p><strong>foo</strong></p>' );
			expect( editor.getData( { rootName: 'bar' } ) ).to.equal( '<p>bar</p>' );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( () => {
			return MultiRootEditor.create( { foo: fooElement, bar: barElement } )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		it( 'clears editor element if config.updateSourceElementOnDestroy flag is not set', () => {
			return editor.destroy()
				.then( () => {
					expect( fooElement.innerHTML ).to.equal( '' );
				} );
		} );

		it( 'sets the data back to the editor element if config.updateSourceElementOnDestroy flag is set', () => {
			editor.setData( { foo: '<p>foo</p>', bar: '<p>abc</p>' } );
			editor.config.set( 'updateSourceElementOnDestroy', true );

			return editor.destroy()
				.then( () => {
					expect( fooElement.innerHTML ).to.equal( '<p>foo</p>' );
					expect( barElement.innerHTML ).to.equal( '<p>abc</p>' );
				} );
		} );
	} );

	describeMemoryUsage( () => {
		testMemoryUsage(
			'should not grow on multiple create/destroy',
			() => MultiRootEditor.create( { foo: document.querySelector( '#mem-editor' ) } ) );
	} );
} );
