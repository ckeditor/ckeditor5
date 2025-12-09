/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Image } from '../src/image.js';
import { ImageTextAlternative } from '../src/imagetextalternative.js';
import { ImageTextAlternativeEditing } from '../src/imagetextalternative/imagetextalternativeediting.js';
import { ImageTextAlternativeUI } from '../src/imagetextalternative/imagetextalternativeui.js';
import { global } from '@ckeditor/ckeditor5-utils';

describe( 'ImageTextAlternative', () => {
	let editor, plugin, editorElement;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageTextAlternative, Image ]
			} )
			.then( newEditor => {
				editor = newEditor;
				newEditor.editing.view.attachDomRoot( editorElement );
				plugin = editor.plugins.get( ImageTextAlternative );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageTextAlternative.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageTextAlternative.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( plugin ).toBeInstanceOf( ImageTextAlternative );
	} );

	it( 'should load ImageTextAlternativeEditing plugin', () => {
		expect( editor.plugins.get( ImageTextAlternativeEditing ) ).toBeInstanceOf( ImageTextAlternativeEditing );
	} );

	it( 'should load ImageTextAlternativeUI plugin', () => {
		expect( editor.plugins.get( ImageTextAlternativeUI ) ).toBeInstanceOf( ImageTextAlternativeUI );
	} );
} );
