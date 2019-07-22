/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import PasteFromOffice from '../src/pastefromoffice';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import ContentNormalizer from '../src/contentnormalizer';

describe( 'PasteFromOffice', () => {
	let editor, pasteFromOffice;
	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ PasteFromOffice ]
		} )
			.then( _editor => {
				editor = _editor;
				pasteFromOffice = editor.plugins.get( 'PasteFromOffice' );
			} );
	} );

	it( 'is Paste from Office', () => {
		expect( pasteFromOffice ).to.be.instanceOf( PasteFromOffice );
	} );

	it( 'should have static name', () => {
		expect( PasteFromOffice.pluginName ).to.equal( 'PasteFromOffice' );
	} );

	it( 'should load Clipboard plugin', () => {
		expect( editor.plugins.get( Clipboard ) ).to.be.instanceOf( Clipboard );
	} );

	describe( 'constructor()', () => {
		it( 'should initialize 2 normalizers', () => {
			expect( pasteFromOffice._normalizers ).to.be.a( 'set' );
			expect( pasteFromOffice._normalizers.size ).to.equal( 2 );

			pasteFromOffice._normalizers.forEach( value => {
				expect( value ).to.be.instanceOf( ContentNormalizer );
			} );
		} );
	} );
} );
