/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import DomConverter from 'ckeditor5-engine/src/view/domconverter';
import ViewEditable from 'ckeditor5-engine/src/view/editableelement';
import ViewDocument from 'ckeditor5-engine/src/view/document';
import { BR_FILLER, NBSP_FILLER } from 'ckeditor5-engine/src/view/filler';
import testUtils from 'ckeditor5-core/tests/_utils/utils';

testUtils.createSinonSandbox();

describe( 'DomConverter', () => {
	let converter;

	beforeEach( () => {
		converter = new DomConverter();
	} );

	describe( 'constructor()', () => {
		it( 'should create converter with BR block filler by default', () => {
			expect( converter.blockFiller ).to.equal( BR_FILLER );
		} );

		it( 'should create converter with defined block filler', () => {
			converter = new DomConverter( { blockFiller: NBSP_FILLER } );
			expect( converter.blockFiller ).to.equal( NBSP_FILLER );
		} );
	} );

	describe( 'focus', () => {
		let viewEditable, domEditable, viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument();
			viewEditable = new ViewEditable( 'div' );
			viewEditable.document = viewDocument;

			domEditable = document.createElement( 'div' );
			converter.bindElements( domEditable, viewEditable );
			domEditable.setAttribute( 'contenteditable', 'true' );
			document.body.appendChild( domEditable );
		} );

		afterEach( () => {
			document.body.removeChild( domEditable );
			viewDocument.destroy();
		} );

		it( 'should call focus on corresponding DOM editable', () => {
			const focusSpy = testUtils.sinon.spy( domEditable, 'focus' );

			converter.focus( viewEditable );

			expect( focusSpy.calledOnce ).to.be.true;
		} );

		it( 'should not focus already focused editable', () => {
			const focusSpy = testUtils.sinon.spy( domEditable, 'focus' );

			converter.focus( viewEditable );
			converter.focus( viewEditable );

			expect( focusSpy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'DOM nodes type checking', () => {
		let text, element, documentFragment;

		before( () => {
			text = document.createTextNode( 'test' );
			element = document.createElement( 'div' );
			documentFragment = document.createDocumentFragment();
		} );

		describe( 'isText', () => {
			it( 'should return true for Text nodes', () => {
				expect( converter.isText( text ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isText( element ) ).to.be.false;
				expect( converter.isText( documentFragment ) ).to.be.false;
				expect( converter.isText( {} ) ).to.be.false;
			} );
		} );

		describe( 'isElement', () => {
			it( 'should return true for HTMLElement nodes', () => {
				expect( converter.isElement( element ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isElement( text ) ).to.be.false;
				expect( converter.isElement( documentFragment ) ).to.be.false;
				expect( converter.isElement( {} ) ).to.be.false;
			} );
		} );

		describe( 'isDocumentFragment', () => {
			it( 'should return true for HTMLElement nodes', () => {
				expect( converter.isDocumentFragment( documentFragment ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isDocumentFragment( text ) ).to.be.false;
				expect( converter.isDocumentFragment( element ) ).to.be.false;
				expect( converter.isDocumentFragment( {} ) ).to.be.false;
			} );
		} );
	} );
} );
