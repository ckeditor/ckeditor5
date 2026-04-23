/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { global } from '@ckeditor/ckeditor5-utils';

import { MediaEmbedResize } from '../../src/mediaembedresize.js';
import { MediaEmbedResizeEditing } from '../../src/mediaembedresize/mediaembedresizeediting.js';
import { MediaEmbedResizeHandles } from '../../src/mediaembedresize/mediaembedresizehandles.js';

describe( 'MediaEmbedResize', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MediaEmbedResize ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( MediaEmbedResize ) ).to.instanceOf( MediaEmbedResize );
	} );

	it( 'should load MediaEmbedResizeEditing plugin', () => {
		expect( editor.plugins.get( MediaEmbedResizeEditing ) ).to.instanceOf( MediaEmbedResizeEditing );
	} );

	it( 'should load MediaEmbedResizeHandles plugin', () => {
		expect( editor.plugins.get( MediaEmbedResizeHandles ) ).to.instanceOf( MediaEmbedResizeHandles );
	} );

	it( 'has proper name', () => {
		expect( MediaEmbedResize.pluginName ).to.equal( 'MediaEmbedResize' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedResize.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedResize.isPremiumPlugin ).to.be.false;
	} );
} );
