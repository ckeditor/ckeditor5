/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateLicenseKey } from '@ckeditor/ckeditor5-core/tests/_utils/generatelicensekey.js';
import { MultiRootEditor } from '../src/multirooteditor.js';

describe( 'MultiRootEditor - license check', () => {
	let showErrorStub;

	beforeEach( () => {
		showErrorStub = vi.spyOn( MultiRootEditor.prototype, '_showLicenseError' ).mockImplementation( () => {} );
	} );

	it( 'should not throw if license key is invalid', () => {
		const licenseKey = 'invalid';

		expect( () => {
			// eslint-disable-next-line no-new
			new MultiRootEditor( {}, { licenseKey } );
		} ).not.toThrow();
	} );

	it( 'should not block if license key is GPL', () => {
		const licenseKey = 'GPL';

		const editor = new MultiRootEditor( {}, { licenseKey } );

		expect( showErrorStub ).not.toHaveBeenCalled();
		expect( editor.isReadOnly ).toBe( false );
	} );

	it( 'should not block if multi-root editor is allowed by license key', () => {
		const { licenseKey } = generateLicenseKey();

		const editor = new MultiRootEditor( {}, { licenseKey } );

		expect( showErrorStub ).not.toHaveBeenCalled();
		expect( editor.isReadOnly ).toBe( false );
	} );

	it( 'should block if multi-root editor is not allowed by license key', () => {
		const { licenseKey } = generateLicenseKey( {
			removeFeatures: [ 'MRE' ]
		} );

		const editor = new MultiRootEditor( {}, { licenseKey } );

		expect( showErrorStub ).toHaveBeenCalledWith( 'featureNotAllowed', 'Multi-root editor' );
		expect( editor.isReadOnly ).toBe( true );
	} );
} );
