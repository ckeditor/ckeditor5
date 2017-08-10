/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import DomConverter from '../../../src/view/domconverter';
import ViewEditable from '../../../src/view/editableelement';
import ViewDocument from '../../../src/view/document';
import ViewUIElement from '../../../src/view/uielement';
import ViewContainerElement from '../../../src/view/containerelement';
import { BR_FILLER, NBSP_FILLER, INLINE_FILLER, INLINE_FILLER_LENGTH } from '../../../src/view/filler';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

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

	describe( 'focus()', () => {
		let viewEditable, domEditable, domEditableParent, viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument();
			viewEditable = new ViewEditable( 'div' );
			viewEditable.document = viewDocument;

			domEditable = document.createElement( 'div' );
			domEditableParent = document.createElement( 'div' );
			converter.bindElements( domEditable, viewEditable );
			domEditable.setAttribute( 'contenteditable', 'true' );
			domEditableParent.appendChild( domEditable );
			document.body.appendChild( domEditableParent );
		} );

		afterEach( () => {
			document.body.removeChild( domEditableParent );
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

		// https://github.com/ckeditor/ckeditor5-engine/issues/951
		// https://github.com/ckeditor/ckeditor5-engine/issues/957
		it( 'should actively prevent scrolling', () => {
			const scrollToSpy = testUtils.sinon.stub( global.window, 'scrollTo' );
			const editableScrollLeftSpy = sinon.spy();
			const editableScrollTopSpy = sinon.spy();
			const parentScrollLeftSpy = sinon.spy();
			const parentScrollTopSpy = sinon.spy();
			const documentElementScrollLeftSpy = sinon.spy();
			const documentElementScrollTopSpy = sinon.spy();

			Object.defineProperties( domEditable, {
				scrollLeft: {
					get: () => 20,
					set: editableScrollLeftSpy
				},
				scrollTop: {
					get: () => 200,
					set: editableScrollTopSpy
				}
			} );

			Object.defineProperties( domEditableParent, {
				scrollLeft: {
					get: () => 40,
					set: parentScrollLeftSpy
				},
				scrollTop: {
					get: () => 400,
					set: parentScrollTopSpy
				}
			} );

			Object.defineProperties( global.document.documentElement, {
				scrollLeft: {
					get: () => 60,
					set: documentElementScrollLeftSpy
				},
				scrollTop: {
					get: () => 600,
					set: documentElementScrollTopSpy
				}
			} );

			global.window.scrollX = 10;
			global.window.scrollY = 100;

			converter.focus( viewEditable );
			sinon.assert.calledWithExactly( scrollToSpy, 10, 100 );
			sinon.assert.calledWithExactly( editableScrollLeftSpy, 20 );
			sinon.assert.calledWithExactly( editableScrollTopSpy, 200 );
			sinon.assert.calledWithExactly( parentScrollLeftSpy, 40 );
			sinon.assert.calledWithExactly( parentScrollTopSpy, 400 );
			sinon.assert.calledWithExactly( documentElementScrollLeftSpy, 60 );
			sinon.assert.calledWithExactly( documentElementScrollTopSpy, 600 );
		} );
	} );

	describe( 'DOM nodes type checking', () => {
		let text, element, documentFragment, comment;

		before( () => {
			text = document.createTextNode( 'test' );
			element = document.createElement( 'div' );
			documentFragment = document.createDocumentFragment();
			comment = document.createComment( 'a' );
		} );

		describe( 'isText()', () => {
			it( 'should return true for Text nodes', () => {
				expect( converter.isText( text ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isText( element ) ).to.be.false;
				expect( converter.isText( documentFragment ) ).to.be.false;
				expect( converter.isText( comment ) ).to.be.false;
				expect( converter.isText( {} ) ).to.be.false;
			} );
		} );

		describe( 'isElement()', () => {
			it( 'should return true for HTMLElement nodes', () => {
				expect( converter.isElement( element ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isElement( text ) ).to.be.false;
				expect( converter.isElement( documentFragment ) ).to.be.false;
				expect( converter.isElement( comment ) ).to.be.false;
				expect( converter.isElement( {} ) ).to.be.false;
			} );
		} );

		describe( 'isDocumentFragment()', () => {
			it( 'should return true for HTMLElement nodes', () => {
				expect( converter.isDocumentFragment( documentFragment ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isDocumentFragment( text ) ).to.be.false;
				expect( converter.isDocumentFragment( element ) ).to.be.false;
				expect( converter.isDocumentFragment( comment ) ).to.be.false;
				expect( converter.isDocumentFragment( {} ) ).to.be.false;
			} );
		} );

		describe( 'isComment()', () => {
			it( 'should return true for HTML comments', () => {
				expect( converter.isComment( comment ) ).to.be.true;
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isComment( text ) ).to.be.false;
				expect( converter.isComment( element ) ).to.be.false;
				expect( converter.isComment( documentFragment ) ).to.be.false;
				expect( converter.isComment( {} ) ).to.be.false;
			} );
		} );
	} );

	describe( 'isDomSelectionCorrect()', () => {
		function domSelection( anchorParent, anchorOffset, focusParent, focusOffset ) {
			const sel = document.getSelection();

			sel.collapse( anchorParent, anchorOffset );
			sel.extend( focusParent, focusOffset );

			return sel;
		}

		let domP, domFillerTextNode, domUiSpan, domUiDeepSpan;

		beforeEach( () => {
			// <p>INLINE_FILLERfoo<span></span></p>.
			domP = document.createElement( 'p' );
			domFillerTextNode = document.createTextNode( INLINE_FILLER + 'foo' );
			domUiSpan = document.createElement( 'span' );

			domUiDeepSpan = document.createElement( 'span' );
			domUiSpan.appendChild( domUiDeepSpan );

			const viewUiSpan = new ViewUIElement( 'span' );
			const viewElementSpan = new ViewContainerElement( 'span' );

			domP.appendChild( domFillerTextNode );
			domP.appendChild( domUiSpan );

			converter.bindElements( domUiSpan, viewUiSpan );
			converter.bindElements( domUiDeepSpan, viewElementSpan );

			document.body.appendChild( domP );
		} );

		it( 'should return true for correct dom selection', () => {
			// <p>INLINE_FILLER{foo}<span></span></p>.
			const sel1 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH, domFillerTextNode, INLINE_FILLER_LENGTH + 3 );
			expect( converter.isDomSelectionCorrect( sel1 ) ).to.be.true;

			// <p>INLINE_FILLERfoo[]<span></span></p>.
			const sel2 = domSelection( domP, 1, domP, 1 );
			expect( converter.isDomSelectionCorrect( sel2 ) ).to.be.true;

			// <p>INLINE_FILLERfoo<span></span>[]</p>.
			const sel3 = domSelection( domP, 2, domP, 2 );
			expect( converter.isDomSelectionCorrect( sel3 ) ).to.be.true;
		} );

		describe( 'should return false', () => {
			it( 'if anchor or focus is before filler node', () => {
				// Tests forward and backward selection.
				// <p>[INLINE_FILLERfoo]<span-ui><span-container></span></span></p>.
				const sel1 = domSelection( domP, 0, domP, 1 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).to.be.false;

				const sel2 = domSelection( domP, 1, domP, 0 );
				expect( converter.isDomSelectionCorrect( sel2 ) ).to.be.false;
			} );

			it( 'if anchor or focus is before filler sequence', () => {
				// Tests forward and backward selection.
				// <p>{INLINE_FILLERfoo}<span-ui><span-container></span></span></p>.
				const sel1 = domSelection( domFillerTextNode, 0, domFillerTextNode, INLINE_FILLER_LENGTH + 3 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).to.be.false;

				const sel2 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH + 3, domFillerTextNode, 0 );
				expect( converter.isDomSelectionCorrect( sel2 ) ).to.be.false;
			} );

			it( 'if anchor or focus is in the middle of filler sequence', () => {
				// Tests forward and backward selection.
				// <p>I{NLINE_FILLERfoo}<span-ui><span-container></span></span></p>.
				const sel1 = domSelection( domFillerTextNode, 1, domFillerTextNode, INLINE_FILLER_LENGTH + 3 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).to.be.false;

				const sel2 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH + 3, domFillerTextNode, 1 );
				expect( converter.isDomSelectionCorrect( sel2 ) ).to.be.false;
			} );

			it( 'if anchor or focus is directly inside dom element that represents view ui element', () => {
				// Tests forward and backward selection.
				// <p>INLINE_FILLER{foo<span-ui>]<span-container></span></span></p>.
				const sel1 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH + 3, domUiSpan, 0 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).to.be.false;

				const sel2 = domSelection( domUiSpan, 0, domFillerTextNode, INLINE_FILLER_LENGTH + 3 );
				expect( converter.isDomSelectionCorrect( sel2 ) ).to.be.false;
			} );

			it( 'if anchor or focus is inside deep ui element structure (not directly in ui element)', () => {
				// Tests forward and backward selection.
				// <p>INLINE_FILLER{foo<span-ui><span-container>]</span></span></p>.
				const sel1 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH + 3, domUiDeepSpan, 0 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).to.be.false;

				const sel2 = domSelection( domUiDeepSpan, 0, domFillerTextNode, INLINE_FILLER_LENGTH + 3 );
				expect( converter.isDomSelectionCorrect( sel2 ) ).to.be.false;
			} );
		} );
	} );
} );
