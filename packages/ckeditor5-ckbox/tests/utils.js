/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global btoa */

import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock';
import { getWorkspaceId, getImageUrls } from '../src/utils';

describe( 'utils', () => {
	describe( 'getWorkspaceId', () => {
		describe( 'without default workspace', () => {
			it( 'should return the first workspace id from the token', async () => {
				const token = await createToken( {
					aud: 'environment',
					auth: {
						ckbox: {
							workspaces: [ 'workspace1', 'workspace2', 'workspace3' ]
						}
					}
				} );

				expect( getWorkspaceId( token ) ).to.equal( 'workspace1' );
			} );

			it( 'should return the only workspace id from the token', async () => {
				const token = await createToken( {
					aud: 'environment',
					auth: {
						ckbox: {
							workspaces: [ 'workspace1' ]
						}
					}
				} );

				expect( getWorkspaceId( token ) ).to.equal( 'workspace1' );
			} );

			it( 'should return environment name as a workspace id from a token when `auth.ckbox.workspaces` is missing', async () => {
				const token = await createToken( {
					aud: 'environment',
					auth: {
						ckbox: {}
					}
				} );

				expect( getWorkspaceId( token ) ).to.equal( 'environment' );
			} );

			it( 'should return environment name as a workspace id from a token when `auth.ckbox` is missing', async () => {
				const token = await createToken( {
					aud: 'environment',
					auth: {}
				} );

				expect( getWorkspaceId( token ) ).to.equal( 'environment' );
			} );

			it( 'should return environment name as a workspace id from a token when `auth` is missing', async () => {
				const token = await createToken( {
					aud: 'environment'
				} );

				expect( getWorkspaceId( token ) ).to.equal( 'environment' );
			} );
		} );

		describe( 'with default workspace', () => {
			it( 'should return the default workspace id from the token', async () => {
				const token = await createToken( {
					aud: 'environment',
					auth: {
						ckbox: {
							workspaces: [ 'workspace1', 'workspace2', 'workspace3' ]
						}
					}
				} );

				expect( getWorkspaceId( token, 'workspace2' ) ).to.equal( 'workspace2' );
			} );

			it( 'should return the default workspace id that equals to environment', async () => {
				const token = await createToken( {
					aud: 'environment'
				} );

				expect( getWorkspaceId( token, 'environment' ) ).to.equal( 'environment' );
			} );

			it( 'should return null when the user has no access to the default workspace', async () => {
				const token = await createToken( {
					aud: 'environment',
					auth: {
						ckbox: {
							workspaces: [ 'workspace1', 'workspace2', 'workspace3' ]
						}
					}
				} );

				expect( getWorkspaceId( token, 'another-workspace' ) ).to.be.null;
			} );

			it( 'should return default workspace when the user is superadmin', async () => {
				const token = await createToken( {
					aud: 'environment',
					auth: {
						ckbox: {
							role: 'superadmin'
						}
					}
				} );

				expect( getWorkspaceId( token, 'some-workspace' ) ).to.equal( 'some-workspace' );
			} );
		} );
	} );

	function createToken( claims ) {
		const initialToken = [
			// Header.
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
			// Payload.
			btoa( JSON.stringify( claims ) ),
			// Signature.
			'signature'
		].join( '.' );

		return TokenMock.create( () => Promise.resolve( initialToken ) );
	}

	describe( 'getImageUrls()', () => {
		const testData = [
			{ maxWidth: 80, widths: [ 80 ], extension: 'jpg' },
			{ maxWidth: 80, widths: [ 80 ], extension: 'png' },
			{ maxWidth: 400, widths: [ 80, 160, 240, 320, 400 ], extension: 'jpg' },
			{ maxWidth: 200, widths: [ 80, 120, 200 ], extension: 'png' }
		];

		for ( const { maxWidth, widths, extension } of testData ) {
			it( `should create responsize image source definition from the response data - ${ maxWidth }.${ extension }`, () => {
				const data = {
					default: getExampleUrl( maxWidth, extension )
				};

				for ( const width of widths ) {
					data[ width ] = getExampleUrl( width );
				}

				const expectedSizes = `(max-width: ${ maxWidth }px) 100vw, ${ maxWidth }px`;
				const expectedSrcset = widths.map( width => `${ getExampleUrl( width ) } ${ width }w` ).join( ',' );

				expect( getImageUrls( data ) ).to.deep.equal( {
					imageFallbackUrl: getExampleUrl( maxWidth, extension ),
					imageSources: [ {
						sizes: expectedSizes,
						srcset: expectedSrcset,
						type: 'image/webp'
					} ]
				} );
			} );
		}

		function getExampleUrl( width, extension = 'webp' ) {
			return `https://example.com/workspace1/assets/foo-id/images/${ width }.${ extension }`;
		}
	} );
} );
