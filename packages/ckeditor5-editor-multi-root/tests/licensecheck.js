/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { generateLicenseKey } from '@ckeditor/ckeditor5-core/tests/_utils/generatelicensekey.js';
import { MultiRootEditor } from '../src/multirooteditor.js';

describe( 'MultiRootEditor - license check', () => {
	testUtils.createSinonSandbox();

	let showErrorStub;

	beforeEach( () => {
		showErrorStub = testUtils.sinon.stub( MultiRootEditor.prototype, '_showLicenseError' );
	} );

	it( 'should not throw if license key is invalid', () => {
		const licenseKey = 'invalid';

		expect( () => {
			// eslint-disable-next-line no-new
			new MultiRootEditor( {}, { licenseKey } );
		} ).to.not.throw();
	} );

	it( 'should not block if license key is GPL', () => {
		const licenseKey = 'GPL';

		const editor = new MultiRootEditor( {}, { licenseKey } );

		sinon.assert.notCalled( showErrorStub );
		expect( editor.isReadOnly ).to.be.false;
	} );

	it( 'should not block if multi-root editor is allowed by license key', () => {
		const { licenseKey } = generateLicenseKey();

		const editor = new MultiRootEditor( {}, { licenseKey } );

		sinon.assert.notCalled( showErrorStub );
		expect( editor.isReadOnly ).to.be.false;
	} );

	it( 'should block if multi-root editor is not allowed by license key', () => {
		const { licenseKey } = generateLicenseKey( {
			removeFeatures: [ 'MRE' ]
		} );

		const editor = new MultiRootEditor( {}, { licenseKey } );

		sinon.assert.calledWithMatch( showErrorStub, 'featureNotAllowed', 'Multi-root editor' );
		expect( editor.isReadOnly ).to.be.true;
	} );
} );
