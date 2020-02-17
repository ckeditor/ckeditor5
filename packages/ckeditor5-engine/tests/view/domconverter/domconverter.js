/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import DomConverter from '../../../src/view/domconverter';
import ViewEditable from '../../../src/view/editableelement';
import ViewDocument from '../../../src/view/document';
import ViewUIElement from '../../../src/view/uielement';
import ViewContainerElement from '../../../src/view/containerelement';
import { BR_FILLER, INLINE_FILLER, INLINE_FILLER_LENGTH, NBSP_FILLER } from '../../../src/view/filler';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

describe( 'DomConverter', () => {
	let converter;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		converter = new DomConverter();
	} );

	describe( 'constructor()', () => {
		it( 'should create converter with BR block filler mode by default', () => {
			expect( converter.blockFillerMode ).to.equal( 'br' );
		} );

		it( 'should create converter with defined block mode filler', () => {
			converter = new DomConverter( { blockFillerMode: 'nbsp' } );
			expect( converter.blockFillerMode ).to.equal( 'nbsp' );
		} );
	} );

	describe( 'focus()', () => {
		let viewEditable, domEditable, domEditableParent, viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument();
			viewEditable = new ViewEditable( viewDocument, 'div' );
			viewEditable._document = viewDocument;

			domEditable = document.createElement( 'div' );
			domEditableParent = document.createElement( 'div' );
			converter.bindElements( domEditable, viewEditable );
			domEditable.setAttribute( 'contenteditable', 'true' );
			domEditableParent.appendChild( domEditable );
			document.body.appendChild( domEditableParent );
		} );

		afterEach( () => {
			converter.unbindDomElement( domEditable );
			document.body.removeChild( domEditableParent );

			document.body.focus();
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

			testUtils.sinon.stub( global.window, 'scrollX' ).get( () => 10 );
			testUtils.sinon.stub( global.window, 'scrollY' ).get( () => 100 );

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

		let domP, domFillerTextNode, domUiSpan, domUiDeepSpan, viewDocument;

		beforeEach( () => {
			// <p>INLINE_FILLERfoo<span></span></p>.
			domP = document.createElement( 'p' );
			domFillerTextNode = document.createTextNode( INLINE_FILLER + 'foo' );
			domUiSpan = document.createElement( 'span' );

			domUiDeepSpan = document.createElement( 'span' );
			domUiSpan.appendChild( domUiDeepSpan );

			viewDocument = new ViewDocument();

			const viewUiSpan = new ViewUIElement( viewDocument, 'span' );
			const viewElementSpan = new ViewContainerElement( viewDocument, 'span' );

			domP.appendChild( domFillerTextNode );
			domP.appendChild( domUiSpan );

			converter.bindElements( domUiSpan, viewUiSpan );
			converter.bindElements( domUiDeepSpan, viewElementSpan );

			document.body.appendChild( domP );
		} );

		afterEach( () => {
			domP.remove();
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
				// Set text indside ui element to put selection there.
				domUiSpan.innerText = 'xxx';
				// Tests forward and backward selection.
				// <p>INLINE_FILLER{foo<span-ui>xxx]<span-container></span></span></p>.
				const sel1 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH, domUiSpan, 1 );

				expect( converter.isDomSelectionCorrect( sel1 ) ).to.be.false;

				const sel2 = domSelection( domUiSpan, 1, domFillerTextNode, INLINE_FILLER_LENGTH );
				expect( converter.isDomSelectionCorrect( sel2 ) ).to.be.false;
			} );

			it( 'if anchor or focus is inside deep ui element structure (not directly in ui element)', () => {
				// Set text indside ui element to put selection there.
				domUiDeepSpan.innerText = 'xxx';
				// Tests forward and backward selection.
				// <p>INLINE_FILLER{foo<span-ui><span-container>xxx]</span></span></p>.
				const sel1 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH, domUiDeepSpan, 1 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).to.be.false;

				const sel2 = domSelection( domUiDeepSpan, 1, domFillerTextNode, INLINE_FILLER_LENGTH );
				expect( converter.isDomSelectionCorrect( sel2 ) ).to.be.false;
			} );
		} );
	} );

	describe( 'isBlockFiller()', () => {
		describe( 'mode "nbsp"', () => {
			beforeEach( () => {
				converter = new DomConverter( { blockFillerMode: 'nbsp' } );
			} );

			it( 'should return true if the node is an nbsp filler and is a single child of a block level element', () => {
				const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

				const context = document.createElement( 'div' );
				context.appendChild( nbspFillerInstance );

				expect( converter.isBlockFiller( nbspFillerInstance ) ).to.be.true;
			} );

			it( 'should return false if the node is an nbsp filler and is not a single child of a block level element', () => {
				const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

				const context = document.createElement( 'div' );
				context.appendChild( nbspFillerInstance );
				context.appendChild( document.createTextNode( 'a' ) );

				expect( converter.isBlockFiller( nbspFillerInstance ) ).to.be.false;
			} );

			it( 'should return false if there are two nbsp fillers in a block element', () => {
				const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

				const context = document.createElement( 'div' );
				context.appendChild( nbspFillerInstance );
				context.appendChild( NBSP_FILLER( document ) ); // eslint-disable-line new-cap

				expect( converter.isBlockFiller( nbspFillerInstance ) ).to.be.false;
			} );

			it( 'should return false filler is placed in a non-block element', () => {
				const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

				const context = document.createElement( 'span' );
				context.appendChild( nbspFillerInstance );

				expect( converter.isBlockFiller( nbspFillerInstance ) ).to.be.false;
			} );

			it( 'should return false if the node is an instance of the BR block filler', () => {
				const brFillerInstance = BR_FILLER( document ); // eslint-disable-line new-cap

				expect( converter.isBlockFiller( brFillerInstance ) ).to.be.false;
			} );

			it( 'should return false for inline filler', () => {
				expect( converter.isBlockFiller( document.createTextNode( INLINE_FILLER ) ) ).to.be.false;
			} );

			it( 'should return false for a normal <br> element', () => {
				const context = document.createElement( 'div' );
				context.innerHTML = 'x<br>x';

				expect( converter.isBlockFiller( context.childNodes[ 1 ] ) ).to.be.false;
			} );

			// SPECIAL CASE (see ckeditor5#5564).
			it( 'should return true for a <br> element which is the only child of its block parent', () => {
				const context = document.createElement( 'div' );
				context.innerHTML = '<br>';

				expect( converter.isBlockFiller( context.firstChild ) ).to.be.true;
			} );

			it( 'should return false for a <br> element which is the only child of its non-block parent', () => {
				const context = document.createElement( 'span' );
				context.innerHTML = '<br>';

				expect( converter.isBlockFiller( context.firstChild ) ).to.be.false;
			} );

			it( 'should return false for a <br> element which is followed by an nbsp', () => {
				const context = document.createElement( 'span' );
				context.innerHTML = '<br>&nbsp;';

				expect( converter.isBlockFiller( context.firstChild ) ).to.be.false;
			} );
		} );

		describe( 'mode "br"', () => {
			beforeEach( () => {
				converter = new DomConverter( { blockFillerMode: 'br' } );
			} );

			it( 'should return true if the node is an instance of the BR block filler', () => {
				const brFillerInstance = BR_FILLER( document ); // eslint-disable-line new-cap

				expect( converter.isBlockFiller( brFillerInstance ) ).to.be.true;
				// Check it twice to ensure that caching breaks nothing.
				expect( converter.isBlockFiller( brFillerInstance ) ).to.be.true;
			} );

			it( 'should return false if the node is an instance of the NBSP block filler', () => {
				converter = new DomConverter( { blockFillerMode: 'br' } );
				const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap
				// NBSP must be check inside a context.
				const context = document.createElement( 'div' );
				context.appendChild( nbspFillerInstance );

				expect( converter.isBlockFiller( nbspFillerInstance ) ).to.be.false;
			} );

			it( 'should return false for inline filler', () => {
				expect( converter.isBlockFiller( document.createTextNode( INLINE_FILLER ) ) ).to.be.false;
			} );
		} );
	} );
} );
