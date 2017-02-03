/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global Event */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import FloatingToolbarView from '../../../src/toolbar/floating/floatingtoolbarview';
import ToolbarView from '../../../src/toolbar/toolbarview';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import * as positionUtils from '@ckeditor/ckeditor5-utils/src/dom/position';

testUtils.createSinonSandbox();

describe( 'FloatingToolbarView', () => {
	let locale, view, target;

	beforeEach( () => {
		locale = {};
		view = new FloatingToolbarView( locale );

		target = global.document.createElement( 'a' );

		global.document.body.appendChild( view.element );
		global.document.body.appendChild( target );

		view.targetElement = target;

		return view.init();
	} );

	afterEach( () => {
		view.element.remove();

		return view.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ToolbarView', () => {
			expect( view ).to.be.instanceOf( ToolbarView );
		} );

		it( 'should set view#locale', () => {
			expect( view.locale ).to.equal( locale );
		} );

		it( 'should set #isActive', () => {
			expect( view.isActive ).to.be.false;
		} );

		it( 'should set #top', () => {
			expect( view.top ).to.equal( 0 );
		} );

		it( 'should set #left', () => {
			expect( view.left ).to.equal( 0 );
		} );

		it( 'should set #targetElement', () => {
			view = new FloatingToolbarView( locale );

			expect( view.targetElement ).to.be.null;
		} );
	} );

	describe( 'template', () => {
		it( 'should create element from template', () => {
			expect( view.element.classList.contains( 'ck-toolbar_floating' ) ).to.be.true;
		} );

		describe( 'bindings', () => {
			describe( 'class', () => {
				it( 'reacts on #isActive', () => {
					view.isActive = false;
					expect( view.element.classList.contains( 'ck-toolbar_active' ) ).to.be.false;

					view.isActive = true;
					expect( view.element.classList.contains( 'ck-toolbar_active' ) ).to.be.true;
				} );
			} );

			describe( 'style', () => {
				it( 'reacts on #top', () => {
					view.top = 30;
					expect( view.element.style.top ).to.equal( '30px' );
				} );

				it( 'reacts on #left', () => {
					view.left = 20;
					expect( view.element.style.left ).to.equal( '20px' );
				} );
			} );
		} );
	} );

	describe( 'init()', () => {
		it( 'calls #_updatePosition on window.scroll', () => {
			const spy = sinon.spy( view, '_updatePosition' );

			global.window.dispatchEvent( new Event( 'scroll', { bubbles: true } ) );
			sinon.assert.calledOnce( spy );
		} );

		it( 'calls #_updatePosition on #change:isActive', () => {
			view.isActive = false;

			const spy = sinon.spy( view, '_updatePosition' );

			view.isActive = true;
			sinon.assert.calledOnce( spy );

			view.isActive = false;
			sinon.assert.calledTwice( spy );
		} );
	} );

	describe( '_updatePosition()', () => {
		it( 'does not update when not #isActive', () => {
			const spy = testUtils.sinon.spy( positionUtils, 'getOptimalPosition' );

			view.isActive = false;

			view._updatePosition();
			sinon.assert.notCalled( spy );

			view.isActive = true;

			view._updatePosition();

			// Note: #_updatePosition() is called on #change:isActive.
			sinon.assert.calledTwice( spy );
		} );

		it( 'uses getOptimalPosition() utility', () => {
			const { nw, sw, ne, se } = FloatingToolbarView.defaultPositions;

			view.isActive = true;

			const spy = testUtils.sinon.stub( positionUtils, 'getOptimalPosition' ).returns( {
				top: 5,
				left: 10
			} );

			view._updatePosition();

			sinon.assert.calledWithExactly( spy, {
				element: view.element,
				target: target,
				positions: [ nw, sw, ne, se ],
				limiter: global.document.body,
				fitInViewport: true
			} );

			expect( view.top ).to.equal( 5 );
			expect( view.left ).to.equal( 10 );
		} );
	} );

	describe( 'defaultPositions', () => {
		let targetRect, toolbarRect, defaultPositions;

		beforeEach( () => {
			defaultPositions = FloatingToolbarView.defaultPositions;

			targetRect = {
				top: 10,
				width: 100,
				left: 10,
				height: 10,
				bottom: 20
			};

			toolbarRect = {
				width: 20,
				height: 10
			};
		} );

		it( 'should provide "nw" position', () => {
			expect( defaultPositions.nw( targetRect, toolbarRect ) ).to.deep.equal( {
				top: 0,
				left: 10,
				name: 'nw'
			} );
		} );

		it( 'should provide "sw" position', () => {
			expect( defaultPositions.sw( targetRect, toolbarRect ) ).to.deep.equal( {
				top: 20,
				left: 10,
				name: 'sw'
			} );
		} );

		it( 'should provide "ne" position', () => {
			expect( defaultPositions.ne( targetRect, toolbarRect ) ).to.deep.equal( {
				top: 0,
				left: 90,
				name: 'ne'
			} );
		} );

		it( 'should provide "se" position', () => {
			expect( defaultPositions.se( targetRect, toolbarRect ) ).to.deep.equal( {
				top: 20,
				left: 90,
				name: 'se'
			} );
		} );
	} );
} );
