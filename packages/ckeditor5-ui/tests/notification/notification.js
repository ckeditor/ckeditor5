/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import ContextPlugin from '@ckeditor/ckeditor5-core/src/contextplugin';
import Notification from '../../src/notification/notification';

describe( 'Notification', () => {
	let editor, notification;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Notification ]
			} )
			.then( newEditor => {
				editor = newEditor;
				notification = editor.plugins.get( Notification );
			} );
	} );

	describe( 'init()', () => {
		it( 'should create notification plugin', () => {
			expect( notification ).to.instanceof( Notification );
			expect( notification ).to.instanceof( ContextPlugin );
		} );
	} );

	describe( 'showSuccess()', () => {
		it( 'should fire `show:success` event with given data', () => {
			const spy = testUtils.sinon.spy();

			notification.on( 'show:success', spy );

			notification.showSuccess( 'foo bar' );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ] ).to.deep.equal( {
				message: 'foo bar',
				type: 'success',
				title: ''
			} );
		} );

		it( 'should fire `show:success` event with additional namespace', () => {
			const spy = testUtils.sinon.spy();

			notification.on( 'show:success:something:else', spy );

			notification.showSuccess( 'foo bar', {
				namespace: 'something:else'
			} );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ] ).to.deep.equal( {
				message: 'foo bar',
				type: 'success',
				title: ''
			} );
		} );

		it( 'should fire `show:success` event with title', () => {
			const spy = testUtils.sinon.spy();

			notification.on( 'show:success', spy );

			notification.showSuccess( 'foo bar', {
				title: 'foo bar baz'
			} );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ] ).to.deep.equal( {
				message: 'foo bar',
				type: 'success',
				title: 'foo bar baz'
			} );
		} );
	} );

	describe( 'showInfo()', () => {
		it( 'should fire `show:info` event with given data', () => {
			const spy = testUtils.sinon.spy();

			notification.on( 'show:info', spy );

			notification.showInfo( 'foo bar' );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ] ).to.deep.equal( {
				message: 'foo bar',
				type: 'info',
				title: ''
			} );
		} );

		it( 'should fire `show:info` event with additional namespace', () => {
			const spy = testUtils.sinon.spy();

			notification.on( 'show:info:something:else', spy );

			notification.showInfo( 'foo bar', {
				namespace: 'something:else'
			} );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ] ).to.deep.equal( {
				message: 'foo bar',
				type: 'info',
				title: ''
			} );
		} );

		it( 'should fire `show:info` event with title', () => {
			const spy = testUtils.sinon.spy();

			notification.on( 'show:info', spy );

			notification.showInfo( 'foo bar', {
				title: 'foo bar baz'
			} );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ] ).to.deep.equal( {
				message: 'foo bar',
				type: 'info',
				title: 'foo bar baz'
			} );
		} );
	} );

	describe( 'showWarning()', () => {
		let alertStub;

		beforeEach( () => {
			alertStub = testUtils.sinon.stub( window, 'alert' );
		} );

		it( 'should fire `show:warning` event with given data', () => {
			const spy = testUtils.sinon.spy();

			notification.on( 'show:warning', spy );

			notification.showWarning( 'foo bar' );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ] ).to.deep.equal( {
				message: 'foo bar',
				type: 'warning',
				title: ''
			} );
		} );

		it( 'should fire `show:warning` event with additional namespace', () => {
			const spy = testUtils.sinon.spy();

			notification.on( 'show:warning:something:else', spy );

			notification.showWarning( 'foo bar', {
				namespace: 'something:else'
			} );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ] ).to.deep.equal( {
				message: 'foo bar',
				type: 'warning',
				title: ''
			} );
		} );

		it( 'should fire `show:warning` event with title', () => {
			const spy = testUtils.sinon.spy();

			notification.on( 'show:warning', spy );

			notification.showWarning( 'foo bar', {
				title: 'foo bar baz'
			} );

			sinon.assert.calledOnce( spy );
			expect( spy.firstCall.args[ 1 ] ).to.deep.equal( {
				message: 'foo bar',
				type: 'warning',
				title: 'foo bar baz'
			} );
		} );

		it( 'should display `warning` message as system alert if is not cached and stopped by other plugins', () => {
			notification.showWarning( 'foo bar' );

			sinon.assert.calledOnce( alertStub );
			expect( alertStub.firstCall.args[ 0 ] ).to.equal( 'foo bar' );
		} );

		it( 'should not display alert when `warning` message is cached and stopped by other plugins', () => {
			notification.on( 'show:warning', evt => {
				evt.stop();
			} );

			notification.showWarning( 'foo bar' );

			sinon.assert.notCalled( alertStub );
		} );
	} );
} );
