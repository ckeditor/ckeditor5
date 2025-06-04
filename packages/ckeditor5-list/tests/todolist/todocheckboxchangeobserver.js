/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import View from '@ckeditor/ckeditor5-engine/src/view/view.js';
import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver.js';
import createViewRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import TodoCheckboxChangeObserver from '../../src/todolist/todocheckboxchangeobserver.js';

describe( 'TodoCheckboxChangeObserver', () => {
	let view, viewDocument, observer, domRoot;

	beforeEach( () => {
		domRoot = document.createElement( 'div' );
		view = new View();
		viewDocument = view.document;
		createViewRoot( viewDocument );
		view.attachDomRoot( domRoot );
		observer = view.addObserver( TodoCheckboxChangeObserver );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should extend DomEventObserver', () => {
		expect( observer ).instanceof( DomEventObserver );
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'change' ] );
	} );

	it( 'should fire `todoCheckboxChange` for a checkbox in a span with "todo-list__label" class', () => {
		const spy = sinon.spy();

		viewDocument.on( 'todoCheckboxChange', spy );

		setData( view,
			'<span class="todo-list__label">' +
				'<span contenteditable="false">' +
					'<input tabindex="-1" type="checkbox"></input>' +
				'</span>' +
			'</span>'
		);

		sinon.assert.notCalled( spy );

		observer.onDomEvent( { type: 'change', target: domRoot.querySelector( 'input' ) } );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should not fire `todoCheckboxChange` for an input without type checkbox', () => {
		const spy = sinon.spy();

		viewDocument.on( 'todoCheckboxChange', spy );

		setData( view,
			'<span class="todo-list__label">' +
				'<span contenteditable="false">' +
					'<input tabindex="-1"></input>' +
				'</span>' +
			'</span>'
		);

		observer.onDomEvent( { type: 'change', target: domRoot.querySelector( 'input' ) } );

		sinon.assert.notCalled( spy );
	} );

	it( 'should not fire `todoCheckboxChange` for a checkbox in a span without a class', () => {
		const spy = sinon.spy();

		viewDocument.on( 'todoCheckboxChange', spy );

		setData( view,
			'<span>' +
				'<span contenteditable="false">' +
					'<input tabindex="-1" type="checkbox"></input>' +
				'</span>' +
			'</span>'
		);

		observer.onDomEvent( { type: 'change', target: domRoot.querySelector( 'input' ) } );

		sinon.assert.notCalled( spy );
	} );

	it( 'should not fire `todoCheckboxChange` for a span in a span with "todo-list__label" class', () => {
		const spy = sinon.spy();

		viewDocument.on( 'todoCheckboxChange', spy );

		setData( view,
			'<span>' +
				'<span contenteditable="false">' +
					'<input tabindex="-1" type="checkbox"></input>' +
				'</span>' +
			'</span>'
		);

		observer.onDomEvent( { type: 'change', target: domRoot.querySelector( 'span[contenteditable=false]' ) } );

		sinon.assert.notCalled( spy );
	} );
} );
