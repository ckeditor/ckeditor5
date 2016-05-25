/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: creator, browser-only */

'use strict';

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import Creator from '/ckeditor5/creator/creator.js';
import StandardCreator from '/ckeditor5/creator/standardcreator.js';
import Editor from '/ckeditor5/editor.js';
import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import Document from '/ckeditor5/engine/model/document.js';
import EditingController from '/ckeditor5/engine/editingcontroller.js';
import DataController from '/ckeditor5/engine/datacontroller.js';
import KeystrokeHandler from '/ckeditor5/keystrokehandler.js';

testUtils.createSinonSandbox();

describe( 'Creator', () => {
	let creator, editor;

	beforeEach( () => {
		const firstElement = document.createElement( 'div' );
		document.body.appendChild( firstElement );

		const secondElement = document.createElement( 'div' );
		document.body.appendChild( secondElement );

		editor = new Editor( { first: firstElement, second: secondElement } );
		creator = new StandardCreator( editor, new HtmlDataProcessor() );
	} );

	describe( 'constructor', () => {
		it( 'inherits from the Creator', () => {
			expect( creator ).to.be.instanceof( Creator );
		} );

		it( 'creates the engine', () => {
			expect( editor.document ).to.be.instanceof( Document );
			expect( editor.editing ).to.be.instanceof( EditingController );
			expect( editor.data ).to.be.instanceof( DataController );
			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );

		it( 'creates the keystroke handler', () => {
			expect( editor.keystrokes ).to.be.instanceof( KeystrokeHandler );
		} );

		it( 'uses HtmlDataProcessor if no processor is provided in constructor', () => {
			creator = new StandardCreator( editor );

			expect( editor.data.processor ).to.be.instanceof( HtmlDataProcessor );
		} );
	} );

	describe( 'create', () => {
		it( 'returns a promise', () => {
			expect( creator.create() ).to.be.instanceof( Promise );
		} );
	} );

	describe( 'destroy', () => {
		it( 'calls super.destroy', () => {
			const creatorSpy = testUtils.sinon.spy( Creator.prototype, 'destroy' );

			creator.destroy();

			expect( creatorSpy.called ).to.be.true;
		} );

		it( 'should destroy the engine', () => {
			const spy = editor.document.destroy = editor.data.destroy = editor.editing.destroy = sinon.spy();

			creator.destroy();

			expect( spy.callCount ).to.equal( 3 );
		} );

		it( 'should restore the replaced element', () => {
			const spy = testUtils.sinon.stub( creator, '_restoreElements' );

			creator.destroy();

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'updateEditorElement', () => {
		it( 'should pass data to the first element when element name not specified', () => {
			editor.getData = ( rootName ) => {
				expect( rootName ).to.equal( 'first' );

				return 'foo';
			};

			creator.updateEditorElement();

			expect( editor.firstElement.innerHTML ).to.equal( 'foo' );
		} );

		it( 'should pass data to the given element', () => {
			editor.elements.set( 'second', document.createElement( 'div' ) );

			editor.getData = ( rootName ) => {
				expect( rootName ).to.equal( 'second' );

				return 'foo';
			};

			creator.updateEditorElement( 'second' );

			expect( editor.elements.get( 'second' ).innerHTML ).to.equal( 'foo' );
		} );
	} );

	describe( 'updateEditorElements', () => {
		it( 'updates all editor elements', () => {
			const spy = sinon.stub( creator, 'updateEditorElement' );

			creator.updateEditorElements();

			expect( spy.calledTwice ).to.be.true;
			expect( spy.calledWith( 'first' ) ).to.be.true;
			expect( spy.calledWith( 'second' ) ).to.be.true;
		} );
	} );

	describe( 'loadDataFromEditorElement', () => {
		it( 'should pass data to the first element', () => {
			editor.setData = sinon.spy();

			editor.elements.get( 'first' ).innerHTML = 'foo';
			creator.loadDataFromEditorElement();

			expect( editor.setData.calledWithExactly( 'foo', 'first' ) ).to.be.true;
		} );

		it( 'should pass data to the given element', () => {
			const element = document.createElement( 'div' );
			element.innerHTML = 'foo';

			editor.elements.set( 'second', element );

			editor.setData = sinon.spy();

			creator.loadDataFromEditorElement( 'second' );

			expect( editor.setData.calledWithExactly( 'foo', 'second' ) ).to.be.true;
		} );
	} );

	describe( 'loadDataFromEditorElements', () => {
		it( 'updates all editor elements', () => {
			const spy = sinon.stub( creator, 'loadDataFromEditorElement' );

			creator.loadDataFromEditorElements();

			expect( spy.calledTwice ).to.be.true;
			expect( spy.calledWith( 'first' ) ).to.be.true;
			expect( spy.calledWith( 'second' ) ).to.be.true;
		} );
	} );

	describe( 'getDataFromElement', () => {
		[ 'textarea', 'template', 'div' ].forEach( ( elementName ) => {
			it( 'should return the content of a ' + elementName, function() {
				const data = StandardCreator.getDataFromElement( document.getElementById( 'getData-' + elementName ) );
				expect( data ).to.equal( '<b>foo</b>' );
			} );
		} );
	} );

	describe( 'setDataInElement', () => {
		[ 'textarea', 'template', 'div' ].forEach( ( elementName ) => {
			it( 'should set the content of a ' + elementName, () => {
				const el = document.createElement( elementName );
				const expectedData = '<b>foo</b>';

				StandardCreator.setDataInElement( el, expectedData );

				const actualData = StandardCreator.getDataFromElement( el );
				expect( actualData ).to.equal( actualData );
			} );
		} );
	} );

	describe( '_replaceElement', () => {
		it( 'should hide the element', () => {
			const el = editor.elements.get( 'first' );

			creator._replaceElement( el );

			expect( el.style.display ).to.equal( 'none' );
		} );

		it( 'should inserts the replacement next to the element being hidden', () => {
			const el = editor.elements.get( 'first' );
			const replacement = document.createElement( 'div' );

			creator._replaceElement( el, replacement );

			expect( el.nextSibling ).to.equal( replacement );
		} );
	} );

	describe( '_restoreElements', () => {
		it( 'should restore all elements', () => {
			const el1 = editor.elements.get( 'first' );
			const replacement1 = document.createElement( 'div' );
			const el2 = editor.elements.get( 'second' );
			const replacement2 = document.createElement( 'div' );

			creator._replaceElement( el1, replacement1 );
			creator._replaceElement( el2, replacement2 );

			creator._restoreElements();

			expect( replacement1.parentNode ).to.be.null;
			expect( replacement2.parentNode ).to.be.null;
			expect( el2.style.display ).to.not.equal( 'none' );
		} );

		it( 'should not try to remove replacement elements', () => {
			const el1 = editor.elements.get( 'first' );
			const el2 = editor.elements.get( 'second' );

			creator._replaceElement( el1 );
			creator._replaceElement( el2 );

			creator._restoreElements();

			expect( el1.style.display ).to.not.equal( 'none' );
			expect( el2.style.display ).to.not.equal( 'none' );
		} );
	} );
} );
