/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Style from '../src/style';
import StyleUtils from '../src/styleutils';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';

describe( 'StyleUtils', () => {
	let editor, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ GeneralHtmlSupport, Style ]
		} );
	} );

	afterEach( async () => {
		element.remove();

		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( StyleUtils.pluginName ).to.equal( 'StyleUtils' );
	} );

	it( 'should be loaded by the Style plugin', () => {
		expect( editor.plugins.has( 'StyleUtils' ) ).to.be.true;
	} );
} );
