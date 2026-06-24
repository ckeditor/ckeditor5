/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ArrowKeysObserver } from '../../../src/view/observer/arrowkeysobserver.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BlockQuoteEditing } from '@ckeditor/ckeditor5-block-quote';

import { keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'ArrowKeysObserver', () => {
	let editor, view, viewDocument, observer;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, BlockQuoteEditing ] } );

		view = editor.editing.view;
		viewDocument = view.document;
		observer = view.getObserver( ArrowKeysObserver );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should fire arrowKey event with the same data as keydown event (arrow right)', () => {
		const spy = vi.fn();
		const data = { keyCode: keyCodes.arrowright };

		viewDocument.on( 'arrowKey', spy );

		// Prevent other listeners (especially jump over UI element because it required DOM).
		viewDocument.on( 'arrowKey', event => event.stop() );

		viewDocument.fire( 'keydown', data );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( data );
	} );

	it( 'should fire arrowKey event with the same data as keydown event (arrow left)', () => {
		const spy = vi.fn();
		const data = { keyCode: keyCodes.arrowleft };

		viewDocument.on( 'arrowKey', spy );

		// Prevent other listeners (especially jump over inline filler because it required DOM).
		viewDocument.on( 'arrowKey', event => event.stop() );

		viewDocument.fire( 'keydown', data );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( data );
	} );

	it( 'should fire arrowKey event with the same data as keydown event (arrow up)', () => {
		const spy = vi.fn();
		const data = { keyCode: keyCodes.arrowup };

		viewDocument.on( 'arrowKey', spy );

		viewDocument.fire( 'keydown', data );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( data );
	} );

	it( 'should fire arrowKey event with the same data as keydown event (arrow down)', () => {
		const spy = vi.fn();
		const data = { keyCode: keyCodes.arrowdown };

		viewDocument.on( 'arrowKey', spy );

		viewDocument.fire( 'keydown', data );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( data );
	} );

	it( 'should not fire arrowKey event on non arrow key press', () => {
		const spy = vi.fn();
		const data = { keyCode: keyCodes.space };

		viewDocument.on( 'arrowKey', spy );

		viewDocument.fire( 'keydown', data );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should implement empty #observe() method', () => {
		expect( () => {
			observer.observe();
		} ).not.toThrow();
	} );

	it( 'should implement empty #stopObserving() method', () => {
		expect( () => {
			observer.stopObserving();
		} ).not.toThrow();
	} );
} );
