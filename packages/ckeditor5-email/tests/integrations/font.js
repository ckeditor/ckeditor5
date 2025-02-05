/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Font } from '@ckeditor/ckeditor5-font';

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
		it( 'should not log warning when font plugin is not provided', async () => {
			await createEditor( {
				plugins: [ FontIntegration, EmailIntegrationUtils ]
			} );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should print warnings when font plugin is provided with default configuration', async () => {
			await createEditor( {
				plugins: [ FontIntegration, EmailIntegrationUtils, Font ]
			}, false );

			sinon.assert.calledWith( warnStub, sinon.match( /email-integration-unsupported-color-value/ ) );
		} );

		for ( const configKey of [ 'fontBackgroundColor', 'fontColor' ] ) {
			describe( `${ configKey } configuration`, () => {
				describe( 'colors', () => {
					it( 'should not warn about hex colors passed to `colors`', async () => {
						await createEditor( {
							[ configKey ]: {
								colors: [
									{ color: '#FF0000', label: 'Red' }
								]
							}
						} );

						sinon.assert.notCalled( warnStub );
					} );

					it( 'should warn about unsupported colors passed to `colors` key', async () => {
						await createEditor( {
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
						await createEditor( {
							[ configKey ]: {
								colors: [],
								colorPicker: false
							}
						} );

						sinon.assert.notCalled( warnStub );
					} );

					it( 'should warn about unsupported color format passed to `colorPicker` configuration', async () => {
						await createEditor( {
							[ configKey ]: {
								colors: [],
								colorPicker: {
									format: 'hsl'
								}
							}
						} );

						sinon.assert.calledWith( warnStub, sinon.match( /email-integration-unsupported-color-format/ ) );
					} );

					it( 'should not warn about supported color format passed to `colorPicker` configuration', async () => {
						await createEditor( {
							[ configKey ]: {
								colors: [],
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

	async function createEditor( config = {}, resetColors = true ) {
		editor = await ClassicEditor.create( domElement, {
			plugins: [ Font, FontIntegration, EmailIntegrationUtils ],
			...resetColors && {
				fontColor: {
					colors: []
				},
				fontBackgroundColor: {
					colors: []
				}
			},
			...config
		} );

		return editor;
	}
} );
