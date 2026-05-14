/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { global } from '@ckeditor/ckeditor5-utils';

import { MediaEmbedStyle } from '../src/mediaembedstyle.js';
import { MediaEmbedStyleEditing } from '../src/mediaembedstyle/mediaembedstyleediting.js';
import { MediaEmbedStyleUI } from '../src/mediaembedstyle/mediaembedstyleui.js';

describe( 'MediaEmbedStyle', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( {
				attachTo: editorElement,
				plugins: [ MediaEmbedStyle ]
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
		expect( editor.plugins.get( MediaEmbedStyle ) ).to.instanceOf( MediaEmbedStyle );
	} );

	it( 'should load MediaEmbedStyleEditing plugin', () => {
		expect( editor.plugins.get( MediaEmbedStyleEditing ) ).to.instanceOf( MediaEmbedStyleEditing );
	} );

	it( 'should load MediaEmbedStyleUI plugin', () => {
		expect( editor.plugins.get( MediaEmbedStyleUI ) ).to.instanceOf( MediaEmbedStyleUI );
	} );

	it( 'has proper name', () => {
		expect( MediaEmbedStyle.pluginName ).to.equal( 'MediaEmbedStyle' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbedStyle.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbedStyle.isPremiumPlugin ).to.be.false;
	} );
} );
