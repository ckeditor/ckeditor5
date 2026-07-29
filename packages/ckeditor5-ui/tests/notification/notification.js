/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { ContextPlugin } from '@ckeditor/ckeditor5-core';
import { Notification } from '../../src/notification/notification.js';

describe( 'Notification', () => {
	let editor, notification;

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

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Notification.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Notification.isPremiumPlugin ).toBe( false );
	} );

	describe( 'init()', () => {
		it( 'should create notification plugin', () => {
			expect( notification ).toBeInstanceOf( Notification );
			expect( notification ).toBeInstanceOf( ContextPlugin );
		} );
	} );

	describe( 'showSuccess()', () => {
		it( 'should fire `show:success` event with given data', () => {
			const spy = vi.fn();

			notification.on( 'show:success', spy );

			notification.showSuccess( 'foo bar' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				message: 'foo bar',
				type: 'success',
				title: ''
			} );
		} );

		it( 'should fire `show:success` event with additional namespace', () => {
			const spy = vi.fn();

			notification.on( 'show:success:something:else', spy );

			notification.showSuccess( 'foo bar', {
				namespace: 'something:else'
			} );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				message: 'foo bar',
				type: 'success',
				title: ''
			} );
		} );

		it( 'should fire `show:success` event with title', () => {
			const spy = vi.fn();

			notification.on( 'show:success', spy );

			notification.showSuccess( 'foo bar', {
				title: 'foo bar baz'
			} );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				message: 'foo bar',
				type: 'success',
				title: 'foo bar baz'
			} );
		} );
	} );

	describe( 'showInfo()', () => {
		it( 'should fire `show:info` event with given data', () => {
			const spy = vi.fn();

			notification.on( 'show:info', spy );

			notification.showInfo( 'foo bar' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				message: 'foo bar',
				type: 'info',
				title: ''
			} );
		} );

		it( 'should fire `show:info` event with additional namespace', () => {
			const spy = vi.fn();

			notification.on( 'show:info:something:else', spy );

			notification.showInfo( 'foo bar', {
				namespace: 'something:else'
			} );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				message: 'foo bar',
				type: 'info',
				title: ''
			} );
		} );

		it( 'should fire `show:info` event with title', () => {
			const spy = vi.fn();

			notification.on( 'show:info', spy );

			notification.showInfo( 'foo bar', {
				title: 'foo bar baz'
			} );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				message: 'foo bar',
				type: 'info',
				title: 'foo bar baz'
			} );
		} );
	} );

	describe( 'showWarning()', () => {
		let alertStub;

		beforeEach( () => {
			alertStub = vi.spyOn( window, 'alert' ).mockImplementation( () => {} );
		} );

		it( 'should fire `show:warning` event with given data', () => {
			const spy = vi.fn();

			notification.on( 'show:warning', spy );

			notification.showWarning( 'foo bar' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				message: 'foo bar',
				type: 'warning',
				title: ''
			} );
		} );

		it( 'should fire `show:warning` event with additional namespace', () => {
			const spy = vi.fn();

			notification.on( 'show:warning:something:else', spy );

			notification.showWarning( 'foo bar', {
				namespace: 'something:else'
			} );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				message: 'foo bar',
				type: 'warning',
				title: ''
			} );
		} );

		it( 'should fire `show:warning` event with title', () => {
			const spy = vi.fn();

			notification.on( 'show:warning', spy );

			notification.showWarning( 'foo bar', {
				title: 'foo bar baz'
			} );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toEqual( {
				message: 'foo bar',
				type: 'warning',
				title: 'foo bar baz'
			} );
		} );

		it( 'should display `warning` message as system alert if is not cached and stopped by other plugins', () => {
			notification.showWarning( 'foo bar' );

			expect( alertStub ).toHaveBeenCalledOnce();
			expect( alertStub.mock.calls[ 0 ][ 0 ] ).toBe( 'foo bar' );
		} );

		it( 'should not display alert when `warning` message is cached and stopped by other plugins', () => {
			notification.on( 'show:warning', evt => {
				evt.stop();
			} );

			notification.showWarning( 'foo bar' );

			expect( alertStub ).not.toHaveBeenCalled();
		} );
	} );
} );
