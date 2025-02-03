/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import EmailIntegrationUtils, { isUnsupportedEmailColor } from '../src/emailintegrationutils.js';

describe( 'EmailIntegrationUtils', () => {
	let domElement, editor, warnStub, infoStub;

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

	it( 'should define default email.warnings config entry', () => {
		expect( editor.config.get( 'email.warnings' ) ).to.deep.equal( {
			suppress: [],
			suppressAll: false
		} );
	} );

	describe( '_logSuppressibleWarning()', () => {
		it( 'should log warning when suppression is not configured', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );

			utils._logSuppressibleWarning( 'test-warning' );

			sinon.assert.calledOnce( warnStub );
		} );

		it( 'should not log warning when suppressAll is true', () => {
			editor.config.set( 'email.warnings.suppressAll', true );
			const utils = editor.plugins.get( EmailIntegrationUtils );

			utils._logSuppressibleWarning( 'test-warning' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when warning code is in suppress array', () => {
			editor.config.set( 'email.warnings.suppress', [ 'test-warning' ] );
			const utils = editor.plugins.get( EmailIntegrationUtils );

			utils._logSuppressibleWarning( 'test-warning' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning when warning code matches suppress function', () => {
			editor.config.set( 'email.warnings.suppress', code => code === 'test-warning' );
			const utils = editor.plugins.get( EmailIntegrationUtils );

			utils._logSuppressibleWarning( 'test-warning' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should be possible to suppress warning using function accepting data', () => {
			editor.config.set( 'email.warnings.suppress', ( code, data ) => code === 'test-warning' && data === 'test-data' );
			const utils = editor.plugins.get( EmailIntegrationUtils );

			utils._logSuppressibleWarning( 'test-warning', 'test-data' );

			sinon.assert.notCalled( warnStub );
		} );
	} );

	describe( '_checkUnsupportedPlugin()', () => {
		it( 'should not log warning when plugin is not loaded', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );

			utils._checkUnsupportedPlugin( 'NonExistentPlugin' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning when plugin is loaded', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );

			editor.plugins.has = name => name === 'TestPlugin';

			utils._checkUnsupportedPlugin( 'TestPlugin' );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-plugin', {
				pluginName: 'TestPlugin'
			} );
		} );
	} );

	describe( '_validateConfigColorValue()', () => {
		it( 'should not log warning for valid color string', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );
			editor.config.set( 'test.color', '#FF0000' );

			utils._validateConfigColorValue( 'test.color' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should not log warning for valid color array', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );
			editor.config.set( 'test.colors', [ '#FF0000', 'rgb(0,0,0)' ] );

			utils._validateConfigColorValue( 'test.colors' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning for HSL color', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );
			editor.config.set( 'test.color', 'hsl(0,100%,50%)' );

			utils._validateConfigColorValue( 'test.color' );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-color-value', {
				color: 'hsl(0,100%,50%)',
				configPath: 'test.color'
			} );
		} );

		it( 'should log warning for HSLA color in array with single item', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );
			editor.config.set( 'test.colors', [
				{ color: 'hsla(0,100%,50%,1)', label: 'Red' }
			] );

			utils._validateConfigColorValue( 'test.colors' );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-color-value', {
				color: 'hsla(0,100%,50%,1)',
				configPath: 'test.colors[0]'
			} );
		} );

		it( 'should log warning for HSLA color in array with multiple items', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );
			editor.config.set( 'test.colors', [
				{ color: 'hsla(0,100%,50%,1)', label: 'Red' },
				{ color: 'hsla(0,0,0,1)', label: 'Black' }
			] );

			utils._validateConfigColorValue( 'test.colors' );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-color-value', {
				color: 'hsla(0,100%,50%,1)',
				configPath: 'test.colors[0]'
			} );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-color-value', {
				color: 'hsla(0,0,0,1)',
				configPath: 'test.colors[1]'
			} );
		} );

		it( 'should not log warning for non-existent config path', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );

			utils._validateConfigColorValue( 'non.existent.path' );

			sinon.assert.notCalled( warnStub );
		} );
	} );

	describe( '_validateConfigColorFormat()', () => {
		it( 'should not log warning for rgb format', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );
			editor.config.set( 'test.colorFormat', 'rgb' );

			utils._validateConfigColorFormat( 'test.colorFormat' );

			sinon.assert.notCalled( warnStub );
		} );

		it( 'should log warning for hsl format', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );
			editor.config.set( 'test.colorFormat', 'hsl' );

			utils._validateConfigColorFormat( 'test.colorFormat' );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-color-format', {
				format: 'hsl',
				configPath: 'test.colorFormat'
			} );
		} );

		it( 'should log warning for hsla format', () => {
			const utils = editor.plugins.get( EmailIntegrationUtils );
			editor.config.set( 'test.colorFormat', 'hsla' );

			utils._validateConfigColorFormat( 'test.colorFormat' );

			sinon.assert.calledWithMatch( warnStub, 'email-unsupported-color-format', {
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

describe( 'isUnsupportedEmailColor()', () => {
	it( 'should return true for HSL colors', () => {
		expect( isUnsupportedEmailColor( 'hsl(0,100%,50%)' ) ).to.be.true;
	} );

	it( 'should return true for HSLA colors', () => {
		expect( isUnsupportedEmailColor( 'hsla(0,100%,50%,1)' ) ).to.be.true;
	} );

	it( 'should return false for RGB colors', () => {
		expect( isUnsupportedEmailColor( 'rgb(255,0,0)' ) ).to.be.false;
	} );

	it( 'should return false for hex colors', () => {
		expect( isUnsupportedEmailColor( '#FF0000' ) ).to.be.false;
	} );

	it( 'should return true for LCH colors', () => {
		expect( isUnsupportedEmailColor( 'lch(0 100 50)' ) ).to.be.true;
	} );

	it( 'should return true for LAB colors', () => {
		expect( isUnsupportedEmailColor( 'lab(0 100 50)' ) ).to.be.true;
	} );

	describe( 'shortcut', () => {
		it( 'should return true for HSL colors', () => {
			expect( isUnsupportedEmailColor( 'hsl' ) ).to.be.true;
		} );

		it( 'should return true for HSLA colors', () => {
			expect( isUnsupportedEmailColor( 'hsla' ) ).to.be.true;
		} );

		it( 'should return false for RGB colors', () => {
			expect( isUnsupportedEmailColor( 'rgb' ) ).to.be.false;
		} );

		it( 'should return false for hex colors', () => {
			expect( isUnsupportedEmailColor( 'hex' ) ).to.be.false;
		} );

		it( 'should return false for LCH colors', () => {
			expect( isUnsupportedEmailColor( 'lch' ) ).to.be.true;
		} );

		it( 'should return false for LAB colors', () => {
			expect( isUnsupportedEmailColor( 'lab' ) ).to.be.true;
		} );
	} );
} );
