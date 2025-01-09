/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import TableEditing from '../src/tableediting.js';
import TableProperties from '../src/tableproperties.js';
import TablePropertiesEditing from '../src/tableproperties/tablepropertiesediting.js';

describe( 'table properties', () => {
	describe( 'TableProperties', () => {
		let editor, editorElement;

		beforeEach( async () => {
			editorElement = global.document.createElement( 'div' );
			global.document.body.appendChild( editorElement );

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ TableProperties, Paragraph, TableEditing ]
			} );
		} );

		afterEach( async () => {
			editorElement.remove();
			await editor.destroy();
		} );

		it( 'should be loaded', () => {
			expect( editor.plugins.get( TableProperties ) ).to.instanceOf( TableProperties );
		} );

		it( 'should load TablePropertiesEditing plugin', () => {
			expect( editor.plugins.get( TablePropertiesEditing ) ).to.instanceOf( TablePropertiesEditing );
		} );

		it( 'should have pluginName', () => {
			expect( TableProperties.pluginName ).to.equal( 'TableProperties' );
		} );

		it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
			expect( TableProperties.isOfficialPlugin ).to.be.true;
		} );

		it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
			expect( TableProperties.isPremiumPlugin ).to.be.false;
		} );
	} );
} );
