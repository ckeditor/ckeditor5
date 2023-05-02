import { EmailEditing as EmailEditingDll, icons } from '../src';
import EmailEditing from '../src/emailediting';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 EmailEditing DLL', () => {
	it( 'exports EmailEditing', () => {
		expect( EmailEditingDll ).to.equal( EmailEditing );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
