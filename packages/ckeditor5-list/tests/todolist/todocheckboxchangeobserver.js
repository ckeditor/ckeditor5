/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditingView, DomEventObserver, _setViewData } from '@ckeditor/ckeditor5-engine';
import { createViewRoot } from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

import { TodoCheckboxChangeObserver } from '../../src/todolist/todocheckboxchangeobserver.js';

describe( 'TodoCheckboxChangeObserver', () => {
	let view, viewDocument, observer, domRoot;

	beforeEach( () => {
		domRoot = document.createElement( 'div' );
		view = new EditingView();
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );
		observer = view.addObserver( TodoCheckboxChangeObserver );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should extend DomEventObserver', () => {
		expect( observer ).toBeInstanceOf( DomEventObserver );
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).toEqual( [ 'change' ] );
	} );

	it( 'should fire `todoCheckboxChange` for a checkbox in a span with "todo-list__label" class', () => {
		const spy = vi.fn();

		viewDocument.on( 'todoCheckboxChange', spy );

		_setViewData( view,
			'<span class="todo-list__label">' +
				'<span contenteditable="false">' +
					'<input tabindex="-1" type="checkbox"></input>' +
				'</span>' +
			'</span>'
		);

		expect( spy ).not.toHaveBeenCalled();

		observer.onDomEvent( { type: 'change', target: domRoot.querySelector( 'input' ) } );

		expect( spy ).toHaveBeenCalledOnce();
	} );

	it( 'should not fire `todoCheckboxChange` for an input without type checkbox', () => {
		const spy = vi.fn();

		viewDocument.on( 'todoCheckboxChange', spy );

		_setViewData( view,
			'<span class="todo-list__label">' +
				'<span contenteditable="false">' +
					'<input tabindex="-1"></input>' +
				'</span>' +
			'</span>'
		);

		observer.onDomEvent( { type: 'change', target: domRoot.querySelector( 'input' ) } );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire `todoCheckboxChange` for a checkbox in a span without a class', () => {
		const spy = vi.fn();

		viewDocument.on( 'todoCheckboxChange', spy );

		_setViewData( view,
			'<span>' +
				'<span contenteditable="false">' +
					'<input tabindex="-1" type="checkbox"></input>' +
				'</span>' +
			'</span>'
		);

		observer.onDomEvent( { type: 'change', target: domRoot.querySelector( 'input' ) } );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire `todoCheckboxChange` for a span in a span with "todo-list__label" class', () => {
		const spy = vi.fn();

		viewDocument.on( 'todoCheckboxChange', spy );

		_setViewData( view,
			'<span>' +
				'<span contenteditable="false">' +
					'<input tabindex="-1" type="checkbox"></input>' +
				'</span>' +
			'</span>'
		);

		observer.onDomEvent( { type: 'change', target: domRoot.querySelector( 'span[contenteditable=false]' ) } );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire `todoCheckboxChange` when event target is null', () => {
		const spy = vi.fn();

		viewDocument.on( 'todoCheckboxChange', spy );

		observer.onDomEvent( { type: 'change', target: null } );

		expect( spy ).not.toHaveBeenCalled();
	} );
} );
