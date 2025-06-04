/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { global } from '@ckeditor/ckeditor5-utils';
import Editor from '../../src/editor/editor.js';
import testUtils from '../../tests/_utils/utils.js';
import generateKey from '../_utils/generatelicensekey.js';
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

		sinon.restore();
	} );

	describe( 'license key verification', () => {
		let showErrorStub, consoleInfoStub, consoleWarnStub;

		beforeEach( () => {
			showErrorStub = testUtils.sinon.stub( TestEditor.prototype, '_showLicenseError' );
			consoleInfoStub = sinon.stub( console, 'info' );
			consoleWarnStub = sinon.stub( console, 'warn' );
		} );

		describe( 'required fields in the license key', () => {
			it( 'should not block the editor when required fields are provided and are valid', () => {
				const { licenseKey } = generateKey();

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.notCalled( showErrorStub );
				expect( editor.isReadOnly ).to.be.false;
			} );

			it( 'should block the editor when the `exp` field is missing', () => {
				const { licenseKey } = generateKey( { expExist: false } );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.calledWithMatch( showErrorStub, 'invalid' );
				expect( editor.isReadOnly ).to.be.true;
			} );

			it( 'should block the editor when the `jti` field is missing', () => {
				const { licenseKey } = generateKey( { jtiExist: false } );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.calledWithMatch( showErrorStub, 'invalid' );
				expect( editor.isReadOnly ).to.be.true;
			} );

			it( 'should block the editor when the `vc` field is missing', () => {
				const { licenseKey } = generateKey( { vcExist: false } );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.calledWithMatch( showErrorStub, 'invalid' );
				expect( editor.isReadOnly ).to.be.true;
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
					sinon.stub( URL.prototype, 'hostname' ).value( set.hostname );

					const { licenseKey } = generateKey( { licensedHosts: [ set.licensedHost ] } );
					const editor = new TestEditor( { licenseKey } );

					sinon.assert.notCalled( showErrorStub );

					expect( editor.isReadOnly ).to.be.false;
				} );
			} );

			sets.fail.forEach( set => {
				it( `fails on ${ set.name }`, () => {
					sinon.stub( URL.prototype, 'hostname' ).value( set.hostname );

					const { licenseKey } = generateKey( { licensedHosts: [ set.licensedHost ] } );
					const editor = new TestEditor( { licenseKey } );

					sinon.assert.calledWithMatch( showErrorStub, 'domainLimit' );

					expect( editor.isReadOnly ).to.be.true;
				} );
			} );
		} );

		describe( 'distribution channel check', () => {
			afterEach( () => {
				delete window[ Symbol.for( 'cke distribution' ) ];
			} );

			it( 'should not block if distribution channel match', () => {
				setChannel( 'xyz' );

				const { licenseKey } = generateKey( { distributionChannel: 'xyz' } );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.notCalled( showErrorStub );
				expect( editor.isReadOnly ).to.be.false;
			} );

			it( 'should not block if one of distribution channel match', () => {
				setChannel( 'xyz' );

				const { licenseKey } = generateKey( { distributionChannel: [ 'abc', 'xyz' ] } );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.notCalled( showErrorStub );
				expect( editor.isReadOnly ).to.be.false;
			} );

			it( 'should not block if implicit distribution channel match', () => {
				const { licenseKey } = generateKey( { distributionChannel: 'sh' } );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.notCalled( showErrorStub );
				expect( editor.isReadOnly ).to.be.false;
			} );

			it( 'should not block if distribution channel is not restricted', () => {
				setChannel( 'xyz' );

				const { licenseKey } = generateKey();

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.notCalled( showErrorStub );
				expect( editor.isReadOnly ).to.be.false;
			} );

			it( 'should block if distribution channel doesn\'t match', () => {
				setChannel( 'abc' );

				const { licenseKey } = generateKey( { distributionChannel: 'xyz' } );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.calledWithMatch( showErrorStub, 'distributionChannel' );
				expect( editor.isReadOnly ).to.be.true;
			} );

			it( 'should block if none of distribution channel doesn\'t match', () => {
				setChannel( 'abc' );

				const { licenseKey } = generateKey( { distributionChannel: [ 'xyz', 'def' ] } );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.calledWithMatch( showErrorStub, 'distributionChannel' );
				expect( editor.isReadOnly ).to.be.true;
			} );

			it( 'should block if implicit distribution channel doesn\'t match', () => {
				const { licenseKey } = generateKey( { distributionChannel: 'xyz' } );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.calledWithMatch( showErrorStub, 'distributionChannel' );
				expect( editor.isReadOnly ).to.be.true;
			} );

			describe( 'GPL license', () => {
				it( 'should block if distribution channel is cloud', () => {
					setChannel( 'cloud' );

					const licenseKey = 'GPL';
					const editor = new TestEditor( { licenseKey } );

					sinon.assert.calledWithMatch( showErrorStub, 'distributionChannel' );
					expect( editor.isReadOnly ).to.be.true;
				} );

				it( 'should not block if distribution channel is not cloud', () => {
					setChannel( 'xyz' );

					const licenseKey = 'GPL';
					const editor = new TestEditor( { licenseKey } );

					sinon.assert.notCalled( showErrorStub );
					expect( editor.isReadOnly ).to.be.false;
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
				} ).to.not.throw();
			} );

			it( 'should not throw if license key is missing (CKEditor testing environment)', () => {
				expect( () => {
					// eslint-disable-next-line no-new
					new TestEditor( {} );
				} ).to.not.throw();
			} );

			it( 'should throw if license key is missing (outside of CKEditor testing environment)', () => {
				window.CKEDITOR_GLOBAL_LICENSE_KEY = undefined;

				expect( () => {
					// eslint-disable-next-line no-new
					new TestEditor( {} );
				} ).to.throw( CKEditorError, 'license-key-missing' );

				window.CKEDITOR_GLOBAL_LICENSE_KEY = 'GPL';
			} );
		} );

		describe( 'evaluation/trial check', () => {
			const licenseTypes = [ 'evaluation', 'trial' ];

			beforeEach( () => {
				sinon.useFakeTimers( { now: Date.now() } );
			} );

			afterEach( () => {
				sinon.restore();
			} );

			licenseTypes.forEach( licenseType => {
				it( `should not block if ${ licenseType } license did not expired`, () => {
					const { licenseKey, todayTimestamp } = generateKey( {
						licenseType,
						isExpired: false,
						daysAfterExpiration: -1
					} );

					const today = todayTimestamp;
					const dateNow = sinon.stub( Date, 'now' ).returns( today );

					const editor = new TestEditor( { licenseKey } );

					sinon.assert.notCalled( showErrorStub );
					expect( editor.isReadOnly ).to.be.false;

					dateNow.restore();
				} );

				it( `should block if ${ licenseType } license is expired`, () => {
					const { licenseKey, todayTimestamp } = generateKey( {
						licenseType,
						daysAfterExpiration: 1
					} );

					const dateNow = sinon.stub( Date, 'now' ).returns( todayTimestamp );

					const editor = new TestEditor( { licenseKey } );

					sinon.assert.calledWithMatch( showErrorStub, 'expired' );
					expect( editor.isReadOnly ).to.be.true;

					dateNow.restore();
				} );

				it( `should block editor after 10 minutes on ${ licenseType } license`, () => {
					const { licenseKey, todayTimestamp } = generateKey( {
						licenseType,
						isExpired: false,
						daysAfterExpiration: -1
					} );

					const dateNow = sinon.stub( Date, 'now' ).returns( todayTimestamp );

					const editor = new TestEditor( { licenseKey } );

					sinon.assert.notCalled( showErrorStub );
					expect( editor.isReadOnly ).to.be.false;

					sinon.clock.tick( 600100 );

					sinon.assert.calledWithMatch( showErrorStub, licenseType + 'Limit' );
					expect( editor.isReadOnly ).to.be.true;

					dateNow.restore();
				} );

				it( `should clear timer on editor destroy on ${ licenseType } license`, done => {
					const { licenseKey, todayTimestamp } = generateKey( {
						licenseType,
						isExpired: false,
						daysAfterExpiration: -1
					} );

					const dateNow = sinon.stub( Date, 'now' ).returns( todayTimestamp );
					const editor = new TestEditor( { licenseKey } );
					const clearTimeoutSpy = sinon.spy( globalThis, 'clearTimeout' );

					editor.fire( 'ready' );
					editor.on( 'destroy', () => {
						sinon.assert.calledOnce( clearTimeoutSpy );
						done();
					} );

					editor.destroy();
					dateNow.restore();
				} );

				it( `should log information to the console about using the ${ licenseType } license`, () => {
					const { licenseKey, todayTimestamp } = generateKey( {
						licenseType
					} );

					const dateNow = sinon.stub( Date, 'now' ).returns( todayTimestamp );

					// Simulate hard reload.
					global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

					const editor = new TestEditor( { licenseKey } );
					expect( editor.isReadOnly ).to.be.false;

					sinon.assert.calledOnce( consoleInfoStub );
					sinon.assert.calledOnce( consoleWarnStub );

					assertConsoleMessages( consoleInfoStub, consoleWarnStub, licenseType );

					dateNow.restore();
				} );

				it( `should log information to the console about using the ${ licenseType } license only once`, () => {
					const { licenseKey, todayTimestamp } = generateKey( {
						licenseType
					} );

					const dateNow = sinon.stub( Date, 'now' ).returns( todayTimestamp );

					// Simulate hard reload.
					global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

					// eslint-disable-next-line no-new
					new TestEditor( { licenseKey } );

					sinon.assert.calledOnce( consoleInfoStub );
					sinon.assert.calledOnce( consoleWarnStub );

					assertConsoleMessages( consoleInfoStub, consoleWarnStub, licenseType );

					// Use the same license type for the second editor to check if the message is shown only once.

					// eslint-disable-next-line no-new
					new TestEditor( { licenseKey } );

					sinon.assert.calledOnce( consoleInfoStub );
					sinon.assert.calledOnce( consoleWarnStub );

					dateNow.restore();
				} );
			} );

			it( 'should log information to the console twice when using two different license types', () => {
				const trialLicense = generateKey( {
					licenseType: 'trial'
				} );

				const evaluationLicense = generateKey( {
					licenseType: 'evaluation'
				} );

				const dateNow = sinon.stub( Date, 'now' ).returns( trialLicense.licenseKeyTimestamp );

				// Simulate hard reload.
				global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

				// eslint-disable-next-line no-new
				new TestEditor( { licenseKey: trialLicense.licenseKey } );

				sinon.assert.calledOnce( consoleInfoStub );
				sinon.assert.calledOnce( consoleWarnStub );

				assertConsoleMessages( consoleInfoStub, consoleWarnStub, 'trial' );

				// Use a different license type for the second editor to check if the message is shown twice.

				// eslint-disable-next-line no-new
				new TestEditor( { licenseKey: evaluationLicense.licenseKey } );

				sinon.assert.calledTwice( consoleInfoStub );
				sinon.assert.calledTwice( consoleWarnStub );

				assertConsoleMessages( consoleInfoStub, consoleWarnStub, 'evaluation' );

				dateNow.restore();
			} );
		} );

		describe( 'development license', () => {
			beforeEach( () => {
				sinon.useFakeTimers( { now: Date.now() } );
			} );

			afterEach( () => {
				sinon.restore();
			} );

			it( 'should log information to the console about using the development license', () => {
				const { licenseKey } = generateKey( {
					licenseType: 'development'
				} );

				// Simulate hard reload.
				global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

				const editor = new TestEditor( { licenseKey } );

				expect( editor.isReadOnly ).to.be.false;

				sinon.assert.calledOnce( consoleInfoStub );
				sinon.assert.calledOnce( consoleWarnStub );

				assertConsoleMessages( consoleInfoStub, consoleWarnStub, 'development' );
			} );

			it( 'should show the warning only once for development license', () => {
				const { licenseKey } = generateKey( {
					licenseType: 'development'
				} );

				// Simulate hard reload.
				global.window.CKEDITOR_WARNING_SUPPRESSIONS = undefined;

				// eslint-disable-next-line no-new
				new TestEditor( { licenseKey } );

				sinon.assert.calledOnce( consoleInfoStub );
				sinon.assert.calledOnce( consoleWarnStub );

				assertConsoleMessages( consoleInfoStub, consoleWarnStub, 'development' );

				// Use the same license type for the second editor to check if the message is shown only once.

				// eslint-disable-next-line no-new
				new TestEditor( { licenseKey } );

				sinon.assert.calledOnce( consoleInfoStub );
				sinon.assert.calledOnce( consoleWarnStub );
			} );

			it( 'should not block the editor if 10 minutes have not passed (development license)', () => {
				const { licenseKey } = generateKey( {
					licenseType: 'development'
				} );

				const today = 1715166436000; // 08.05.2024
				const dateNow = sinon.stub( Date, 'now' ).returns( today );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.notCalled( showErrorStub );
				expect( editor.isReadOnly ).to.be.false;

				sinon.clock.tick( 1 );

				sinon.assert.notCalled( showErrorStub );
				expect( editor.isReadOnly ).to.be.false;

				dateNow.restore();
			} );

			it( 'should not block editor after 10 minutes (development license)', () => {
				const { licenseKey, todayTimestamp } = generateKey( {
					licenseType: 'development'
				} );

				const dateNow = sinon.stub( Date, 'now' ).returns( todayTimestamp );

				const editor = new TestEditor( { licenseKey } );

				sinon.assert.notCalled( showErrorStub );
				expect( editor.isReadOnly ).to.be.false;

				sinon.clock.tick( 600100 );

				sinon.assert.notCalled( showErrorStub );
				expect( editor.isReadOnly ).to.be.false;

				dateNow.restore();
			} );

			it( 'should not interact with timers', done => {
				const { licenseKey, todayTimestamp } = generateKey( {
					licenseType: 'development'
				} );

				const dateNow = sinon.stub( Date, 'now' ).returns( todayTimestamp );
				const editor = new TestEditor( { licenseKey } );
				const clearTimeoutSpy = sinon.spy( globalThis, 'clearTimeout' );

				editor.fire( 'ready' );
				editor.on( 'destroy', () => {
					sinon.assert.notCalled( clearTimeoutSpy );
					done();
				} );

				editor.destroy();
				dateNow.restore();
			} );
		} );

		it( 'should block the editor when the license key is not valid (expiration date in the past)', () => {
			const { licenseKey } = generateKey( {
				isExpired: true
			} );

			const editor = new TestEditor( { licenseKey } );

			sinon.assert.calledWithMatch( showErrorStub, 'expired' );
			expect( editor.isReadOnly ).to.be.true;
		} );

		it( 'should block the editor when the license key has wrong format (wrong verificationCode)', () => {
			const { licenseKey } = generateKey( {
				customVc: 'wrong vc'
			} );

			const editor = new TestEditor( { licenseKey } );

			sinon.assert.calledWithMatch( showErrorStub, 'invalid' );
			expect( editor.isReadOnly ).to.be.true;
		} );

		it( 'should block the editor when the license key has wrong format (missing header part)', () => {
			const { licenseKey } = generateKey( {
				isExpired: true,
				skipHeader: true
			} );

			const editor = new TestEditor( { licenseKey } );

			sinon.assert.calledWithMatch( showErrorStub, 'invalid' );
			expect( editor.isReadOnly ).to.be.true;
		} );

		it( 'should block the editor when the license key has wrong format (missing tail part)', () => {
			const { licenseKey } = generateKey( {
				isExpired: true,
				skipTail: true
			} );

			const editor = new TestEditor( { licenseKey } );

			sinon.assert.calledWithMatch( showErrorStub, 'invalid' );
			expect( editor.isReadOnly ).to.be.true;
		} );

		it( 'should block the editor when the license key has wrong format (payload does not start with `ey`)', () => {
			const licenseKey = 'foo.JleHAiOjIyMDg5ODg4MDAsImp0aSI6ImZvbyIsInZlcmlmaWNhdGlvbkNvZGUiOiJjNTU2YWQ3NCJ9.bar';

			const editor = new TestEditor( { licenseKey } );

			sinon.assert.calledWithMatch( showErrorStub, 'invalid' );
			expect( editor.isReadOnly ).to.be.true;
		} );

		it( 'should block the editor when the license key has wrong format (payload not parsable as a JSON object)', () => {
			const licenseKey = 'foo.eyZm9v.bar';

			const editor = new TestEditor( { licenseKey } );

			sinon.assert.calledWithMatch( showErrorStub, 'invalid' );
			expect( editor.isReadOnly ).to.be.true;
		} );
	} );

	describe( 'usage endpoint', () => {
		it( 'should send request with telemetry data if license key contains a usage endpoint', () => {
			const fetchStub = sinon.stub( window, 'fetch' );

			const { licenseKey } = generateKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );
			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );

			sinon.assert.calledOnce( fetchStub );

			const sentData = JSON.parse( fetchStub.firstCall.lastArg.body );

			expect( sentData.license ).to.equal( licenseKey );
			expect( sentData.editor ).to.deep.equal(
				// JSON.stringify() helps with getting rid of the `undefined` values.
				// It's done by the fetch anyways.
				JSON.parse( JSON.stringify( getEditorUsageData( editor ) ) )
			);
		} );

		it( 'should not send any request if license key does not contain a usage endpoint', () => {
			const fetchStub = sinon.stub( window, 'fetch' );

			const { licenseKey } = generateKey();
			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );

			sinon.assert.notCalled( fetchStub );
		} );

		it( 'should display error on the console and not block the editor if response status is not ok (HTTP 500)', async () => {
			const { licenseKey } = generateKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );
			const fetchStub = sinon.stub( window, 'fetch' ).resolves( new Response( null, { status: 500 } ) );
			const errorStub = sinon.stub( console, 'error' );

			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );
			await wait( 1 );

			sinon.assert.calledOnce( fetchStub );
			sinon.assert.calledWithMatch(
				errorStub, 'license-key-validation-endpoint-not-reachable', { 'url': 'https://ckeditor.com' } );
			expect( editor.isReadOnly ).to.be.false;
		} );

		it( 'should display warning and block the editor when usage status is not ok', async () => {
			const fetchStub = sinon.stub( window, 'fetch' ).resolves( {
				ok: true,
				json: () => Promise.resolve( {
					status: 'foo'
				} )
			} );
			const showErrorStub = testUtils.sinon.stub( TestEditor.prototype, '_showLicenseError' );

			const { licenseKey } = generateKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );
			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );
			await wait( 1 );

			sinon.assert.calledOnce( fetchStub );
			sinon.assert.calledOnce( showErrorStub );
			sinon.assert.calledWithMatch( showErrorStub, 'usageLimit' );
			expect( editor.isReadOnly ).to.be.true;
		} );

		it( 'should display additional warning when usage status is not ok and message is provided', async () => {
			const fetchStub = sinon.stub( window, 'fetch' ).resolves( {
				ok: true,
				json: () => Promise.resolve( {
					status: 'foo',
					message: 'bar'
				} )
			} );
			const warnStub = testUtils.sinon.stub( console, 'warn' );
			const showErrorStub = testUtils.sinon.stub( TestEditor.prototype, '_showLicenseError' );

			const { licenseKey } = generateKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );
			const editor = new TestEditor( { licenseKey } );

			editor.fire( 'ready' );
			await wait( 1 );

			sinon.assert.calledOnce( fetchStub );
			sinon.assert.calledOnce( warnStub );
			sinon.assert.calledOnce( showErrorStub );
			sinon.assert.calledWithMatch( warnStub, 'bar' );
			sinon.assert.calledWithMatch( showErrorStub, 'usageLimit' );
			expect( editor.isReadOnly ).to.be.true;
		} );
	} );

	describe( 'license errors', () => {
		let clock;

		beforeEach( () => {
			clock = sinon.useFakeTimers( { toFake: [ 'setTimeout' ] } );
		} );

		const testCases = [
			{ reason: 'invalid', error: 'invalid-license-key' },
			{ reason: 'expired', error: 'license-key-expired' },
			{ reason: 'domainLimit', error: 'license-key-domain-limit' },
			{ reason: 'featureNotAllowed', error: 'license-key-plugin-not-allowed', pluginName: 'PluginABC' },
			{ reason: 'evaluationLimit', error: 'license-key-evaluation-limit' },
			{ reason: 'trialLimit', error: 'license-key-trial-limit' },
			{ reason: 'developmentLimit', error: 'license-key-development-limit' },
			{ reason: 'usageLimit', error: 'license-key-usage-limit' },
			{ reason: 'distributionChannel', error: 'license-key-invalid-distribution-channel' }
		];

		for ( const testCase of testCases ) {
			const { reason, error, pluginName } = testCase;
			const expectedData = pluginName ? { pluginName } : undefined;

			it( `should throw \`${ error }\` error`, () => {
				const editor = new TestEditor( { licenseKey: 'GPL' } );

				editor._showLicenseError( reason, pluginName );

				expectToThrowCKEditorError( () => clock.tick( 1 ), error, undefined, expectedData );
			} );
		}

		it( 'should throw error only once', () => {
			const editor = new TestEditor( { licenseKey: 'GPL' } );

			editor._showLicenseError( 'invalid' );

			try {
				clock.tick( 1 );
			} catch {
				// Do nothing.
			}

			editor._showLicenseError( 'invalid' );

			expect( () => clock.tick( 1 ) ).to.not.throw();
		} );
	} );

	describe( 'collect usage data', () => {
		let editor, sendUsageRequestStub;

		beforeEach( () => {
			const { licenseKey } = generateKey( {
				usageEndpoint: 'https://ckeditor.com'
			} );

			editor = new TestEditor( { licenseKey } );
			sendUsageRequestStub = sinon.stub( editor, '_sendUsageRequest' ).returns( Promise.resolve() );
		} );

		it( 'should fire `collectUsageData` event with proper payload', () => {
			const spy = sinon.spy();

			editor.on( 'collectUsageData', spy );
			editor.fire( 'ready' );

			expect( spy ).to.be.calledOnce.calledWithMatch(
				sinon.match.object,
				{
					setUsageData: sinon.match.func
				}
			);
		} );

		it( 'should be possible to set flat usage data using helper passed in the event', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				setUsageData( 'foo', 123 );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).to.be.calledOnce.calledWithMatch(
				sinon.match.string,
				sinon.match( {
					editor: {
						foo: 123
					}
				} )
			);
		} );

		it( 'should be possible to set nested usage data using helper passed in the event', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				setUsageData( 'foo.bar', 123 );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).to.be.calledOnce.calledWithMatch(
				sinon.match.string,
				sinon.match( {
					editor: {
						foo: {
							bar: 123
						}
					}
				} )
			);
		} );

		it( 'should be possible to set multiple usage data using helper passed in the event', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				setUsageData( 'foo', 123 );
				setUsageData( 'bar', 456 );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).to.be.calledOnce.calledWithMatch(
				sinon.match.string,
				sinon.match( {
					editor: {
						foo: 123,
						bar: 456
					}
				} )
			);
		} );

		it( 'should be possible to set integrations usage data using helper passed in the event without raising error', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				setUsageData( 'integration.foo', 123 );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).to.be.calledOnce.calledWithMatch(
				sinon.match.string,
				sinon.match( {
					editor: {
						integration: {
							foo: 123
						}
					}
				} )
			);
		} );

		it( 'should be impossible to override already collected usage data', () => {
			editor.on( 'collectUsageData', ( _, { setUsageData } ) => {
				expect( () => {
					setUsageData( 'plugins', 456 );
				} ).to.throw( CKEditorError, 'editor-usage-data-path-already-set' );
			} );

			editor.fire( 'ready' );

			expect( sendUsageRequestStub ).to.be.calledOnce;
		} );

		it( 'should raise error when trying to set the same data two times in row', () => {
			const spy = sinon.spy( ( _, { setUsageData } ) => {
				expect( () => {
					setUsageData( 'foo', 123 );
					setUsageData( 'foo', 456 );
				} ).to.throw( CKEditorError, 'editor-usage-data-path-already-set' );
			} );

			editor.on( 'collectUsageData', spy );
			editor.fire( 'ready' );

			expect( spy ).to.be.calledOnce;
		} );
	} );
} );

function assertConsoleMessages( consoleInfoStub, consoleWarnStub, licenseType ) {
	if ( licenseType === 'development' ) {
		sinon.assert.calledWith(
			consoleInfoStub,
			'%cCKEditor 5 Development License',
			'color: #ffffff; background: #743CCD; font-size: 14px; padding: 4px 8px; border-radius: 4px;'
		);

		sinon.assert.calledWith(
			consoleWarnStub,
			'⚠️ You are using a development license of CKEditor 5. ' +
			'For production usage, please obtain a production license at https://portal.ckeditor.com/'
		);
	} else if ( [ 'trial', 'evaluation' ].includes( licenseType ) ) {
		const licenseTypeCapitalized = licenseType[ 0 ].toUpperCase() + licenseType.slice( 1 );

		sinon.assert.calledWith(
			consoleInfoStub,
			`%cCKEditor 5 ${ licenseTypeCapitalized } License`,
			'color: #ffffff; background: #743CCD; font-size: 14px; padding: 4px 8px; border-radius: 4px;'
		);

		const article = licenseType === 'evaluation' ? 'an' : 'a';

		sinon.assert.calledWith(
			consoleWarnStub,
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
