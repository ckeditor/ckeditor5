/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Plugin } from '@ckeditor/ckeditor5-core';

import { MathTypeEmailIntegration } from '../../src/integrations/mathtype.js';
import { EmailIntegrationUtils } from '../../src/emailintegrationutils.js';

describe( 'MathTypeEmailIntegration', () => {
	let domElement, editor, warnStub;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		warnStub = sinon.stub( console, 'warn' );
	} );

	afterEach( async () => {
		warnStub.restore();

		domElement.remove();
		if ( editor ) {
			await editor.destroy();
		}
	} );

	it( 'should be named', () => {
		expect( MathTypeEmailIntegration.pluginName ).to.equal( 'MathTypeEmailIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( MathTypeEmailIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should require EmailIntegrationUtils', () => {
		expect( MathTypeEmailIntegration.requires ).to.deep.equal( [ EmailIntegrationUtils ] );
	} );

	describe( 'afterInit()', () => {
		it( 'should not log warning when MathType plugin is not available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ MathTypeEmailIntegration, EmailIntegrationUtils ]
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning when MathType plugin is available', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ MathTypeEmailIntegration, EmailIntegrationUtils, MathType ]
			} );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-plugin' );
		} );

		it( 'should not log warning when EmailIntegration warnings are suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ MathTypeEmailIntegration, EmailIntegrationUtils, MathType ],
				email: {
					warnings: {
						suppressAll: true
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when specific warning is suppressed', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ MathTypeEmailIntegration, EmailIntegrationUtils, MathType ],
				email: {
					warnings: {
						suppress: [ 'email-unsupported-plugin' ]
					}
				}
			} );

			sinon.assert.notCalled( warnStub );
		} );
	} );
} );

class MathType extends Plugin {
	static get pluginName() {
		return 'MathType';
	}
}
