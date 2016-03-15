/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import ControllerCollection from '/ckeditor5/ui/controllercollection.js';
import Controller from '/ckeditor5/ui/controller.js';
import View from '/ckeditor5/ui/view.js';

testUtils.createSinonSandbox();

let ParentView;

describe( 'ControllerCollection', () => {
	beforeEach( defineParentViewClass );

	describe( 'constructor', () => {
		it( 'should throw when no name is passed', () => {
			expect( () => {
				new ControllerCollection();
			} ).to.throw( /^ui-controllercollection-no-name/ );
		} );
	} );

	describe( 'add', () => {
		it( 'should add a child controller and return promise', () => {
			const parentController = new Controller();
			const childController = new Controller();
			const collection = new ControllerCollection( 'x' );

			parentController.collections.add( collection );

			const returned = collection.add( childController );

			expect( returned ).to.be.an.instanceof( Promise );
			expect( collection.get( 0 ) ).to.be.equal( childController );
		} );

		it( 'should add a child controller at given position', () => {
			const parentController = new Controller();
			const childController1 = new Controller();
			const childController2 = new Controller();
			const collection = new ControllerCollection( 'x' );

			parentController.collections.add( collection );

			collection.add( childController1 );
			collection.add( childController2, 0 );

			expect( collection.get( 0 ) ).to.be.equal( childController2 );
			expect( collection.get( 1 ) ).to.be.equal( childController1 );
		} );

		it( 'should initialize child controller if parent is ready', () => {
			const parentController = new Controller( null, new ParentView() );
			const childController = new Controller( null, new View() );
			const spy = testUtils.sinon.spy( childController, 'init' );
			const collection = new ControllerCollection( 'x' );

			parentController.collections.add( collection );
			collection.add( childController );
			collection.remove( childController );

			sinon.assert.notCalled( spy );

			return parentController.init()
				.then( () => {
					return collection.add( childController );
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );

		it( 'should not initialize child controller twice', () => {
			const parentController = new Controller( null, new ParentView() );
			const childController = new Controller( null, new View() );
			const spy = testUtils.sinon.spy( childController, 'init' );
			const collection = new ControllerCollection( 'x' );

			parentController.collections.add( collection );

			return parentController.init()
				.then( () => {
					return childController.init();
				} )
				.then( () => {
					return collection.add( childController );
				} )
				.then( () => {
					sinon.assert.calledOnce( spy );
				} );
		} );
	} );
} );

function defineParentViewClass() {
	ParentView = class extends View {
		constructor() {
			super();

			this.element = document.createElement( 'span' );
			this.register( 'x', true );
		}
	};
}
