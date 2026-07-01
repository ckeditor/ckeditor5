/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CKEditorError, global } from '@ckeditor/ckeditor5-utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { Editor } from '../../src/editor/editor.js';
import { Plugin } from '../../src/plugin.js';
import { generateLicenseKey } from '../_utils/generatelicensekey.js';
import { getEditorUsageData } from '../../src/editor/utils/editorusagedata.js';

class TestEditor extends Editor {
	static create( config ) {
		return new Promise( resolve => {
			const editor = new this( config );

			resolve(
				editor.initPlugins()
					.then( () => {
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

describe( 'Editor - license check', () => {
	afterEach( () => {
		delete TestEditor.builtinPlugins;
		delete TestEditor.defaultConfig;

		vi.restoreAllMocks();
	} );

	describe( 'license key verification', () => {
		let showErrorStub, consoleInfoStub, consoleWarnStub;

		beforeEach( () => {
			showErrorStub = vi.spyOn( TestEditor.prototype, '_showLicenseError' ).mockImplementation( () => {} );
			consoleInfoStub = vi.spyOn( console, 'info' ).mockImplementation( () => {} );
			consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		} );

		describe( 'required fields in the license key', () => {
			it( 'should not block the editor when required fields are provided and are valid', () => {
				const { licenseKey } = generateLicenseKey();

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );
			} );

			it( 'should block the editor when the `exp` field is missing', () => {
				const { licenseKey } = generateLicenseKey( { expExist: false } );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'invalid' );
				expect( editor.isReadOnly ).toBe( true );
			} );

			it( 'should block the editor when the `jti` field is missing', () => {
				const { licenseKey } = generateLicenseKey( { jtiExist: false } );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'invalid' );
				expect( editor.isReadOnly ).toBe( true );
			} );

			it( 'should block the editor when the `vc` field is missing', () => {
				const { licenseKey } = generateLicenseKey( { vcExist: false } );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'invalid' );
				expect( editor.isReadOnly ).toBe( true );
			} );
		} );

		describe( '"licensedHosts" check', () => {
			const sets = {
				success: [
					{
						name: 'direct domain match',
						hostname: 'example.com',
						licensedHost: 'example.com'
					},
					{
						name: 'direct IP match',
						hostname: '127.0.0.1',
						licensedHost: '127.0.0.1'
					},
					{
						name: 'wildcard IP match',
						hostname: '127.0.0.1',
						licensedHost: '127.*.*.*'
					},
					{
						name: 'wildcard subdomain match',
						hostname: 'subdomain.example.com',
						licensedHost: '*.example.com'
					},
					{
						name: 'wildcard nested subdomain match',
						hostname: 'nested.subdomain.example.com',
						licensedHost: '*.example.com'
					}
				],
				fail: [
					{
						name: 'domain mismatch',
						hostname: 'example.com',
						licensedHost: 'example.net'
					},
					{
						name: 'IP mismatch',
						hostname: '127.0.0.1',
						licensedHost: '127.0.0.2'
					},
					{
						name: 'domain mismatch (wildcard subdomain)',
						hostname: 'sub.example.com',
						licensedHost: '*.example.net'
					},
					{
						name: 'IP mismatch (wildcard)',
						hostname: '127.0.0.1',
						licensedHost: '192.168.*.*'
					},
					{
						name: 'subdomain mismatch',
						hostname: 'subdomain.example.com',
						licensedHost: 'sub.example.com'
					},
					{
						name: 'missing root domain',
						hostname: 'example.com',
						licensedHost: 'subdomain.example.com'
					},
					{
						name: 'missing subdomain',
						hostname: 'subdomain.example.com',
						licensedHost: 'example.com'
					},
					{
						name: 'missing nested subdomain without wildcard',
						hostname: 'nested.subdomain.example.com',
						licensedHost: 'subdomain.example.com'
					},
					{
						name: 'licensed host allowing only more nested subdomains',
						hostname: 'subdomain.example.com',
						licensedHost: '*.*.example.com'
					},
					{
						name: 'subdomain wildcards matching entire hostname in length',
						hostname: 'example.com',
						licensedHost: '*.*.example.com'
					}
				]
			};

			sets.success.forEach( set => {
				it( `works on ${ set.name }`, () => {
					vi.spyOn( URL.prototype, 'hostname', 'get' ).mockReturnValue( set.hostname );

					const { licenseKey } = generateLicenseKey( { licensedHosts: [ set.licensedHost ] } );
					const editor = new TestEditor( { licenseKey } );

					expect( showErrorStub ).not.toHaveBeenCalled();

					expect( editor.isReadOnly ).toBe( false );
				} );
			} );

			sets.fail.forEach( set => {
				it( `fails on ${ set.name }`, () => {
					vi.spyOn( URL.prototype, 'hostname', 'get' ).mockReturnValue( set.hostname );

					const { licenseKey } = generateLicenseKey( { licensedHosts: [ set.licensedHost ] } );
					const editor = new TestEditor( { licenseKey } );

					expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'domainLimit' );

					expect( editor.isReadOnly ).toBe( true );
				} );
			} );
		} );

		describe( 'distribution channel check', () => {
			afterEach( () => {
				delete window[ Symbol.for( 'cke distribution' ) ];
			} );

			it( 'should not block if distribution channel match', () => {
				setChannel( 'xyz' );

				const { licenseKey } = generateLicenseKey( { distributionChannel: 'xyz' } );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );
			} );

			it( 'should not block if one of distribution channel match', () => {
				setChannel( 'xyz' );

				const { licenseKey } = generateLicenseKey( { distributionChannel: [ 'abc', 'xyz' ] } );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );
			} );

			it( 'should not block if implicit distribution channel match', () => {
				const { licenseKey } = generateLicenseKey( { distributionChannel: 'sh' } );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );
			} );

			it( 'should not block if distribution channel is not restricted', () => {
				setChannel( 'xyz' );

				const { licenseKey } = generateLicenseKey();

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );
			} );

			it( 'should block if distribution channel doesn\'t match', () => {
				setChannel( 'abc' );

				const { licenseKey } = generateLicenseKey( { distributionChannel: 'xyz' } );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'distributionChannel' );
				expect( editor.isReadOnly ).toBe( true );
			} );

			it( 'should block if none of distribution channel doesn\'t match', () => {
				setChannel( 'abc' );

				const { licenseKey } = generateLicenseKey( { distributionChannel: [ 'xyz', 'def' ] } );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'distributionChannel' );
				expect( editor.isReadOnly ).toBe( true );
			} );

			it( 'should block if implicit distribution channel doesn\'t match', () => {
				const { licenseKey } = generateLicenseKey( { distributionChannel: 'xyz' } );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'distributionChannel' );
				expect( editor.isReadOnly ).toBe( true );
			} );

			describe( 'GPL license', () => {
				it( 'should block if distribution channel is cloud', () => {
					setChannel( 'cloud' );

					const licenseKey = 'GPL';
					const editor = new TestEditor( { licenseKey } );

					expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'distributionChannel' );
					expect( editor.isReadOnly ).toBe( true );
				} );

				it( 'should not block if distribution channel is not cloud', () => {
					setChannel( 'xyz' );

					const licenseKey = 'GPL';
					const editor = new TestEditor( { licenseKey } );

					expect( showErrorStub ).not.toHaveBeenCalled();
					expect( editor.isReadOnly ).toBe( false );
				} );
			} );

			function setChannel( channel ) {
				window[ Symbol.for( 'cke distribution' ) ] = channel;
			}
		} );

		describe( 'GPL check', () => {
			it( 'should not throw if license key is GPL', () => {
				const licenseKey = 'GPL';

				expect( () => {
					// eslint-disable-next-line no-new
					new TestEditor( { licenseKey } );
				} ).not.toThrow();
			} );

			it( 'should not throw if license key is missing (CKEditor testing environment)', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new TestEditor( {} );
				} ).not.toThrow();
			} );

			it( 'should throw if license key is missing (outside of CKEditor testing environment)', () => {
				window.CKEDITOR_GLOBAL_LICENSE_KEY = undefined;

				expect( () => {
					// eslint-disable-next-line no-new
					new TestEditor( {} );
				} ).toThrow( CKEditorError );

				window.CKEDITOR_GLOBAL_LICENSE_KEY = 'GPL';
			} );
		} );

		describe( 'evaluation/trial check', () => {
			const licenseTypes = [ 'evaluation', 'trial' ];

			beforeEach( () => {
				vi.useFakeTimers( { now: Date.now() } );
			} );

			afterEach( () => {
				vi.useRealTimers();
				vi.restoreAllMocks();
			} );

			it( 'should block editor after 10 minutes on evaluation license', () => {
				const { licenseKey, todayTimestamp } = generateLicenseKey( {
					licenseType: 'evaluation',
					isExpired: false,
					daysAfterExpiration: -1
				} );

				const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( todayTimestamp );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );

				vi.advanceTimersByTime( 600100 );

				expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'evaluationLimit' );
				expect( editor.isReadOnly ).toBe( true );

				dateNow.mockRestore();
			} );

			it( 'should not block editor after 10 minutes on trial license', () => {
				const { licenseKey, todayTimestamp } = generateLicenseKey( {
					licenseType: 'trial',
					isExpired: false,
					daysAfterExpiration: -1
				} );

				const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( todayTimestamp );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );

				vi.advanceTimersByTime( 600100 );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );

				dateNow.mockRestore();
			} );

			it( 'should clear timer on editor destroy on evaluation license', () => {
				return new Promise( done => {
					const { licenseKey, todayTimestamp } = generateLicenseKey( {
						licenseType: 'evaluation',
						isExpired: false,
						daysAfterExpiration: -1
					} );

					const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( todayTimestamp );
					const editor = new TestEditor( { licenseKey } );
					const clearTimeoutSpy = vi.spyOn( globalThis, 'clearTimeout' );

					editor.fire( 'ready' );
					editor.on( 'destroy', () => {
						expect( clearTimeoutSpy ).toHaveBeenCalledOnce();
						done();
					} );

					editor.destroy();
					dateNow.mockRestore();
				} );
			} );

			licenseTypes.forEach( licenseType => {
				it( `should not block if ${ licenseType } license did not expired`, () => {
					const { licenseKey, todayTimestamp } = generateLicenseKey( {
						licenseType,
						isExpired: false,
						daysAfterExpiration: -1
					} );

					const today = todayTimestamp;
					const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( today );

					const editor = new TestEditor( { licenseKey } );

					expect( showErrorStub ).not.toHaveBeenCalled();
					expect( editor.isReadOnly ).toBe( false );

					dateNow.mockRestore();
				} );

				it( `should block if ${ licenseType } license is expired`, () => {
					const { licenseKey, todayTimestamp } = generateLicenseKey( {
						licenseType,
						daysAfterExpiration: 1
					} );

					const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( todayTimestamp );

					const editor = new TestEditor( { licenseKey } );

					expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'expired' );
					expect( editor.isReadOnly ).toBe( true );

					dateNow.mockRestore();
				} );

				it( `should log information to the console about using the ${ licenseType } license`, () => {
					const { licenseKey, todayTimestamp } = generateLicenseKey( {
						licenseType
					} );

					const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( todayTimestamp );

					// Simulate hard reload.
					global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

					const editor = new TestEditor( { licenseKey } );
					expect( editor.isReadOnly ).toBe( false );

					expect( consoleInfoStub ).toHaveBeenCalledOnce();
					expect( consoleWarnStub ).toHaveBeenCalledOnce();

					assertConsoleMessages( consoleInfoStub, consoleWarnStub, licenseType );

					dateNow.mockRestore();
				} );

				it( `should log information to the console about using the ${ licenseType } license only once`, () => {
					const { licenseKey, todayTimestamp } = generateLicenseKey( {
						licenseType
					} );

					const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( todayTimestamp );

					// Simulate hard reload.
					global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

					// eslint-disable-next-line no-new
					new TestEditor( { licenseKey } );

					expect( consoleInfoStub ).toHaveBeenCalledOnce();
					expect( consoleWarnStub ).toHaveBeenCalledOnce();

					assertConsoleMessages( consoleInfoStub, consoleWarnStub, licenseType );

					// Use the same license type for the second editor to check if the message is shown only once.

					// eslint-disable-next-line no-new
					new TestEditor( { licenseKey } );

					expect( consoleInfoStub ).toHaveBeenCalledOnce();
					expect( consoleWarnStub ).toHaveBeenCalledOnce();

					dateNow.mockRestore();
				} );
			} );

			it( 'should log information to the console twice when using two different license types', () => {
				const trialLicense = generateLicenseKey( {
					licenseType: 'trial'
				} );

				const evaluationLicense = generateLicenseKey( {
					licenseType: 'evaluation'
				} );

				const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( trialLicense.licenseKeyTimestamp );

				// Simulate hard reload.
				global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

				// eslint-disable-next-line no-new
				new TestEditor( { licenseKey: trialLicense.licenseKey } );

				expect( consoleInfoStub ).toHaveBeenCalledOnce();
				expect( consoleWarnStub ).toHaveBeenCalledOnce();

				assertConsoleMessages( consoleInfoStub, consoleWarnStub, 'trial' );

				// Use a different license type for the second editor to check if the message is shown twice.

				// eslint-disable-next-line no-new
				new TestEditor( { licenseKey: evaluationLicense.licenseKey } );

				expect( consoleInfoStub ).toHaveBeenCalledTimes( 2 );
				expect( consoleWarnStub ).toHaveBeenCalledTimes( 2 );

				assertConsoleMessages( consoleInfoStub, consoleWarnStub, 'evaluation' );

				dateNow.mockRestore();
			} );
		} );

		describe( 'development license', () => {
			beforeEach( () => {
				vi.useFakeTimers( { now: Date.now() } );
			} );

			afterEach( () => {
				vi.useRealTimers();
				vi.restoreAllMocks();
			} );

			it( 'should log information to the console about using the development license', () => {
				const { licenseKey } = generateLicenseKey( {
					licenseType: 'development'
				} );

				// Simulate hard reload.
				global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

				const editor = new TestEditor( { licenseKey } );

				expect( editor.isReadOnly ).toBe( false );

				expect( consoleInfoStub ).toHaveBeenCalledOnce();
				expect( consoleWarnStub ).toHaveBeenCalledOnce();

				assertConsoleMessages( consoleInfoStub, consoleWarnStub, 'development' );
			} );

			it( 'should show the warning only once for development license', () => {
				const { licenseKey } = generateLicenseKey( {
					licenseType: 'development'
				} );

				// Simulate hard reload.
				global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

				// eslint-disable-next-line no-new
				new TestEditor( { licenseKey } );

				expect( consoleInfoStub ).toHaveBeenCalledOnce();
				expect( consoleWarnStub ).toHaveBeenCalledOnce();

				assertConsoleMessages( consoleInfoStub, consoleWarnStub, 'development' );

				// Use the same license type for the second editor to check if the message is shown only once.

				// eslint-disable-next-line no-new
				new TestEditor( { licenseKey } );

				expect( consoleInfoStub ).toHaveBeenCalledOnce();
				expect( consoleWarnStub ).toHaveBeenCalledOnce();
			} );

			it( 'should not block the editor if 10 minutes have not passed (development license)', () => {
				const { licenseKey } = generateLicenseKey( {
					licenseType: 'development'
				} );

				const today = 1715166436000; // 08.05.2024
				const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( today );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );

				vi.advanceTimersByTime( 1 );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );

				dateNow.mockRestore();
			} );

			it( 'should not block editor after 10 minutes (development license)', () => {
				const { licenseKey, todayTimestamp } = generateLicenseKey( {
					licenseType: 'development'
				} );

				const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( todayTimestamp );

				const editor = new TestEditor( { licenseKey } );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );

				vi.advanceTimersByTime( 600100 );

				expect( showErrorStub ).not.toHaveBeenCalled();
				expect( editor.isReadOnly ).toBe( false );

				dateNow.mockRestore();
			} );

			it( 'should not interact with timers', () => {
				return new Promise( done => {
					const { licenseKey, todayTimestamp } = generateLicenseKey( {
						licenseType: 'development'
					} );

					const dateNow = vi.spyOn( Date, 'now' ).mockReturnValue( todayTimestamp );
					const editor = new TestEditor( { licenseKey } );
					const clearTimeoutSpy = vi.spyOn( globalThis, 'clearTimeout' );

					editor.fire( 'ready' );
					editor.on( 'destroy', () => {
						expect( clearTimeoutSpy ).not.toHaveBeenCalled();
						done();
					} );

					editor.destroy();
					dateNow.mockRestore();
				} );
			} );
		} );

		describe( 'plugin check', () => {
			class FreePlugin extends Plugin {
				static get pluginName() {
					return 'FreePlugin';
				}
			};

			class LicensedPlugin extends Plugin {
				static get pluginName() {
					return 'LicensedPlugin';
				}
			};

			Object.defineProperty( LicensedPlugin, 'licenseFeatureCode', {
				get() {
					return 'LP';
				}
			} );

			class LicensedPluginNoName extends Plugin {};

			Object.defineProperty( LicensedPluginNoName, 'licenseFeatureCode', {
				get() {
					return 'LPNN';
				}
			} );

			it( 'should not throw if license key is invalid', () => {
				const licenseKey = 'invalid';

				const editor = new TestEditor( {
					licenseKey,
					plugins: [ FreePlugin, LicensedPlugin ]
				} );

				return editor.initPlugins()
					.catch( () => {
						throw new Error( 'Expected not to throw.' );
					} );
			} );

			it( 'should not block if license key is GPL', () => {
				const licenseKey = 'GPL';

				const editor = new TestEditor( {
					licenseKey,
					plugins: [ FreePlugin, LicensedPlugin ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( showErrorStub ).not.toHaveBeenCalled();
						expect( editor.isReadOnly ).toBe( false );
					} );
			} );

			it( 'should not block if licensed plugin does not have a name', () => {
				const { licenseKey } = generateLicenseKey();

				const editor = new TestEditor( {
					licenseKey,
					plugins: [ FreePlugin, LicensedPluginNoName ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( showErrorStub ).not.toHaveBeenCalled();
						expect( editor.isReadOnly ).toBe( false );
					} );
			} );

			it( 'should not block if editor does not load licensed plugin', () => {
				const { licenseKey } = generateLicenseKey();

				const editor = new TestEditor( {
					licenseKey,
					plugins: [ FreePlugin ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( showErrorStub ).not.toHaveBeenCalled();
						expect( editor.isReadOnly ).toBe( false );
					} );
			} );

			it( 'should not block if editor loads licensed plugin allowed by license key', () => {
				const { licenseKey } = generateLicenseKey();

				const editor = new TestEditor( {
					licenseKey,
					plugins: [ FreePlugin, LicensedPlugin ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( showErrorStub ).not.toHaveBeenCalled();
						expect( editor.isReadOnly ).toBe( false );
					} );
			} );

			it( 'should block if editor loads licensed plugin not allowed by license key', () => {
				const { licenseKey } = generateLicenseKey( {
					removeFeatures: [ 'LP' ]
				} );

				const editor = new TestEditor( {
					licenseKey,
					plugins: [ FreePlugin, LicensedPlugin ]
				} );

				return editor.initPlugins()
					.then( () => {
						expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'pluginNotAllowed' );
						expect( showErrorStub.mock.calls[ 0 ][ 1 ] ).toBe( 'LicensedPlugin' );
						expect( editor.isReadOnly ).toBe( true );
					} );
			} );
		} );

		it( 'should block the editor when the license key is not valid (expiration date in the past)', () => {
			const { licenseKey } = generateLicenseKey( {
				isExpired: true
			} );

			const editor = new TestEditor( { licenseKey } );

			expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'expired' );
			expect( editor.isReadOnly ).toBe( true );
		} );

		it( 'should block the editor when the license key has wrong format (wrong verificationCode)', () => {
			const { licenseKey } = generateLicenseKey( {
				customVc: 'wrong vc'
			} );

			const editor = new TestEditor( { licenseKey } );

			expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'invalid' );
			expect( editor.isReadOnly ).toBe( true );
		} );

		it( 'should block the editor when the license key has wrong format (missing header part)', () => {
			const { licenseKey } = generateLicenseKey( {
				isExpired: true,
				skipHeader: true
			} );

			const editor = new TestEditor( { licenseKey } );

			expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'invalid' );
			expect( editor.isReadOnly ).toBe( true );
		} );

		it( 'should block the editor when the license key has wrong format (missing tail part)', () => {
			const { licenseKey } = generateLicenseKey( {
				isExpired: true,
				skipTail: true
			} );

			const editor = new TestEditor( { licenseKey } );

			expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'invalid' );
			expect( editor.isReadOnly ).toBe( true );
		} );

		it( 'should block the editor when the license key has wrong format (payload does not start with `ey`)', () => {
			const licenseKey = 'foo.JleHAiOjIyMDg5ODg4MDAsImp0aSI6ImZvbyIsInZlcmlmaWNhdGlvbkNvZGUiOiJjNTU2YWQ3NCJ9.bar';

			const editor = new TestEditor( { licenseKey } );

			expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'invalid' );
			expect( editor.isReadOnly ).toBe( true );
		} );

		it( 'should block the editor when the license key has wrong format (payload not parsable as a JSON object)', () => {
			const licenseKey = 'foo.eyZm9v.bar';

			const editor = new TestEditor( { licenseKey } );

			expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'invalid' );
			expect( editor.isReadOnly ).toBe( true );
		} );
	} );

	describe( 'usage endpoint', () => {
		it( 'should send request with telemetry data if license key contains a usage endpoint', () => {
			const fetchStub = vi.spyOn( window, 'fetch' ).mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { status: 'ok' } )
			} );

			const { licenseKey } = generateLicenseKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );
			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );

			expect( fetchStub ).toHaveBeenCalledOnce();

			const sentData = JSON.parse( fetchStub.mock.calls[ 0 ][ 1 ].body );

			expect( sentData.license ).toBe( licenseKey );
			expect( sentData.editor ).toEqual(
				// JSON.stringify() helps with getting rid of the `undefined` values.
				// It's done by the fetch anyways.
				JSON.parse( JSON.stringify( getEditorUsageData( editor ) ) )
			);
		} );

		it( 'should not send any request if license key does not contain a usage endpoint', () => {
			const fetchStub = vi.spyOn( window, 'fetch' ).mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( { status: 'ok' } )
			} );

			const { licenseKey } = generateLicenseKey();
			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );

			expect( fetchStub ).not.toHaveBeenCalled();
		} );

		it( 'should display error on the console and not block the editor if response status is not ok (HTTP 500)', async () => {
			const { licenseKey } = generateLicenseKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );
			const fetchStub = vi.spyOn( window, 'fetch' ).mockResolvedValue( new Response( null, { status: 500 } ) );
			const errorStub = vi.spyOn( console, 'error' ).mockImplementation( () => {} );

			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );
			await wait( 1 );

			expect( fetchStub ).toHaveBeenCalledOnce();
			expect( errorStub ).toHaveBeenCalledOnce();
			expect( errorStub.mock.calls[ 0 ][ 0 ] ).toContain( 'license-key-validation-endpoint-not-reachable' );
			expect( errorStub.mock.calls[ 0 ][ 1 ] ).toEqual( expect.objectContaining( { 'url': 'https://ckeditor.com' } ) );
			expect( editor.isReadOnly ).toBe( false );
		} );

		it( 'should display warning and block the editor when usage status is not ok', async () => {
			const fetchStub = vi.spyOn( window, 'fetch' ).mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( {
					status: 'foo'
				} )
			} );
			const showErrorStub = vi.spyOn( TestEditor.prototype, '_showLicenseError' ).mockImplementation( () => {} );

			const { licenseKey } = generateLicenseKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );
			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );
			await wait( 1 );

			expect( fetchStub ).toHaveBeenCalledOnce();
			expect( showErrorStub ).toHaveBeenCalledOnce();
			expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'usageLimit' );
			expect( editor.isReadOnly ).toBe( true );
		} );

		it( 'should display additional warning when usage status is not ok and message is provided', async () => {
			const fetchStub = vi.spyOn( window, 'fetch' ).mockResolvedValue( {
				ok: true,
				json: () => Promise.resolve( {
					status: 'foo',
					message: 'bar'
				} )
			} );
			const warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			const showErrorStub = vi.spyOn( TestEditor.prototype, '_showLicenseError' ).mockImplementation( () => {} );

			const { licenseKey } = generateLicenseKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );
			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );
			await wait( 1 );

			expect( fetchStub ).toHaveBeenCalledOnce();
			expect( warnStub ).toHaveBeenCalledOnce();
			expect( showErrorStub ).toHaveBeenCalledOnce();
			expect( warnStub ).toHaveBeenCalledWith( 'bar' );
			expect( showErrorStub.mock.calls[ 0 ][ 0 ] ).toBe( 'usageLimit' );
			expect( editor.isReadOnly ).toBe( true );
		} );
	} );

	describe( 'license errors', () => {
		beforeEach( () => {
			vi.useFakeTimers( { toFake: [ 'setTimeout' ] } );
		} );

		afterEach( () => {
			vi.useRealTimers();
		} );

		const testCases = [
			{ reason: 'invalid', error: 'invalid-license-key' },
			{ reason: 'expired', error: 'license-key-expired' },
			{ reason: 'domainLimit', error: 'license-key-domain-limit' },
			{ reason: 'pluginNotAllowed', error: 'license-key-plugin-not-allowed', pluginName: 'PluginABC' },
			{ reason: 'featureNotAllowed', error: 'license-key-feature-not-allowed', featureName: 'FeatureABC' },
			{ reason: 'evaluationLimit', error: 'license-key-evaluation-limit' },
			{ reason: 'trialLimit', error: 'license-key-trial-limit' },
			{ reason: 'developmentLimit', error: 'license-key-development-limit' },
			{ reason: 'usageLimit', error: 'license-key-usage-limit' },
			{ reason: 'distributionChannel', error: 'license-key-invalid-distribution-channel' }
		];

		for ( const testCase of testCases ) {
			const { reason, error, ...name } = testCase;

			const pluginOrFeatureName = name.pluginName || name.featureName;
			const expectedData = pluginOrFeatureName ? name : undefined;

			it( `should throw \`${ error }\` error`, () => {
				const editor = new TestEditor( { licenseKey: 'GPL' } );

				editor._showLicenseError( reason, pluginOrFeatureName );

				expectToThrowCKEditorError( () => vi.advanceTimersByTime( 1 ), error, undefined, expectedData );
			} );
		}

		it( 'should throw `license-key-plugin-not-allowed` pointing to the main plugin if a check is an editing part', async () => {
			const editor = await TestEditor.create( {
				licenseKey: 'GPL',
				plugins: [
					class TableColumnResize {
						static get pluginName() {
							return 'TableColumnResize';
						}
					}
				]
			} );

			editor._showLicenseError( 'pluginNotAllowed', 'TableColumnResizeEditing' );

			expectToThrowCKEditorError( () => vi.advanceTimersByTime( 1 ), 'license-key-plugin-not-allowed', undefined, {
				pluginName: 'TableColumnResize'
			} );
		} );

		it( 'should throw `license-key-plugin-not-allowed` pointing to the main plugin if a check is a UI part', async () => {
			const editor = await TestEditor.create( {
				licenseKey: 'GPL',
				plugins: [
					class TableColumnResize {
						static get pluginName() {
							return 'TableColumnResize';
						}
					}
				]
			} );

			editor._showLicenseError( 'pluginNotAllowed', 'TableColumnResizeUI' );

			expectToThrowCKEditorError( () => vi.advanceTimersByTime( 1 ), 'license-key-plugin-not-allowed', undefined, {
				pluginName: 'TableColumnResize'
			} );
		} );

		it( 'should throw error only once', () => {
			const editor = new TestEditor( { licenseKey: 'GPL' } );

			editor._showLicenseError( 'invalid' );

			try {
				vi.advanceTimersByTime( 1 );
			} catch {
				// Do nothing.
			}

			editor._showLicenseError( 'invalid' );

			expect( () => vi.advanceTimersByTime( 1 ) ).not.toThrow();
		} );
	} );

	describe( 'collect usage data', () => {
		let editor, sendUsageRequestStub;

		beforeEach( () => {
			const { licenseKey } = generateLicenseKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );

			editor = new TestEditor( { licenseKey } );
			sendUsageRequestStub = vi.spyOn( editor, '_sendUsageRequest' ).mockResolvedValue( { status: 'ok' } );
		} );

		it( 'should fire `collectUsageData` event with proper payload', () => {
			const spy = vi.fn();

			editor.on( 'collectUsageData', spy );
			editor.fire( 'ready' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy ).toHaveBeenCalledWith(
				expect.any( Object ),
				expect.objectContaining( {
					setUsageData: expect.any( Function )
				} )
			);
		} );

		it( 'should be possible to set flat usage data using helper passed in the event', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				setUsageData( 'foo', 123 );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).toHaveBeenCalledOnce();
			expect( sendUsageRequestStub ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					editor: expect.objectContaining( {
						foo: 123
					} )
				} )
			);
		} );

		it( 'should be possible to set nested usage data using helper passed in the event', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				setUsageData( 'foo.bar', 123 );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).toHaveBeenCalledOnce();
			expect( sendUsageRequestStub ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					editor: expect.objectContaining( {
						foo: expect.objectContaining( {
							bar: 123
						} )
					} )
				} )
			);
		} );

		it( 'should be possible to set multiple usage data using helper passed in the event', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				setUsageData( 'foo', 123 );
				setUsageData( 'bar', 456 );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).toHaveBeenCalledOnce();
			expect( sendUsageRequestStub ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					editor: expect.objectContaining( {
						foo: 123,
						bar: 456
					} )
				} )
			);
		} );

		it( 'should be possible to set integrations usage data using helper passed in the event without raising error', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				setUsageData( 'integration.foo', 123 );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).toHaveBeenCalledOnce();
			expect( sendUsageRequestStub ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( {
					editor: expect.objectContaining( {
						integration: expect.objectContaining( {
							foo: 123
						} )
					} )
				} )
			);
		} );

		it( 'should be impossible to override already collected usage data', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				expect( () => {
					setUsageData( 'plugins', 456 );
				} ).toThrow( CKEditorError );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).toHaveBeenCalledOnce();
		} );

		it( 'should raise error when trying to set the same data two times in row', () => {
			const spy = vi.fn( ( _, { setUsageData } ) => {
				expect( () => {
					setUsageData( 'foo', 123 );
					setUsageData( 'foo', 456 );
				} ).toThrow( CKEditorError );
			} );

			editor.on( 'collectUsageData', spy );
			editor.fire( 'ready' );

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );
} );

function assertConsoleMessages( consoleInfoStub, consoleWarnStub, licenseType ) {
	if ( licenseType === 'development' ) {
		expect( consoleInfoStub ).toHaveBeenCalledWith(
			'%cCKEditor 5 Development License',
			'color: #ffffff; background: #743CCD; font-size: 14px; padding: 4px 8px; border-radius: 4px;'
		);

		expect( consoleWarnStub ).toHaveBeenCalledWith(
			'⚠️ You are using a development license of CKEditor 5. ' +
			'For production usage, please obtain a production license at https://portal.ckeditor.com/'
		);
	} else if ( [ 'trial', 'evaluation' ].includes( licenseType ) ) {
		const licenseTypeCapitalized = licenseType[ 0 ].toUpperCase() + licenseType.slice( 1 );

		expect( consoleInfoStub ).toHaveBeenCalledWith(
			`%cCKEditor 5 ${ licenseTypeCapitalized } License`,
			'color: #ffffff; background: #743CCD; font-size: 14px; padding: 4px 8px; border-radius: 4px;'
		);

		const article = licenseType === 'evaluation' ? 'an' : 'a';

		expect( consoleWarnStub ).toHaveBeenCalledWith(
			`⚠️ You are using ${ article } ${ licenseType } license of CKEditor 5` +
			`${ licenseType === 'trial' ? ' which is for evaluation purposes only' : '' }. ` +
			'For production usage, please obtain a production license at https://portal.ckeditor.com/'
		);
	}
}

function wait( time ) {
	return new Promise( res => {
		window.setTimeout( res, time );
	} );
}
