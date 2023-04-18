/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';

import Style from '../src/style';
import StyleEditing from '../src/styleediting';
import StyleUI from '../src/styleui';

describe( 'Style', () => {
	let editor;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [ Style ]
		} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should be a plugin', () => {
		const style = editor.plugins.get( 'Style' );

		expect( style ).to.instanceOf( Style );
	} );

	it( 'should be named', () => {
		expect( Style.pluginName ).to.equal( 'Style' );
	} );

	it( 'should require StyleEditing and StyleUI', () => {
		expect( Style.requires ).to.deep.equal( [ StyleEditing, StyleUI ] );
	} );
} );
