/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyObserver } from '../../../src/view/observer/keyobserver.js';
import { EditingView } from '../../../src/view/view.js';
import { getCode } from '@ckeditor/ckeditor5-utils';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'KeyObserver', () => {
	let view, viewDocument, observer;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;
		observer = view.getObserver( KeyObserver );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).toContain( 'keydown' );
		expect( observer.domEventType ).toContain( 'keyup' );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire keydown with the target and key info', () => {
			const spy = vi.fn();

			viewDocument.on( 'keydown', spy );

			observer.onDomEvent( {
				type: 'keydown',
				target: document.body,
				keyCode: 111,
				altKey: false,
				ctrlKey: false,
				metaKey: false,
				shiftKey: false
			} );

			expect( spy ).toHaveBeenCalledOnce();

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data ).toHaveProperty( 'domTarget', document.body );
			expect( data ).toHaveProperty( 'keyCode', 111 );
			expect( data ).toHaveProperty( 'altKey', false );
			expect( data ).toHaveProperty( 'ctrlKey', false );
			expect( data ).toHaveProperty( 'shiftKey', false );
			expect( data ).toHaveProperty( 'keystroke', getCode( data ) );

			// Just to be sure.
			expect( getCode( data ) ).toBe( 111 );
		} );

		it( 'should fire keydown with proper key modifiers info', () => {
			const spy = vi.fn();

			viewDocument.on( 'keydown', spy );

			observer.onDomEvent( {
				type: 'keydown',
				target: document.body,
				keyCode: 111,
				altKey: true,
				ctrlKey: true,
				metaKey: false,
				shiftKey: true
			} );

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data ).toHaveProperty( 'keyCode', 111 );
			expect( data ).toHaveProperty( 'altKey', true );
			expect( data ).toHaveProperty( 'ctrlKey', true );
			expect( data ).toHaveProperty( 'shiftKey', true );
			expect( data ).toHaveProperty( 'keystroke', getCode( data ) );

			// Just to be sure.
			expect( getCode( data ) ).toBeGreaterThan( 111 );
		} );

		it( 'should fire keydown with ctrlKey set to true once ctrl was pressed', () => {
			const spy = vi.fn();

			viewDocument.on( 'keydown', spy );

			observer.onDomEvent( { type: 'keydown', target: document.body, keyCode: 111, ctrlKey: true } );

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data ).toHaveProperty( 'ctrlKey', true );
		} );

		it( 'should fire keydown with metaKey set to true once meta (cmd) was pressed', () => {
			const spy = vi.fn();

			viewDocument.on( 'keydown', spy );

			observer.onDomEvent( { type: 'keydown', target: document.body, keyCode: 111, metaKey: true } );

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data ).toHaveProperty( 'metaKey', true );
		} );

		it( 'should fire keyup with the target and key info', () => {
			const spy = vi.fn();

			viewDocument.on( 'keyup', spy );

			observer.onDomEvent( {
				type: 'keyup',
				target: document.body,
				keyCode: 111,
				altKey: false,
				ctrlKey: false,
				metaKey: false,
				shiftKey: false
			} );

			expect( spy ).toHaveBeenCalledOnce();

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data ).toHaveProperty( 'domTarget', document.body );
			expect( data ).toHaveProperty( 'keyCode', 111 );
			expect( data ).toHaveProperty( 'altKey', false );
			expect( data ).toHaveProperty( 'ctrlKey', false );
			expect( data ).toHaveProperty( 'shiftKey', false );
			expect( data ).toHaveProperty( 'keystroke', getCode( data ) );

			// Just to be sure.
			expect( getCode( data ) ).toBe( 111 );
		} );
	} );
} );
