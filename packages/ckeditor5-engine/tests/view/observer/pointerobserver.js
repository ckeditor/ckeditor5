/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PointerObserver } from '../../../src/view/observer/pointerobserver.js';
import { EditingView } from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'PointerObserver', () => {
	let view, viewDocument, observer;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;
		observer = view.addObserver( PointerObserver );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).toEqual( [ 'pointerdown', 'pointerup', 'pointermove' ] );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire pointerdown with the right event data', () => {
			const spy = vi.fn();

			viewDocument.on( 'pointerdown', spy );

			observer.onDomEvent( { type: 'pointerdown', target: document.body } );

			expect( spy ).toHaveBeenCalledOnce();

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data.domTarget ).toBe( document.body );
		} );

		it( 'should fire pointerup with the right event data', () => {
			const spy = vi.fn();

			viewDocument.on( 'pointerup', spy );

			observer.onDomEvent( { type: 'pointerup', target: document.body } );

			expect( spy ).toHaveBeenCalledOnce();

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data.domTarget ).toBe( document.body );
		} );

		it( 'should fire pointermove with the right event data', () => {
			const spy = vi.fn();

			viewDocument.on( 'pointermove', spy );

			observer.onDomEvent( { type: 'pointermove', target: document.body } );

			expect( spy ).toHaveBeenCalledOnce();

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data.domTarget ).toBe( document.body );
		} );
	} );
} );
