/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { getWorkspaceId, getImageUrls, blurHashToDataUrl, convertMimeTypeToExtension, getContentTypeOfUrl } from '../src/utils.js';

describe( 'utils', () => {
	testUtils.createSinonSandbox();

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

	describe( 'base64FromBlurHash()', () => {
		it( 'should return undefined if no blurHash', () => {
			expect( blurHashToDataUrl( undefined ) ).to.be.undefined;
			expect( blurHashToDataUrl( null ) ).to.be.undefined;
			expect( blurHashToDataUrl( '' ) ).to.be.undefined;
		} );

		it( 'should return undefined if invalid blurHash', () => {
			expect( blurHashToDataUrl( '123' ) ).to.be.undefined;
		} );

		it( 'should generate image data url', () => {
			const result = blurHashToDataUrl( 'KTF55N=ZR4PXSirp5ZOZW9' );
			const prefix = 'data:image/png;base64,';
			const binary = atob( result.substring( prefix.length ) );

			expect( result ).to.match( new RegExp( '^' + prefix ) );
			expect( binary.substring( 0, 8 ) ).to.equal( '\x89PNG\r\n\u001a\n' );
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
				expect( convertMimeTypeToExtension( mimeType ) ).to.equal( extension );
			} );
		}
	} );

	describe( 'getContentTypeOfUrl()', () => {
		it( 'should fetch content type', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const mimeType = 'image/myformat';
			const controller = new AbortController();
			sinon.stub( window, 'fetch' ).resolves(
				new Response( null, { headers: { 'content-type': mimeType } } )
			);

			const result = await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( result ).to.equal( mimeType );
		} );

		it( 'should call `fetch` with correct arguments', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const mimeType = 'image/myformat';
			const controller = new AbortController();
			const stub = sinon.stub( window, 'fetch' ).resolves(
				new Response( null, { headers: { 'content-type': mimeType } } )
			);

			await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( stub.calledOnce ).to.be.true;
			expect( stub.firstCall.args[ 0 ] ).to.equal( imageUrl );
			expect( stub.firstCall.args[ 1 ] ).to.deep.include( {
				method: 'HEAD',
				cache: 'force-cache',
				signal: controller.signal
			} );
		} );

		it( 'should return empty string when `Content-Type` is missing in response', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const controller = new AbortController();
			sinon.stub( window, 'fetch' ).resolves(
				new Response( null, { headers: {} } )
			);

			const result = await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( result ).to.equal( '' );
		} );

		it( 'should return empty string when `fetch` fails', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const controller = new AbortController();
			sinon.stub( window, 'fetch' ).resolves(
				new Response( null, { status: 500 } )
			);

			const result = await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( result ).to.equal( '' );
		} );

		it( 'should return empty string on network error', async () => {
			const imageUrl = 'https://example.com/sample.jpb';
			const controller = new AbortController();
			sinon.stub( window, 'fetch' ).rejects( 'failed' );

			const result = await getContentTypeOfUrl( imageUrl, { signal: controller.signal } );

			expect( result ).to.equal( '' );
		} );
	} );
} );
