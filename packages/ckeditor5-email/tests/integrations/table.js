/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { PlainTableOutput, TableLayout, Table } from '@ckeditor/ckeditor5-table';

import TableEmailIntegration from '../../src/integrations/table.js';
import EmailIntegrationUtils from '../../src/emailintegrationutils.js';

describe( 'TableEmailIntegration', () => {
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
		expect( TableEmailIntegration.pluginName ).to.equal( 'TableEmailIntegration' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableEmailIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should require EmailIntegrationUtils', () => {
		expect( TableEmailIntegration.requires ).to.deep.equal( [ EmailIntegrationUtils ] );
	} );

	describe( 'afterInit()', () => {
		it( 'should warn when Table plugin is enabled without PlainTableOutput', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ TableEmailIntegration, EmailIntegrationUtils, Table ]
			} );

			sinon.assert.calledWith( warnStub, sinon.match( /email-integration-missing-plain-table-output-plugin/ ) );
		} );

		it( 'should warn when Table plugin is enabled without TableLayout', async () => {
			editor = await ClassicEditor.create( domElement, {
				plugins: [ TableEmailIntegration, EmailIntegrationUtils, Table ]
			} );

			sinon.assert.calledWith( warnStub, sinon.match( /email-integration-missing-table-layout-plugin/ ) );
		} );

		describe( 'table properties configuration', () => {
			it( 'should not warn about colors when Table plugin is not enabled', async () => {
				editor = await ClassicEditor.create( domElement, {
					plugins: [ TableEmailIntegration, EmailIntegrationUtils ],
					table: {
						tableProperties: {
							borderColors: [
								{ color: 'hsl(0, 100%, 50%)', label: 'Red' }
							],
							backgroundColors: [
								{ color: 'hsla(120, 100%, 50%, 1)', label: 'Green' }
							],
							colorPicker: {
								format: 'hsl'
							}
						},
						tableCellProperties: {
							borderColors: [
								{ color: 'hsl(0, 100%, 50%)', label: 'Red' }
							],
							backgroundColors: [
								{ color: 'hsla(120, 100%, 50%, 1)', label: 'Green' }
							],
							colorPicker: {
								format: 'hsl'
							}
						}
					}
				} );

				sinon.assert.notCalled( warnStub );
			} );

			for ( const configKey of [ 'tableProperties', 'tableCellProperties' ] ) {
				describe( `${ configKey } configuration`, () => {
					it( 'should not warn about hex colors in borderColors', async () => {
						editor = await ClassicEditor.create( domElement, {
							plugins: [ Table, PlainTableOutput, TableLayout, TableEmailIntegration, EmailIntegrationUtils ],
							table: {
								[ configKey ]: {
									borderColors: [
										{ color: '#FF0000', label: 'Red' }
									]
								}
							}
						} );

						sinon.assert.notCalled( warnStub );
					} );

					it( 'should warn about unsupported colors in borderColors', async () => {
						editor = await ClassicEditor.create( domElement, {
							plugins: [ Table, PlainTableOutput, TableLayout, TableEmailIntegration, EmailIntegrationUtils ],
							table: {
								[ configKey ]: {
									borderColors: [
										{ color: 'hsl(0, 100%, 50%)', label: 'Red' }
									]
								}
							}
						} );

						sinon.assert.calledWith( warnStub, sinon.match( /email-integration-unsupported-color-value/ ) );
					} );

					it( 'should not warn about hex colors in backgroundColors', async () => {
						editor = await ClassicEditor.create( domElement, {
							plugins: [ Table, PlainTableOutput, TableLayout, TableEmailIntegration, EmailIntegrationUtils ],
							table: {
								[ configKey ]: {
									backgroundColors: [
										{ color: '#FF0000', label: 'Red' }
									]
								}
							}
						} );

						sinon.assert.notCalled( warnStub );
					} );

					it( 'should warn about unsupported colors in backgroundColors', async () => {
						editor = await ClassicEditor.create( domElement, {
							plugins: [ Table, PlainTableOutput, TableLayout, TableEmailIntegration, EmailIntegrationUtils ],
							table: {
								[ configKey ]: {
									backgroundColors: [
										{ color: 'hsla(120, 100%, 50%, 1)', label: 'Green' }
									]
								}
							}
						} );

						sinon.assert.calledWith( warnStub, sinon.match( /email-integration-unsupported-color-value/ ) );
					} );

					describe( 'colorPicker', () => {
						it( 'should not warn about supported color format', async () => {
							editor = await ClassicEditor.create( domElement, {
								plugins: [ Table, PlainTableOutput, TableLayout, TableEmailIntegration, EmailIntegrationUtils ],
								table: {
									[ configKey ]: {
										colorPicker: {
											format: 'hex'
										}
									}
								}
							} );

							sinon.assert.notCalled( warnStub );
						} );

						it( 'should warn about unsupported color format', async () => {
							editor = await ClassicEditor.create( domElement, {
								plugins: [ Table, PlainTableOutput, TableLayout, TableEmailIntegration, EmailIntegrationUtils ],
								table: {
									[ configKey ]: {
										colorPicker: {
											format: 'hsl'
										}
									}
								}
							} );

							sinon.assert.calledWith( warnStub, sinon.match( /email-integration-unsupported-color-format/ ) );
						} );
					} );
				} );
			}
		} );
	} );
} );
