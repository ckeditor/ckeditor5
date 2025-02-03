/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { FontIntegration } from '../../src/integrations/font.js';
import EmailIntegrationUtils from '../../src/emailintegrationutils.js';

describe( 'FontIntegration', () => {
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
		expect( FontIntegration.pluginName ).to.equal( 'FontIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FontIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should require EmailIntegrationUtils', () => {
		expect( FontIntegration.requires ).to.deep.equal( [ EmailIntegrationUtils ] );
	} );

	describe( 'afterInit()', () => {
		it( 'should not log warning when no font config is provided', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ FontIntegration, EmailIntegrationUtils ]
			} );

			sinon.assert.notCalled( warnStub );
		} );

		for ( const configKey of [ 'fontBackgroundColor', 'fontColor' ] ) {
			describe( `${ configKey } configuration`, () => {
				describe( 'colors', () => {
					it( 'should not warn about hex colors passed to `colors`', async () => {
						editor = await ClassicEditor.create( domElement, {
							plugins: [ FontIntegration, EmailIntegrationUtils ],
							[ configKey ]: {
								colors: [
									{ color: '#FF0000', label: 'Red' }
								]
							}
						} );

						sinon.assert.notCalled( warnStub );
					} );

					it( 'should warn about unsupported colors passed to `colors` key', async () => {
						editor = await ClassicEditor.create( domElement, {
							plugins: [ FontIntegration, EmailIntegrationUtils ],
							[ configKey ]: {
								colors: [
									{ color: 'hsl(0, 100%, 50%)', label: 'Red' },
									{ color: 'hsla(120, 100%, 50%, 1)', label: 'Green' }
								]
							}
						} );

						sinon.assert.calledWith( warnStub, sinon.match( /email-integration-unsupported-color-value/ ) );
					} );
				} );

				describe( 'colorPicker', () => {
					it( 'should handle `colorPicker` with `false` value', async () => {
						editor = await ClassicEditor.create( domElement, {
							plugins: [ FontIntegration, EmailIntegrationUtils ],
							[ configKey ]: {
								colorPicker: false
							}
						} );

						sinon.assert.notCalled( warnStub );
					} );

					it( 'should warn about unsupported color format passed to `colorPicker` configuration', async () => {
						editor = await ClassicEditor.create( domElement, {
							plugins: [ FontIntegration, EmailIntegrationUtils ],
							[ configKey ]: {
								colorPicker: {
									format: 'hsl'
								}
							}
						} );

						sinon.assert.calledWith( warnStub, sinon.match( /email-integration-unsupported-color-format/ ) );
					} );

					it( 'should not warn about supported color format passed to `colorPicker` configuration', async () => {
						editor = await ClassicEditor.create( domElement, {
							plugins: [ FontIntegration, EmailIntegrationUtils ],
							[ configKey ]: {
								colorPicker: {
									format: 'hex'
								}
							}
						} );

						sinon.assert.notCalled( warnStub );
					} );
				} );
			} );
		}
	} );
} );
