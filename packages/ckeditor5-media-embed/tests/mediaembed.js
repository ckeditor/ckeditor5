/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import MediaEmbed from '../src/mediaembed.js';
import MediaEmbedEditing from '../src/mediaembedediting.js';
import MediaEmbedUI from '../src/mediaembedui.js';
import AutoMediaEmbed from '../src/automediaembed.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

describe( 'MediaEmbed', () => {
	let editorElement, editor;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ MediaEmbed ]
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
		expect( editor.plugins.get( MediaEmbed ) ).to.instanceOf( MediaEmbed );
	} );

	it( 'should load MediaEmbedEditing plugin', () => {
		expect( editor.plugins.get( MediaEmbedEditing ) ).to.instanceOf( MediaEmbedEditing );
	} );

	it( 'should load Widget plugin', () => {
		expect( editor.plugins.get( Widget ) ).to.instanceOf( Widget );
	} );

	it( 'should load MediaEmbedUI plugin', () => {
		expect( editor.plugins.get( MediaEmbedUI ) ).to.instanceOf( MediaEmbedUI );
	} );

	it( 'should load AutoMediaEmbed plugin', () => {
		expect( editor.plugins.get( AutoMediaEmbed ) ).to.instanceOf( AutoMediaEmbed );
	} );

	it( 'has proper name', () => {
		expect( MediaEmbed.pluginName ).to.equal( 'MediaEmbed' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MediaEmbed.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( MediaEmbed.isPremiumPlugin ).to.be.false;
	} );
} );
