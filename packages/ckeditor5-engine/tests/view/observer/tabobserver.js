/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TabObserver } from '../../../src/view/observer/tabobserver.js';
import { EditingView } from '../../../src/view/view.js';
import { createViewRoot } from '../../../tests/view/_utils/createroot.js';

import { getCode } from '@ckeditor/ckeditor5-utils';

describe( 'TabObserver', () => {
	let view, viewDocument;

	beforeEach( () => {
		view = new EditingView();
		viewDocument = view.document;
		view.addObserver( TabObserver );
	} );

	it( 'can be initialized', () => {
		expect( () => {
			createViewRoot( viewDocument );
			view.attachDomRoot( document.createElement( 'div' ) );
		} ).not.toThrow();
	} );

	describe( 'tab event', () => {
		it( 'is fired on keydown', () => {
			const spy = vi.fn();

			viewDocument.on( 'tab', spy );

			viewDocument.fire( 'keydown', {
				keyCode: getCode( 'Tab' )
			} );

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'is not fired on keydown when keyCode does not match tab', () => {
			const spy = vi.fn();

			viewDocument.on( 'tab', spy );

			viewDocument.fire( 'keydown', {
				keyCode: 1
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should stop keydown event when tab event is stopped', () => {
			const keydownSpy = vi.fn();

			viewDocument.on( 'keydown', keydownSpy );
			viewDocument.on( 'tab', evt => evt.stop() );

			viewDocument.fire( 'keydown', {
				keyCode: getCode( 'Tab' )
			} );

			expect( keydownSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not stop keydown event when tab event is not stopped', () => {
			const keydownSpy = vi.fn();
			const tabSpy = vi.fn();

			viewDocument.on( 'keydown', keydownSpy );
			viewDocument.on( 'tab', tabSpy );

			viewDocument.fire( 'keydown', {
				keyCode: getCode( 'Tab' )
			} );

			expect( keydownSpy ).toHaveBeenCalledOnce();
			expect( tabSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not be fired when tab key is pressed with ctrl key', () => {
			const keydownSpy = vi.fn();
			const tabSpy = vi.fn();

			viewDocument.on( 'keydown', keydownSpy );
			viewDocument.on( 'tab', tabSpy );

			viewDocument.fire( 'keydown', {
				keyCode: getCode( 'Tab' ),
				ctrlKey: true
			} );

			expect( keydownSpy ).toHaveBeenCalledOnce();
			expect( tabSpy ).not.toHaveBeenCalled();
		} );
	} );

	it( 'should implement empty #stopObserving() method', () => {
		expect( () => {
			view.getObserver( TabObserver ).stopObserving();
		} ).not.toThrow();
	} );
} );
