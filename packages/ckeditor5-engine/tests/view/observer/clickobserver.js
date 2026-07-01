/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClickObserver } from '../../../src/view/observer/clickobserver.js';
import { EditingView } from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'ClickObserver', () => {
	let view, viewDocument, observer;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;
		observer = view.addObserver( ClickObserver );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).toBe( 'click' );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire click with the right event data', () => {
			const spy = vi.fn();

			viewDocument.on( 'click', spy );

			observer.onDomEvent( { type: 'click', target: document.body } );

			expect( spy ).toHaveBeenCalledOnce();

			const data = spy.mock.calls[ 0 ][ 1 ];
			expect( data.domTarget ).toBe( document.body );
		} );
	} );
} );
