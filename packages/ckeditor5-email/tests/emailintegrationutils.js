/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import EmailIntegrationUtils, { isUnsupportedEmailColorValue, isUnsupportedEmailColorFormat } from '../src/emailintegrationutils.js';

describe( 'EmailIntegrationUtils', () => {
	let domElement, editor, warnStub, infoStub, utils;

	beforeEach( async () => {
		domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		warnStub = sinon.stub( console, 'warn' );
		infoStub = sinon.stub( console, 'info' );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				EmailIntegrationUtils
			]
		} );

		utils = editor.plugins.get( EmailIntegrationUtils );
	} );

	afterEach( async () => {
		warnStub.restore();
		infoStub.restore();

		domElement.remove();
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( EmailIntegrationUtils.pluginName ).to.equal( 'EmailIntegrationUtils' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmailIntegrationUtils.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmailIntegrationUtils.isPremiumPlugin ).to.be.false;
	} );

	it( 'should define default email.logs config entry', () => {
		expect( editor.config.get( 'email.logs' ) ).to.deep.equal( {
			suppress: [],
			suppressAll: false
		} );
	} );

	describe( '_logSuppressibleWarning()', () => {
		it( 'should log warning when suppression is not configured', () => {
			utils._logSuppressibleWarning( 'test-warning' );

			sinon.assert.calledOnce( warnStub );
		} );

		it( 'should not log warning when suppressAll is true', () => {
			editor.config.set( 'email.logs.suppressAll', true );

			utils._logSuppressibleWarning( 'test-warning' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when warning code is in suppress array', () => {
			editor.config.set( 'email.logs.suppress', [ 'test-warning' ] );

			utils._logSuppressibleWarning( 'test-warning' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when warning code matches suppress function', () => {
			editor.config.set( 'email.logs.suppress', code => code === 'test-warning' );

			utils._logSuppressibleWarning( 'test-warning' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should be possible to suppress warning using function accepting data', () => {
			editor.config.set( 'email.logs.suppress', ( code, data ) => code === 'test-warning' && data === 'test-data' );

			utils._logSuppressibleWarning( 'test-warning', 'test-data' );

			sinon.assert.notCalled( warnStub );
		} );
	} );

	describe( '_logInfo()', () => {
		it( 'should log info when suppression is not configured', () => {
			utils._logInfo( 'test-info', 'Test message' );

			expect( infoStub ).to.be.calledOnce;
			sinon.assert.calledWithMatch( infoStub, 'test-info', 'Test message' );
		} );

		it( 'should not log info when suppressAll is true', () => {
			editor.config.set( 'email.logs.suppressAll', true );

			utils._logInfo( 'test-info', 'Test message' );

			expect( infoStub ).not.to.be.called;
		} );

		it( 'should not log info when info code is in suppress array', () => {
			editor.config.set( 'email.logs.suppress', [ 'test-info' ] );

			utils._logInfo( 'test-info', 'Test message' );

			expect( infoStub ).not.to.be.called;
		} );

		it( 'should append documentation URL when documentation path is provided', () => {
			utils._logInfo( 'test-info', 'Test message', 'features/some-feature' );

			sinon.assert.calledWithMatch( infoStub, 'test-info',
				'Test message\nRead more: https://ckeditor.com/docs/ckeditor5/latest/features/some-feature' );
		} );
	} );

	describe( '_checkUnsupportedPlugin()', () => {
		it( 'should not log warning when plugin is not loaded', () => {
			utils._checkUnsupportedPlugin( 'NonExistentPlugin' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning when plugin is loaded', () => {
			editor.plugins.has = name => name === 'TestPlugin';

			utils._checkUnsupportedPlugin( 'TestPlugin' );

			sinon.assert.calledWithMatch( warnStub, 'email-integration-unsupported-plugin', {
				pluginName: 'TestPlugin'
			} );
		} );
	} );

	describe( '_validateConfigColorValue()', () => {
		it( 'should not log warning for valid color string', () => {
			editor.config.set( 'test.color', '#FF0000' );

			utils._validateConfigColorValue( 'test.color' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning for valid color array', () => {
			editor.config.set( 'test.colors', [ '#FF0000', 'rgb(0,0,0)' ] );

			utils._validateConfigColorValue( 'test.colors' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning for HSL color', () => {
			editor.config.set( 'test.color', 'hsl(0,100%,50%)' );

			utils._validateConfigColorValue( 'test.color' );

			sinon.assert.calledWithMatch( warnStub, 'email-integration-unsupported-color-value', {
				color: 'hsl(0,100%,50%)',
				configPath: 'test.color'
			} );
		} );

		it( 'should log warning for HSLA color in array with single item', () => {
			editor.config.set( 'test.colors', [
				{ color: 'hsla(0,100%,50%,1)', label: 'Red' }
			] );

			utils._validateConfigColorValue( 'test.colors' );

			sinon.assert.calledWithMatch( warnStub, 'email-integration-unsupported-color-value', {
				color: 'hsla(0,100%,50%,1)',
				configPath: 'test.colors[0]'
			} );
		} );

		it( 'should log warning for HSLA color in array with multiple items', () => {
			editor.config.set( 'test.colors', [
				{ color: 'hsla(0,100%,50%,1)', label: 'Red' },
				{ color: 'hsla(0,0,0,1)', label: 'Black' }
			] );

			utils._validateConfigColorValue( 'test.colors' );

			sinon.assert.calledWithMatch( warnStub, 'email-integration-unsupported-color-value', {
				color: 'hsla(0,100%,50%,1)',
				configPath: 'test.colors[0]'
			} );

			sinon.assert.calledWithMatch( warnStub, 'email-integration-unsupported-color-value', {
				color: 'hsla(0,0,0,1)',
				configPath: 'test.colors[1]'
			} );
		} );

		it( 'should not log warning for non-existent config path', () => {
			utils._validateConfigColorValue( 'non.existent.path' );

			sinon.assert.notCalled( warnStub );
		} );
	} );

	describe( '_validateConfigColorFormat()', () => {
		it( 'should not log warning for rgb format', () => {
			editor.config.set( 'test.colorFormat', 'rgb' );

			utils._validateConfigColorFormat( 'test.colorFormat' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning for hsl format', () => {
			editor.config.set( 'test.colorFormat', 'hsl' );

			utils._validateConfigColorFormat( 'test.colorFormat' );

			sinon.assert.calledWithMatch( warnStub, 'email-integration-unsupported-color-format', {
				format: 'hsl',
				configPath: 'test.colorFormat'
			} );
		} );

		it( 'should log warning for hsla format', () => {
			editor.config.set( 'test.colorFormat', 'hsla' );

			utils._validateConfigColorFormat( 'test.colorFormat' );

			sinon.assert.calledWithMatch( warnStub, 'email-integration-unsupported-color-format', {
				format: 'hsla',
				configPath: 'test.colorFormat'
			} );
		} );

		it( 'should not log warning for non-existent config path', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );

			utils._validateConfigColorFormat( 'non.existent.path' );

			sinon.assert.notCalled( warnStub );
		} );
	} );
} );

describe( 'isUnsupportedEmailColorValue()', () => {
	it( 'should return true for HSL colors', () => {
		expect( isUnsupportedEmailColorValue( 'hsl(0,100%,50%)' ) ).to.be.true;
	} );

	it( 'should return true for HSLA colors', () => {
		expect( isUnsupportedEmailColorValue( 'hsla(0,100%,50%,1)' ) ).to.be.true;
	} );

	it( 'should return true for RGBA colors', () => {
		expect( isUnsupportedEmailColorValue( 'rgba(255,0,0,0.5)' ) ).to.be.true;
	} );

	it( 'should return false for RGB colors', () => {
		expect( isUnsupportedEmailColorValue( 'rgb(255,0,0)' ) ).to.be.false;
	} );

	it( 'should return false for hex colors', () => {
		expect( isUnsupportedEmailColorValue( '#FF0000' ) ).to.be.false;
	} );

	it( 'should return true for LCH colors', () => {
		expect( isUnsupportedEmailColorValue( 'lch(0 100 50)' ) ).to.be.true;
	} );

	it( 'should return true for LAB colors', () => {
		expect( isUnsupportedEmailColorValue( 'lab(0 100 50)' ) ).to.be.true;
	} );

	it( 'should return true for OKLAB colors', () => {
		expect( isUnsupportedEmailColorValue( 'oklab(40% 0 0)' ) ).to.be.true;
	} );

	it( 'should return true for OKLCH colors', () => {
		expect( isUnsupportedEmailColorValue( 'oklch(40% 0.268735435 34.568626)' ) ).to.be.true;
	} );

	it( 'should return true for color-mix', () => {
		expect( isUnsupportedEmailColorValue( 'color-mix(in srgb, #34c9eb 50%, white)' ) ).to.be.true;
	} );
} );

describe( 'isUnsupportedEmailColorFormat()', () => {
	it( 'should return true for HSL colors', () => {
		expect( isUnsupportedEmailColorFormat( 'hsl' ) ).to.be.true;
	} );

	it( 'should return true for HSLA colors', () => {
		expect( isUnsupportedEmailColorFormat( 'hsla' ) ).to.be.true;
	} );

	it( 'should return true for RGBA colors', () => {
		expect( isUnsupportedEmailColorFormat( 'rgba' ) ).to.be.true;
	} );

	it( 'should return false for RGB colors', () => {
		expect( isUnsupportedEmailColorFormat( 'rgb' ) ).to.be.false;
	} );

	it( 'should return false for hex colors', () => {
		expect( isUnsupportedEmailColorFormat( 'hex' ) ).to.be.false;
	} );

	it( 'should return true for LCH colors', () => {
		expect( isUnsupportedEmailColorFormat( 'lch' ) ).to.be.true;
	} );

	it( 'should return true for LAB colors', () => {
		expect( isUnsupportedEmailColorFormat( 'lab' ) ).to.be.true;
	} );

	it( 'should return true for OKLAB colors', () => {
		expect( isUnsupportedEmailColorFormat( 'oklab' ) ).to.be.true;
	} );

	it( 'should return true for OKLCH colors', () => {
		expect( isUnsupportedEmailColorFormat( 'oklch' ) ).to.be.true;
	} );

	it( 'should return true for color-mix', () => {
		expect( isUnsupportedEmailColorFormat( 'color-mix' ) ).to.be.true;
	} );
} );
