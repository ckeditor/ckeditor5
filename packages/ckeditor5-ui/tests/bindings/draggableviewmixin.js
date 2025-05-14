/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { View } from '../../src/index.js';
import DraggableViewMixin from '../../src/bindings/draggableviewmixin.js';

describe( 'DraggableViewMixin', () => {
	let view;

	class TestView extends View {
		constructor( ...args ) {
			super( ...args );
			this.dragable = new View();
			this.dragable.element = document.createElement( 'div' );
			this.nonDragable = new View();
			this.nonDragable.element = document.createElement( 'div' );

			this.setTemplate( {
				tag: 'div',
				children: [
					this.dragable,
					this.nonDragable
				]
			} );
		}

		get dragHandleElement() {
			return this.dragable.element;
		}

		get nondragableElement() {
			return this.nonDragable.element;
		}
	}

	beforeEach( () => {
		view = new ( DraggableViewMixin( TestView ) )();
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should set `isDragging` to false', () => {
		expect( view.isDragging ).to.be.false;
	} );

	describe( 'before rendering', () => {
		it( 'should not listen to events', () => {
			view.dragable.element.dispatchEvent( new MouseEvent( 'mousedown', {
				bubbles: true
			} ) );

			expect( view.isDragging ).to.be.false;

			view.dragable.element.dispatchEvent( new MouseEvent( 'touchstart', {
				bubbles: true
			} ) );

			expect( view.isDragging ).to.be.false;
		} );
	} );

	describe( 'after rendering', () => {
		beforeEach( () => {
			view.render();
		} );

		describe( 'on mouse device', () => {
			it( 'should not start dragging if the view does not have dragHandleElement', () => {
				const stub = sinon.stub( view, 'dragHandleElement' ).get( () => null );

				view.dragable.element.dispatchEvent( new MouseEvent( 'mousedown', {
					bubbles: true
				} ) );

				expect( view.isDragging ).to.be.false;

				stub.restore();
			} );

			it( 'should not start dragging if nondraggable part of view was pressed', () => {
				view.nonDragable.element.dispatchEvent( new MouseEvent( 'mousedown', {
					bubbles: true
				} ) );

				expect( view.isDragging ).to.be.false;
			} );

			it( 'should set `isDragging` to true when dragging started', () => {
				view.dragable.element.dispatchEvent( new MouseEvent( 'mousedown', {
					bubbles: true
				} ) );

				expect( view.isDragging ).to.be.true;
			} );

			it( 'should not react to mousemove if view is not being dragged', () => {
				const spy = sinon.spy();

				view.on( 'drag', spy );

				view.dragable.element.dispatchEvent( new MouseEvent( 'mousedown', {
					bubbles: true
				} ) );

				view.isDragging = false;

				document.dispatchEvent( new MouseEvent( 'mousemove', {
					clientX: 10,
					clientY: 20
				} ) );

				sinon.assert.notCalled( spy );
			} );

			it( 'should fire `drag` events with changed coordinates', () => {
				const spy = sinon.spy();

				view.on( 'drag', spy );

				view.dragable.element.dispatchEvent( new MouseEvent( 'mousedown', {
					bubbles: true
				} ) );

				expect( view.isDragging ).to.be.true;

				document.dispatchEvent( new MouseEvent( 'mousemove', {
					clientX: 10,
					clientY: 20
				} ) );

				sinon.assert.calledWithMatch( spy, {}, { deltaX: 10, deltaY: 20 } );
			} );

			it( 'should stop dragging after `mouseup` event', () => {
				const spy = sinon.spy();

				view.on( 'drag', spy );

				view.dragable.element.dispatchEvent( new MouseEvent( 'mousedown', {
					bubbles: true
				} ) );

				expect( view.isDragging ).to.be.true;

				document.dispatchEvent( new MouseEvent( 'mousemove', {
					clientX: 10,
					clientY: 20
				} ) );

				sinon.assert.calledWithMatch( spy, {}, { deltaX: 10, deltaY: 20 } );

				document.dispatchEvent( new MouseEvent( 'mouseup', {
					bubbles: true
				} ) );

				expect( view.isDragging ).to.be.false;

				document.dispatchEvent( new MouseEvent( 'mousemove', {
					clientX: 20,
					clientY: 30
				} ) );

				sinon.assert.calledOnce( spy );
			} );
		} );

		describe( 'on touch device', () => {
			it( 'should not start dragging if the view does not have dragHandleElement', () => {
				const stub = sinon.stub( view, 'dragHandleElement' ).get( () => null );

				view.dragable.element.dispatchEvent( new TouchEvent( 'touchstart', {
					bubbles: true
				} ) );

				expect( view.isDragging ).to.be.false;

				stub.restore();
			} );

			it( 'should not start dragging if nondraggable part of view was pressed', () => {
				view.nonDragable.element.dispatchEvent( new TouchEvent( 'touchstart', {
					bubbles: true
				} ) );

				expect( view.isDragging ).to.be.false;
			} );

			it( 'should set `isDragging` to true when dragging started', () => {
				view.dragable.element.dispatchEvent( new TouchEvent( 'touchstart', {
					bubbles: true,
					touches: [ new Touch( {
						identifier: 0,
						target: view.dragable.element,
						clientX: 0,
						clientY: 0
					} ) ]
				} ) );

				expect( view.isDragging ).to.be.true;
			} );

			it( 'should not react to mousemove if view is not being dragged', () => {
				const spy = sinon.spy();

				view.on( 'drag', spy );

				view.dragable.element.dispatchEvent( new TouchEvent( 'touchstart', {
					bubbles: true,
					touches: [ new Touch( {
						identifier: 0,
						target: view.dragable.element,
						clientX: 0,
						clientY: 0
					} ) ]
				} ) );

				view.isDragging = false;

				document.dispatchEvent( new TouchEvent( 'touchmove', {
					touches: [ new Touch( {
						identifier: 0,
						target: view.dragable.element,
						clientX: 10,
						clientY: 20
					} ) ]
				} ) );

				sinon.assert.notCalled( spy );
			} );

			it( 'should fire `drag` events with changed coordinates', () => {
				const spy = sinon.spy();

				view.on( 'drag', spy );

				view.dragable.element.dispatchEvent( new TouchEvent( 'touchstart', {
					bubbles: true,
					touches: [ new Touch( {
						identifier: 0,
						target: view.dragable.element,
						clientX: 0,
						clientY: 0
					} ) ]
				} ) );

				expect( view.isDragging ).to.be.true;

				document.dispatchEvent( new TouchEvent( 'touchmove', {
					touches: [ new Touch( {
						identifier: 0,
						target: view.dragable.element,
						clientX: 10,
						clientY: 20
					} ) ]
				} ) );

				sinon.assert.calledWithMatch( spy, {}, { deltaX: 10, deltaY: 20 } );
			} );

			it( 'should stop dragging after `mouseup` event', () => {
				const spy = sinon.spy();

				view.on( 'drag', spy );

				view.dragable.element.dispatchEvent( new TouchEvent( 'touchstart', {
					bubbles: true,
					touches: [ new Touch( {
						identifier: 0,
						target: view.dragable.element,
						clientX: 0,
						clientY: 0
					} ) ]
				} ) );

				expect( view.isDragging ).to.be.true;

				document.dispatchEvent( new TouchEvent( 'touchmove', {
					touches: [ new Touch( {
						identifier: 0,
						target: view.dragable.element,
						clientX: 10,
						clientY: 20
					} ) ]
				} ) );

				sinon.assert.calledWithMatch( spy, {}, { deltaX: 10, deltaY: 20 } );

				document.dispatchEvent( new TouchEvent( 'touchend', {
					bubbles: true
				} ) );

				expect( view.isDragging ).to.be.false;

				document.dispatchEvent( new TouchEvent( 'touchmove', {
					touches: [ new Touch( {
						identifier: 0,
						target: view.dragable.element,
						clientX: 10,
						clientY: 20
					} ) ]
				} ) );

				sinon.assert.calledOnce( spy );
			} );
		} );
	} );
} );
