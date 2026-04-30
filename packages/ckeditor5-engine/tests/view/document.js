/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { createElement, count } from '@ckeditor/ckeditor5-utils';
import { ViewDocument } from '../../src/view/document.js';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { createViewRoot } from './_utils/createroot.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'Document', () => {
	let domRoot, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		domRoot = createElement( document, 'div', {
			id: 'editor',
			contenteditable: 'true'
		} );
		document.body.appendChild( domRoot );

		viewDocument = new ViewDocument( new StylesProcessor() );
	} );

	afterEach( () => {
		domRoot.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should create the #roots collection', () => {
			expect( count( viewDocument.roots ) ).to.equal( 0 );
		} );

		it( 'should set the observable #isReadOnly property', () => {
			const spy = sinon.spy();

			expect( viewDocument.isReadOnly ).to.be.false;

			viewDocument.on( 'change:isReadOnly', spy );
			viewDocument.isReadOnly = true;
			sinon.assert.calledOnce( spy );
		} );

		it( 'should set the observable #isFocused property', () => {
			const spy = sinon.spy();

			expect( viewDocument.isFocused ).to.be.false;

			viewDocument.on( 'change:isFocused', spy );
			viewDocument.isFocused = true;
			sinon.assert.calledOnce( spy );
		} );

		it( 'should set the observable #isSelecting property', () => {
			const spy = sinon.spy();

			expect( viewDocument.isSelecting ).to.be.false;

			viewDocument.on( 'change:isSelecting', spy );
			viewDocument.isSelecting = true;
			sinon.assert.calledOnce( spy );
		} );

		it( 'should set the observable #isComposing property', () => {
			const spy = sinon.spy();

			expect( viewDocument.isComposing ).to.be.false;

			viewDocument.on( 'change:isComposing', spy );
			viewDocument.isComposing = true;
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'getRoot()', () => {
		it( 'should return "main" root', () => {
			createViewRoot( viewDocument, 'div', 'main' );

			expect( count( viewDocument.roots ) ).to.equal( 1 );

			expect( viewDocument.getRoot() ).to.equal( viewDocument.roots.get( 'main' ) );
		} );

		it( 'should return named root', () => {
			createViewRoot( viewDocument, 'h1', 'header' );

			expect( count( viewDocument.roots ) ).to.equal( 1 );

			expect( viewDocument.getRoot( 'header' ) ).to.equal( viewDocument.roots.get( 'header' ) );
		} );

		it( 'should return null when trying to get non-existent root', () => {
			expect( viewDocument.getRoot( 'not-existing' ) ).to.null;
		} );
	} );

	describe( 'getRoots()', () => {
		it( 'should return an empty array when no roots are registered', () => {
			expect( viewDocument.getRoots() ).to.deep.equal( [] );
		} );

		it( 'should return all registered roots in registration order', () => {
			const main = createViewRoot( viewDocument, 'div', 'main' );
			const header = createViewRoot( viewDocument, 'h1', 'header' );
			const footer = createViewRoot( viewDocument, 'div', 'footer' );

			expect( viewDocument.getRoots() ).to.deep.equal( [ main, header, footer ] );
		} );

		it( 'should return a new array on every call (not a live reference to the collection)', () => {
			createViewRoot( viewDocument, 'div', 'main' );

			const first = viewDocument.getRoots();
			const second = viewDocument.getRoots();

			expect( first ).to.not.equal( second );
			expect( first ).to.deep.equal( second );
		} );

		it( 'should not be affected by later modifications to the returned array', () => {
			const main = createViewRoot( viewDocument, 'div', 'main' );
			const roots = viewDocument.getRoots();

			roots.pop();

			expect( viewDocument.getRoots() ).to.deep.equal( [ main ] );
		} );

		it( 'should reflect roots added after a previous call', () => {
			const main = createViewRoot( viewDocument, 'div', 'main' );

			expect( viewDocument.getRoots() ).to.deep.equal( [ main ] );

			const secondary = createViewRoot( viewDocument, 'div', 'secondary' );

			expect( viewDocument.getRoots() ).to.deep.equal( [ main, secondary ] );
		} );
	} );

	describe( 'post-fixers', () => {
		it( 'should add a callback that is called on _callPostFixers', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const writerMock = {};

			viewDocument.registerPostFixer( spy1 );
			viewDocument.registerPostFixer( spy2 );

			sinon.assert.notCalled( spy1 );
			sinon.assert.notCalled( spy2 );
			viewDocument._callPostFixers( writerMock );
			sinon.assert.calledOnce( spy1 );
			sinon.assert.calledOnce( spy2 );
			sinon.assert.calledWithExactly( spy1, writerMock );
			sinon.assert.calledWithExactly( spy2, writerMock );
		} );

		it( 'should call post-fixer until all returns false', () => {
			let calls = 0;

			const spy1 = sinon.spy( () => calls++ < 2 );
			const spy2 = sinon.spy( () => calls++ < 2 );

			viewDocument.registerPostFixer( spy1 );
			viewDocument.registerPostFixer( spy2 );

			viewDocument._callPostFixers();

			expect( calls ).to.equal( 4 );
		} );
	} );
} );
