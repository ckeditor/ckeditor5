/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import TableLayout from '../src/tablelayout.js';

describe( 'TableLayout', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ TableLayout ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableLayout.pluginName ).to.equal( 'TableLayout' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableLayout.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableLayout.isPremiumPlugin ).to.be.false;
	} );
} );
