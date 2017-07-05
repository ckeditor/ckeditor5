/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, Event */

import Model from '../../../src/model';
import createListDropdown from '../../../src/dropdown/list/createlistdropdown';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ListView from '../../../src/list/listview';
import ListItemView from '../../../src/list/listitemview';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'createListDropdown', () => {
	let view, model, locale, items;

	beforeEach( () => {
		locale = { t() {} };
		items = new Collection();
		model = new Model( {
			isEnabled: true,
			items,
			isOn: false,
			label: 'foo'
		} );

		view = createListDropdown( model, locale );
		view.init();
		document.body.appendChild( view.element );
	} );

	describe( 'constructor()', () => {
		it( 'sets view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		describe( 'view#listView', () => {
			it( 'is created', () => {
				const panelChildren = view.panelView.children;

				expect( panelChildren ).to.have.length( 1 );
				expect( panelChildren.get( 0 ) ).to.equal( view.listView );
				expect( view.listView ).to.be.instanceof( ListView );
			} );

			it( 'is bound to model#items', () => {
				items.add( new Model( { label: 'a', style: 'b' } ) );
				items.add( new Model( { label: 'c', style: 'd' } ) );

				expect( view.listView.items ).to.have.length( 2 );
				expect( view.listView.items.get( 0 ) ).to.be.instanceOf( ListItemView );
				expect( view.listView.items.get( 1 ).label ).to.equal( 'c' );
				expect( view.listView.items.get( 1 ).style ).to.equal( 'd' );

				items.remove( 1 );
				expect( view.listView.items ).to.have.length( 1 );
				expect( view.listView.items.get( 0 ).label ).to.equal( 'a' );
				expect( view.listView.items.get( 0 ).style ).to.equal( 'b' );
			} );

			it( 'binds all attributes in model#items', () => {
				const itemModel = new Model( { label: 'a', style: 'b', foo: 'bar', baz: 'qux' } );

				items.add( itemModel );

				const item = view.listView.items.get( 0 );

				expect( item.foo ).to.equal( 'bar' );
				expect( item.baz ).to.equal( 'qux' );

				itemModel.baz = 'foo?';
				expect( item.baz ).to.equal( 'foo?' );
			} );

			it( 'delegates view.listView#execute to the view', done => {
				items.add( new Model( { label: 'a', style: 'b' } ) );

				view.on( 'execute', evt => {
					expect( evt.source ).to.equal( view.listView.items.get( 0 ) );
					expect( evt.path ).to.deep.equal( [ view.listView.items.get( 0 ), view ] );

					done();
				} );

				view.listView.items.get( 0 ).fire( 'execute' );
			} );
		} );

		it( 'changes view#isOpen on view#execute', () => {
			view.isOpen = true;

			view.fire( 'execute' );
			expect( view.isOpen ).to.be.false;

			view.fire( 'execute' );
			expect( view.isOpen ).to.be.false;
		} );

		it( 'listens to view#isOpen and reacts to DOM events (valid target)', () => {
			// Open the dropdown.
			view.isOpen = true;

			// Fire event from outside of the dropdown.
			document.body.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Closed the dropdown.
			expect( view.isOpen ).to.be.false;

			// Fire event from outside of the dropdown.
			document.body.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Dropdown is still closed.
			expect( view.isOpen ).to.be.false;
		} );

		it( 'listens to view#isOpen and reacts to DOM events (invalid target)', () => {
			// Open the dropdown.
			view.isOpen = true;

			// Event from view.element should be discarded.
			view.element.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Dropdown is still open.
			expect( view.isOpen ).to.be.true;

			// Event from within view.element should be discarded.
			const child = document.createElement( 'div' );
			view.element.appendChild( child );

			child.dispatchEvent( new Event( 'click', {
				bubbles: true
			} ) );

			// Dropdown is still open.
			expect( view.isOpen ).to.be.true;
		} );

		describe( 'activates keyboard navigation for the dropdown', () => {
			it( 'so "arrowdown" focuses the #listView if dropdown is open', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowdown,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				const spy = sinon.spy( view.listView, 'focus' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( spy );

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
			} );

			it( 'so "arrowup" focuses the last #item in #listView if dropdown is open', () => {
				const keyEvtData = {
					keyCode: keyCodes.arrowup,
					preventDefault: sinon.spy(),
					stopPropagation: sinon.spy()
				};
				const spy = sinon.spy( view.listView, 'focusLast' );

				view.isOpen = false;
				view.keystrokes.press( keyEvtData );
				sinon.assert.notCalled( spy );

				view.isOpen = true;
				view.keystrokes.press( keyEvtData );
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
