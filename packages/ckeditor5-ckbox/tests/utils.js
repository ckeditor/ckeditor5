/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi } from 'vitest';
import { TokenMock } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import { getWorkspaceId, getImageUrls, blurHashToDataUrl, convertMimeTypeToExtension, getContentTypeOfUrl } from '../src/utils.js';

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

				expect( getWorkspaceId( token ) ).toBe( 'workspace1' );
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

				expect( getWorkspaceId( token ) ).toBe( 'workspace1' );
			} );

			it( 'should return environment name as a workspace id from a token when `auth.ckbox.workspaces` is missing', async () => {
				const token = await createToken( {
					aud: 'environment',
					auth: {
						ckbox: {}
					}
				} );

				expect( getWorkspaceId( token ) ).toBe( 'environment' );
			} );

			it( 'should return environment name as a workspace id from a token when `auth.ckbox` is missing', async () => {
				const token = await createToken( {
					aud: 'environment',
					auth: {}
				} );

				expect( getWorkspaceId( token ) ).toBe( 'environment' );
			} );

			it( 'should return environment name as a workspace id from a token when `auth` is missing', async () => {
				const token = await createToken( {
					aud: 'environment'
				} );

				expect( getWorkspaceId( token ) ).toBe( 'environment' );
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

				expect( getWorkspaceId( token, 'workspace2' ) ).toBe( 'workspace2' );
			} );

			it( 'should return the default workspace id that equals to environment', async () => {
				const token = await createToken( {
					aud: 'environment'
				} );

				expect( getWorkspaceId( token, 'environment' ) ).toBe( 'environment' );
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

				expect( getWorkspaceId( token, 'another-workspace' ) ).toBeNull();
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

				expect( getWorkspaceId( token, 'some-workspace' ) ).toBe( 'some-workspace' );
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

				expect( getImageUrls( data ) ).toEqual( {
					imageFallbackUrl: getExampleUrl( maxWidth, extension ),
					imageSources: [ {
						sizes: expectedSizes,
						srcset: expectedSrcset,
						type: 'image/webp'
					} ]
				} );
			} );
		}

		it( 'should keep the current max width when a later entry does not exceed it', () => {
			// Integer-like keys iterate first in numeric ascending order; the non-integer-like
			// `'200.5'` key iterates last (insertion order), with parseInt → 200, which is not
			// greater than the maxWidth (300) already locked in by the earlier '300' entry.
			const data = {
				default: getExampleUrl( 300 ),
				100: getExampleUrl( 100 ),
				300: getExampleUrl( 300 ),
				'200.5': getExampleUrl( '200.5' )
			};

			const { imageSources } = getImageUrls( data );

			expect( imageSources[ 0 ].sizes ).toBe( '(max-width: 300px) 100vw, 300px' );
			expect( imageSources[ 0 ].srcset ).toBe(
				`${ getExampleUrl( 100 ) } 100w,${ getExampleUrl( 300 ) } 300w,${ getExampleUrl( '200.5' ) } 200.5w`
			);
		} );

		function getExampleUrl( width, extension = 'webp' ) {
			return `https://example.com/workspace1/assets/foo-id/images/${ width }.${ extension }`;
		}
	} );

	describe( 'base64FromBlurHash()', () => {
		it( 'should return undefined if no blurHash', () => {
			expect( blurHashToDataUrl( undefined ) ).toBeUndefined();
			expect( blurHashToDataUrl( null ) ).toBeUndefined();
			expect( blurHashToDataUrl( '' ) ).toBeUndefined();
		} );

		it( 'should return undefined if invalid blurHash', () => {
			expect( blurHashToDataUrl( '123' ) ).toBeUndefined();
		} );

		it( 'should generate image data url', () => {
			const result = blurHashToDataUrl( 'KTF55N=ZR4PXSirp5ZOZW9' );
			const prefix = 'data:image/png;base64,';
			const binary = atob( result.substring( prefix.length ) );

			expect( result ).toMatch( new RegExp( '^' + prefix ) );
			expect( binary.substring( 0, 8 ) ).toBe( '\x89PNG\r\n\u001a\n' );
		} );
	} );

	describe( 'convertMimeTypeToExtension()', () => {
		const testData = [
			[ 'image/gif', 'gif' ],
			[ 'image/jpeg', 'jpg' ],
			[ 'image/png', 'png' ],
			[ 'image/webp', 'webp' ],
			[ 'image/bmp', 'bmp' ],
			[ 'image/tiff', 'tiff' ],
			[ 'image/unknown', undefined ],
			[ 'text/html', undefined ],
			[ '', undefined ]
		];

		for ( const [ mimeType, extension ] of testData ) {
			const returnDescription = extension ? `'${ extension }'` : 'undefined';

			it( `should return ${ returnDescription } for '${ mimeType }' type`, () => {
				expect( convertMimeTypeToExtension( mimeType ) ).toBe( extension );
			} );
		}
	} );

	describe( 'getContentTypeOfUrl()', () => {
		it( 'should fetch content type', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const mimeType = 'image/myformat';
			const controller = new AbortController();
			vi.spyOn( window, 'fetch' ).mockResolvedValue(
				new Response( null, { headers: { 'content-type': mimeType } } )
			);

			const result = await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( result ).toBe( mimeType );
		} );

		it( 'should call `fetch` with correct arguments', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const mimeType = 'image/myformat';
			const controller = new AbortController();
			const stub = vi.spyOn( window, 'fetch' ).mockResolvedValue(
				new Response( null, { headers: { 'content-type': mimeType } } )
			);

			await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( stub ).toHaveBeenCalledTimes( 1 );
			expect( stub.mock.calls[ 0 ][ 0 ] ).toBe( imageUrl );
			expect( stub.mock.calls[ 0 ][ 1 ] ).toMatchObject( {
				method: 'HEAD',
				cache: 'force-cache',
				signal: controller.signal
			} );
		} );

		it( 'should return empty string when `Content-Type` is missing in response', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const controller = new AbortController();
			vi.spyOn( window, 'fetch' ).mockResolvedValue(
				new Response( null, { headers: {} } )
			);

			const result = await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( result ).toBe( '' );
		} );

		it( 'should return empty string when `fetch` fails', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const controller = new AbortController();
			vi.spyOn( window, 'fetch' ).mockResolvedValue(
				new Response( null, { status: 500 } )
			);

			const result = await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( result ).toBe( '' );
		} );

		it( 'should return empty string on network error', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const controller = new AbortController();
			vi.spyOn( window, 'fetch' ).mockRejectedValue( new Error( 'failed' ) );

			const result = await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( result ).toBe( '' );
		} );
	} );
} );
