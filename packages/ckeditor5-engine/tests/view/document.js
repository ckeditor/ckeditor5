/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement, count } from '@ckeditor/ckeditor5-utils';
import { ViewDocument } from '../../src/view/document.js';
import { createViewRoot } from './_utils/createroot.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'Document', () => {
	let domRoot, viewDocument;

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
			expect( count( viewDocument.roots ) ).toBe( 0 );
		} );

		it( 'should set the observable #isReadOnly property', () => {
			const spy = vi.fn();

			expect( viewDocument.isReadOnly ).toBe( false );

			viewDocument.on( 'change:isReadOnly', spy );
			viewDocument.isReadOnly = true;
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should set the observable #isFocused property', () => {
			const spy = vi.fn();

			expect( viewDocument.isFocused ).toBe( false );

			viewDocument.on( 'change:isFocused', spy );
			viewDocument.isFocused = true;
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should set the observable #isSelecting property', () => {
			const spy = vi.fn();

			expect( viewDocument.isSelecting ).toBe( false );

			viewDocument.on( 'change:isSelecting', spy );
			viewDocument.isSelecting = true;
			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should set the observable #isComposing property', () => {
			const spy = vi.fn();

			expect( viewDocument.isComposing ).toBe( false );

			viewDocument.on( 'change:isComposing', spy );
			viewDocument.isComposing = true;
			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'getRoot()', () => {
		it( 'should return "main" root', () => {
			createViewRoot( viewDocument, 'div', 'main' );

			expect( count( viewDocument.roots ) ).toBe( 1 );

			expect( viewDocument.getRoot() ).toBe( viewDocument.roots.get( 'main' ) );
		} );

		it( 'should return named root', () => {
			createViewRoot( viewDocument, 'h1', 'header' );

			expect( count( viewDocument.roots ) ).toBe( 1 );

			expect( viewDocument.getRoot( 'header' ) ).toBe( viewDocument.roots.get( 'header' ) );
		} );

		it( 'should return null when trying to get non-existent root', () => {
			expect( viewDocument.getRoot( 'not-existing' ) ).toBeNull();
		} );
	} );

	describe( 'getRoots()', () => {
		it( 'should return an empty array when no roots are registered', () => {
			expect( viewDocument.getRoots() ).toEqual( [] );
		} );

		it( 'should return all registered roots in registration order', () => {
			const main = createViewRoot( viewDocument, 'div', 'main' );
			const header = createViewRoot( viewDocument, 'h1', 'header' );
			const footer = createViewRoot( viewDocument, 'div', 'footer' );

			expect( viewDocument.getRoots() ).toEqual( [ main, header, footer ] );
		} );

		it( 'should return a new array on every call (not a live reference to the collection)', () => {
			createViewRoot( viewDocument, 'div', 'main' );

			const first = viewDocument.getRoots();
			const second = viewDocument.getRoots();

			expect( first ).not.toBe( second );
			expect( first ).toEqual( second );
		} );

		it( 'should not be affected by later modifications to the returned array', () => {
			const main = createViewRoot( viewDocument, 'div', 'main' );
			const roots = viewDocument.getRoots();

			roots.pop();

			expect( viewDocument.getRoots() ).toEqual( [ main ] );
		} );

		it( 'should reflect roots added after a previous call', () => {
			const main = createViewRoot( viewDocument, 'div', 'main' );

			expect( viewDocument.getRoots() ).toEqual( [ main ] );

			const secondary = createViewRoot( viewDocument, 'div', 'secondary' );

			expect( viewDocument.getRoots() ).toEqual( [ main, secondary ] );
		} );
	} );

	describe( 'post-fixers', () => {
		it( 'should add a callback that is called on _callPostFixers', () => {
			const spy1 = vi.fn();
			const spy2 = vi.fn();
			const writerMock = {};

			viewDocument.registerPostFixer( spy1 );
			viewDocument.registerPostFixer( spy2 );

			expect( spy1 ).not.toHaveBeenCalled();
			expect( spy2 ).not.toHaveBeenCalled();
			viewDocument._callPostFixers( writerMock );
			expect( spy1 ).toHaveBeenCalledOnce();
			expect( spy2 ).toHaveBeenCalledOnce();
			expect( spy1 ).toHaveBeenCalledWith( writerMock );
			expect( spy2 ).toHaveBeenCalledWith( writerMock );
		} );

		it( 'should call post-fixer until all returns false', () => {
			let calls = 0;

			const spy1 = vi.fn( () => calls++ < 2 );
			const spy2 = vi.fn( () => calls++ < 2 );

			viewDocument.registerPostFixer( spy1 );
			viewDocument.registerPostFixer( spy2 );

			viewDocument._callPostFixers();

			expect( calls ).toBe( 4 );
		} );
	} );
} );
