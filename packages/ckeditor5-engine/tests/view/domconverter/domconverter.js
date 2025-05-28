/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DomConverter from '../../../src/view/domconverter.js';
import ViewEditable from '../../../src/view/editableelement.js';
import ViewDocument from '../../../src/view/document.js';
import ViewUIElement from '../../../src/view/uielement.js';
import ViewContainerElement from '../../../src/view/containerelement.js';
import DowncastWriter from '../../../src/view/downcastwriter.js';
import { BR_FILLER, INLINE_FILLER, INLINE_FILLER_LENGTH, NBSP_FILLER, MARKED_NBSP_FILLER } from '../../../src/view/filler.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';
import ViewPosition from '../../../src/view/position.js';
import ViewRange from '../../../src/view/range.js';
import { ViewText } from '@ckeditor/ckeditor5-engine';

describe( 'DomConverter', () => {
	let converter, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		converter = new DomConverter( viewDocument );
	} );

	describe( 'constructor()', () => {
		it( 'should create converter with BR block filler mode by default', () => {
			expect( converter.blockFillerMode ).to.equal( 'br' );
		} );

		it( 'should create converter with defined block mode filler', () => {
			converter = new DomConverter( viewDocument, { blockFillerMode: 'nbsp' } );
			expect( converter.blockFillerMode ).to.equal( 'nbsp' );
		} );

		it( 'should create converter with proper default block mode filler - depending on the rendering mode', () => {
			converter = new DomConverter( viewDocument, { renderingMode: 'data' } );
			expect( converter.blockFillerMode ).to.equal( 'nbsp' );

			converter = new DomConverter( viewDocument, { renderingMode: 'editing' } );
			expect( converter.blockFillerMode ).to.equal( 'br' );
		} );
	} );

	describe( 'domDocument', () => {
		it( 'should return DOM document instance used by the DomConverter #1 - rendering mode data', () => {
			expect( converter.domDocument ).to.be.instanceof( globalThis.Document );
		} );

		it( 'should return DOM document instance used by the DomConverter #2 - rendering mode editing', () => {
			const converterEditing = new DomConverter( viewDocument, {
				renderingMode: 'editing'
			} );

			expect( converterEditing.domDocument ).to.equal( globalThis.document );
		} );
	} );

	describe( 'focus()', () => {
		let viewEditable, domEditable, domEditableParent, viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
			viewEditable = new ViewEditable( viewDocument, 'div' );

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

			testUtils.sinon.stub( global.document.documentElement, 'scrollLeft' ).get( () => 60 );
			testUtils.sinon.stub( global.document.documentElement, 'scrollTop' ).get( () => 600 );
			testUtils.sinon.stub( global.document.documentElement, 'scrollLeft' ).set( documentElementScrollLeftSpy );
			testUtils.sinon.stub( global.document.documentElement, 'scrollTop' ).set( documentElementScrollTopSpy );

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

			viewDocument = new ViewDocument( new StylesProcessor() );

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
		const blockElements = new Set( [
			'address', 'article', 'aside', 'blockquote', 'caption', 'center', 'dd', 'details', 'dir', 'div',
			'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
			'hgroup', 'legend', 'li', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'tbody',
			'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
		] );

		for ( const mode of [ 'nbsp', 'markedNbsp' ] ) {
			describe( 'mode "' + mode + '"', () => {
				beforeEach( () => {
					converter = new DomConverter( viewDocument, { blockFillerMode: mode } );
				} );

				for ( const elementName of blockElements ) {
					describe( `<${ elementName }> context`, () => {
						it( 'should return true if the node is an nbsp filler and is a single child of a block level element', () => {
							const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

							const context = document.createElement( elementName );
							context.appendChild( nbspFillerInstance );

							expect( converter.isBlockFiller( nbspFillerInstance ) ).to.be.true;
						} );

						it( 'should return false if the node is an nbsp filler and is not a single child of a block level element', () => {
							const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

							const context = document.createElement( elementName );
							context.appendChild( nbspFillerInstance );
							context.appendChild( document.createTextNode( 'a' ) );

							expect( converter.isBlockFiller( nbspFillerInstance ) ).to.be.false;
						} );

						it( 'should return false if there are two nbsp fillers in a block element', () => {
							const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

							const context = document.createElement( elementName );
							context.appendChild( nbspFillerInstance );
							context.appendChild( NBSP_FILLER( document ) ); // eslint-disable-line new-cap

							expect( converter.isBlockFiller( nbspFillerInstance ) ).to.be.false;
						} );

						it( 'should return false for a normal <br> element', () => {
							const context = document.createElement( elementName );
							context.innerHTML = 'x<br>x';

							expect( converter.isBlockFiller( context.childNodes[ 1 ] ) ).to.be.false;
						} );

						// SPECIAL CASE (see ckeditor5#5564).
						it( 'should return true for a <br> element which is the only child of its block parent', () => {
							const context = document.createElement( elementName );
							context.innerHTML = '<br>';

							expect( converter.isBlockFiller( context.firstChild ) ).to.be.true;
						} );
					} );
				}

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

				it( 'should return true if the node is an instance of the marked nbsp block filler', () => {
					const markedNbspFillerInstance = MARKED_NBSP_FILLER( document ); // eslint-disable-line new-cap

					expect( converter.isBlockFiller( markedNbspFillerInstance ) ).to.be.true;
				} );
			} );
		}

		describe( 'mode "br"', () => {
			beforeEach( () => {
				converter = new DomConverter( viewDocument, { blockFillerMode: 'br' } );
			} );

			it( 'should return true if the node is an instance of the BR block filler', () => {
				const brFillerInstance = BR_FILLER( document ); // eslint-disable-line new-cap

				expect( converter.isBlockFiller( brFillerInstance ) ).to.be.true;
				// Check it twice to ensure that caching breaks nothing.
				expect( converter.isBlockFiller( brFillerInstance ) ).to.be.true;
			} );

			it( 'should return false if the node is an instance of the NBSP block filler', () => {
				converter = new DomConverter( viewDocument, { blockFillerMode: 'br' } );
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

	describe( 'shouldRenderAttribute()', () => {
		it( 'should allow all in data pipeline', () => {
			expect( converter.shouldRenderAttribute( 'onclick', 'anything' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', 'javascript:something' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', '   javascript:something' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', 'data:image/svg,foo' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', ' data:image/svg,foo' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', 'data:text/html,foo' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', '   data:text/html,foo' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'srcdoc', '<script>something</script>' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'srcdoc', '<div onclick="alert(1)">' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'srcdoc', '<a href="javascript:alert(1)">' ) ).to.be.false;

			// Make sure it's rendered in the editing mode.
			expect( converter.shouldRenderAttribute( 'contenteditable', 'anything' ) ).to.be.true;

			// It should not filter out the attribute that do not match URI.
			expect( converter.shouldRenderAttribute( 'anything', 'foobar data:text/html,foo' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'anything', 'foobar javascript:something' ) ).to.be.true;

			converter.renderingMode = 'data';

			expect( converter.shouldRenderAttribute( 'onclick', 'anything' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'anything', 'javascript:something' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'anything', '   javascript:something' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'anything', 'data:image/svg,foo' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'anything', ' data:image/svg,foo' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'anything', 'data:text/html,foo' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'anything', '   data:text/html,foo' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'srcdoc', '<script>something</script>' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'srcdoc', '<div onclick="alert(1)">' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'srcdoc', '<a href="javascript:alert(1)">' ) ).to.be.true;

			expect( converter.shouldRenderAttribute( 'contenteditable', 'anything' ) ).to.be.true;
		} );

		it( 'should allow SVG in src attribute of img element', () => {
			expect( converter.shouldRenderAttribute( 'src', 'data:image/svg,foo', 'img' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'srcset', 'data:image/svg,foo', 'img' ) ).to.be.true;
		} );

		it( 'should allow SVG in srcset attribute of img element', () => {
			expect( converter.shouldRenderAttribute( 'srcset', 'data:image/svg,foo', 'img' ) ).to.be.true;
		} );

		it( 'should allow SVG in srcset attribute of source element', () => {
			expect( converter.shouldRenderAttribute( 'srcset', 'data:image/svg,foo', 'source' ) ).to.be.true;
		} );

		it( 'should accept all Base64-encoded content', () => {
			// Notice, that the Base64 string has a word starting with `on` and ending with `=` which could lead to false positives.
			expect( converter.shouldRenderAttribute( 'src', 'data:image/jpeg;base64,bAr+onZm9vonFy=' ) ).to.be.true;
		} );

		it( 'should reject certain attributes in the editing pipeline', () => {
			expect( converter.shouldRenderAttribute( 'some-attribute', 'anything' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'data-custom-attribute', 'anything' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'class', 'anything' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'style', 'anything' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'value', 'data:image/jpeg' ) ).to.be.true;
			expect( converter.shouldRenderAttribute( 'value', 'DATA:IMAGE/GIF' ) ).to.be.true;

			expect( converter.shouldRenderAttribute( 'onclick', 'anything' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'ONCLICK', 'anything' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', 'javascript:something' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', 'JAVASCRIPT:something' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', 'data:image/svg,foo' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'anything', 'data:text/html,foo' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'srcdoc', '<script>something</script>' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'srcdoc', '<SCRIPT>something</SCRIPT>' ) ).to.be.false;
			expect( converter.shouldRenderAttribute( 'srcdoc', 'something</SCRIPT>' ) ).to.be.false;
		} );
	} );

	describe( 'setContentOf()', () => {
		describe( 'data pipeline', () => {
			it( 'should set content as-is', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<span>bar</span></div>';

				converter.renderingMode = 'data';

				converter.setContentOf( element, html );

				expect( element.innerHTML ).to.equal( html );
			} );

			it( 'should keep attributes', () => {
				const element = document.createElement( 'p' );

				converter.renderingMode = 'data';

				const testCases = [
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" onclick="foobar">' +
							'bar' +
							'</span>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" onclick="foobar">' +
							'bar' +
							'</span>' +
							'</div>'
					},
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" value="javascript:baz">' +
							'bar' +
							'</span>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" value="javascript:baz">' +
							'bar' +
							'</span>' +
							'</div>'
					},
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" value="data:text/html">' +
							'bar' +
							'</span>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" value="data:text/html">' +
							'bar' +
							'</span>' +
							'</div>'
					},
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<iframe class="foo-class" style="border:1px solid blue" data-foo="bar" srcdoc="<script>baz</script>">' +
							'bar' +
							'</iframe>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<iframe class="foo-class" style="border:1px solid blue" data-foo="bar" srcdoc="<script>baz</script>">' +
							'bar' +
							'</iframe>' +
							'</div>'
					},
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" contenteditable="false">' +
							'bar' +
							'</span>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" contenteditable="false">' +
							'bar' +
							'</span>' +
							'</div>'
					}
				];

				testCases.forEach( ( testCase, index ) => {
					converter.setContentOf( element, testCase.html );

					expect( element.innerHTML, `Case #${ index }` ).to.equal( testCase.expected );
				} );
			} );

			it( 'should keep script element', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<script onclick="foo">bar</script></div>';

				converter.renderingMode = 'data';
				converter.setContentOf( element, html );

				expect( element.innerHTML ).to.equal( '<div>foo<script onclick="foo">bar</script></div>' );
			} );

			it( 'should keep style element', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<style nonce="foo">bar</style></div>';

				converter.renderingMode = 'data';
				converter.setContentOf( element, html );

				expect( element.innerHTML ).to.equal( '<div>foo<style nonce="foo">bar</style></div>' );
			} );
		} );

		describe( 'editing pipeline', () => {
			let warnStub;

			beforeEach( () => {
				warnStub = testUtils.sinon.stub( console, 'warn' );
			} );

			it( 'should replace certain unsafe attributes', () => {
				const element = document.createElement( 'p' );

				const testCases = [
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" onclick="foobar">' +
							'bar' +
							'</span>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<span ' +
								'class="foo-class" ' +
								'style="border:1px solid blue" ' +
								'data-foo="bar" ' +
								'data-ck-unsafe-attribute-onclick="foobar">bar' +
							'</span>' +
							'</div>'
					},
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" value="javascript:baz">' +
							'bar' +
							'</span>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<span ' +
								'class="foo-class" ' +
								'style="border:1px solid blue" ' +
								'data-foo="bar" ' +
								'data-ck-unsafe-attribute-value="javascript:baz">bar' +
							'</span>' +
							'</div>'
					},
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" value="data:text/html">' +
							'bar' +
							'</span>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<span ' +
								'class="foo-class" ' +
								'style="border:1px solid blue" ' +
								'data-foo="bar" ' +
								'data-ck-unsafe-attribute-value="data:text/html">bar' +
							'</span>' +
							'</div>'
					},
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<iframe class="foo-class" style="border:1px solid blue" data-foo="bar" srcdoc="<script>baz</script>">' +
							'bar' +
							'</iframe>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<iframe ' +
								'class="foo-class" ' +
								'style="border:1px solid blue" ' +
								'data-foo="bar" ' +
								'data-ck-unsafe-attribute-srcdoc="<script>baz</script>">bar' +
							'</iframe>' +
							'</div>'
					},
					{
						html: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" contenteditable="false">' +
							'bar' +
							'</span>' +
							'</div>',
						expected: '<div data-foo="bar">' +
							'foo' +
							'<span class="foo-class" style="border:1px solid blue" data-foo="bar" contenteditable="false">' +
							'bar' +
							'</span>' +
							'</div>'
					}
				];

				testCases.forEach( ( testCase, index ) => {
					converter.setContentOf( element, testCase.html );

					expect( element.innerHTML, `Case #${ index }` ).to.equal( testCase.expected );
				} );
			} );

			it( 'should warn when an unsafe attribute was detected and renamed', () => {
				const element = document.createElement( 'p' );
				const html = '<a href="foo" onclick="alert(1)">foo</a>';

				converter.setContentOf( element, html );

				sinon.assert.calledOnce( warnStub );
				sinon.assert.calledWithExactly( warnStub,
					sinon.match( /^domconverter-unsafe-attribute-detected/ ),
					{
						domElement: element.firstChild,
						key: 'onclick',
						value: 'alert(1)'
					},
					sinon.match.string // Link to the documentation
				);
			} );

			it( 'should replace a script element with a span', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<script class="foo-class" style="foo-style" data-foo="bar">bar</script></div>';

				converter.setContentOf( element, html );

				expect( element.innerHTML ).to.equal(
					'<div>foo<span data-ck-unsafe-element="script" class="foo-class" style="foo-style" data-foo="bar">bar</span></div>'
				);
			} );

			it( 'should warn when an unsafe script element was detected and renamed', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<script class="foo-class" style="foo-style" data-foo="bar">bar</script></div>';

				converter.setContentOf( element, html );

				sinon.assert.calledOnce( warnStub );
				sinon.assert.calledWithExactly( warnStub,
					sinon.match( /^domconverter-unsafe-script-element-detected/ ),
					sinon.match.string // Link to the documentation
				);
			} );

			it( 'should warn when an unsafe style element was detected and renamed', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<style class="foo-class" nonce="foo-nonce" data-foo="bar">bar</style></div>';

				converter.setContentOf( element, html );

				sinon.assert.calledOnce( warnStub );
				sinon.assert.calledWithExactly( warnStub,
					sinon.match( /^domconverter-unsafe-style-element-detected/ ),
					sinon.match.string // Link to the documentation
				);
			} );
		} );
	} );

	describe( 'setDomElementAttribute()', () => {
		let writer, warnStub;

		beforeEach( () => {
			writer = new DowncastWriter( viewDocument );
			converter = new DomConverter( viewDocument, {
				renderingMode: 'editing'
			} );

			warnStub = testUtils.sinon.stub( console, 'warn' )
				.withArgs( sinon.match( /^domconverter-unsafe-attribute-detected|domconverter-invalid-attribute-detected/ ) )
				.callsFake( () => {} );

			console.warn.callThrough();
		} );

		it( 'should set the plain value of an attribute', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, 'foo', 'bar' );

			expect( domElement.outerHTML ).to.equal( '<p foo="bar"></p>' );
		} );

		it( 'should not remove while overriding it\'s value (the plain value of an attribute)', () => {
			const domElement = document.createElement( 'p' );

			domElement.setAttribute( 'foo', '123' );

			const spy = sinon.spy( domElement, 'removeAttribute' );

			converter.setDomElementAttribute( domElement, 'foo', 'bar' );

			expect( domElement.outerHTML ).to.equal( '<p foo="bar"></p>' );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'should render the prefixed value of an attribute if considered unsafe', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, 'onclick', 'bar' );

			expect( domElement.outerHTML ).to.equal( '<p data-ck-unsafe-attribute-onclick="bar"></p>' );
		} );

		it( 'should not remove while overriding it\'s value (the value considered unsafe)', () => {
			const domElement = document.createElement( 'p' );

			domElement.setAttribute( 'data-ck-unsafe-attribute-onclick', '123' );

			const spy = sinon.spy( domElement, 'removeAttribute' );

			converter.setDomElementAttribute( domElement, 'onclick', 'bar' );

			expect( domElement.outerHTML ).to.equal( '<p data-ck-unsafe-attribute-onclick="bar"></p>' );
			expect( spy.callCount ).to.equal( 0 );
		} );

		it( 'should render the plain attribute if unsafe but declaratively permitted on the related view element', () => {
			const viewElement = writer.createContainerElement( 'p', {}, { renderUnsafeAttributes: [ 'onclick' ] } );
			viewElement.getFillerOffset = () => null;

			const domElement = converter.viewToDom( viewElement );

			converter.setDomElementAttribute( domElement, 'onclick', 'bar', viewElement );

			expect( domElement.outerHTML ).to.equal( '<p onclick="bar"></p>' );
		} );

		it( 'should render the prefixed value if the previous value was unsafe but the new one is safe (avoiding duplication)', () => {
			const domElement = document.createElement( 'iframe' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).to.equal( '<iframe data-ck-unsafe-attribute-src="data:image/svg,foo"></iframe>' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/png,foo' );
			expect( domElement.outerHTML ).to.equal( '<iframe src="data:image/png,foo"></iframe>' );
		} );

		it( 'should not render the prefixed value if the previous value was safe but the new one is unsafe (avoiding duplication)', () => {
			const domElement = document.createElement( 'iframe' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/png,foo' );
			expect( domElement.outerHTML ).to.equal( '<iframe src="data:image/png,foo"></iframe>' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).to.equal( '<iframe data-ck-unsafe-attribute-src="data:image/svg,foo"></iframe>' );
		} );

		it( 'should warn when an unsafe attribute was prefixed (renamed)', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, 'onclick', 'bar' );

			sinon.assert.calledOnce( warnStub );
			sinon.assert.calledWithExactly( warnStub,
				sinon.match( /^domconverter-unsafe-attribute-detected/ ),
				{
					domElement,
					key: 'onclick',
					value: 'bar'
				},
				sinon.match.string // Link to the documentation
			);
		} );

		it( 'should not render the attribute with invalid name', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, '200', 'foo' );
			expect( domElement.outerHTML ).to.equal( '<p></p>' );
		} );

		it( 'should warn when the attribute has invalid name', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, '200', 'foo' );

			sinon.assert.calledOnce( warnStub );
			sinon.assert.calledWithExactly( warnStub,
				sinon.match( /^domconverter-invalid-attribute-detected/ ),
				{
					domElement,
					key: '200',
					value: 'foo'
				},
				sinon.match.string // Link to the documentation
			);
		} );

		it( 'should set src attribute for SVG on img element', () => {
			const domElement = document.createElement( 'img' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).to.equal( '<img src="data:image/svg,foo">' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg+xml;base64,foo' );
			expect( domElement.outerHTML ).to.equal( '<img src="data:image/svg+xml;base64,foo">' );
		} );

		it( 'should set srcset attribute for SVG on img element', () => {
			const domElement = document.createElement( 'img' );

			converter.setDomElementAttribute( domElement, 'srcset', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).to.equal( '<img srcset="data:image/svg,foo">' );

			converter.setDomElementAttribute( domElement, 'srcset', 'data:image/svg+xml;base64,foo' );
			expect( domElement.outerHTML ).to.equal( '<img srcset="data:image/svg+xml;base64,foo">' );
		} );

		it( 'should set srcset attribute for SVG on source element', () => {
			const domElement = document.createElement( 'source' );

			converter.setDomElementAttribute( domElement, 'srcset', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).to.equal( '<source srcset="data:image/svg,foo">' );

			converter.setDomElementAttribute( domElement, 'srcset', 'data:image/svg+xml;base64,foo' );
			expect( domElement.outerHTML ).to.equal( '<source srcset="data:image/svg+xml;base64,foo">' );
		} );

		it( 'should transform src attribute to unsafe for SVG on iframe element', () => {
			const domElement = document.createElement( 'iframe' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).to.equal( '<iframe data-ck-unsafe-attribute-src="data:image/svg,foo"></iframe>' );
		} );

		it( 'should transform src attribute to unsafe for SVG on embed element', () => {
			const domElement = document.createElement( 'embed' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).to.equal( '<embed data-ck-unsafe-attribute-src="data:image/svg,foo">' );
		} );

		it( 'should transform data attribute to unsafe for SVG on object element', () => {
			const domElement = document.createElement( 'object' );

			converter.setDomElementAttribute( domElement, 'data', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).to.equal( '<object data-ck-unsafe-attribute-data="data:image/svg,foo"></object>' );
		} );
	} );

	describe( 'removeDomElementAttribute()', () => {
		beforeEach( () => {
			// Silence warnings about unsafe attributes and elements created by the DomConverter.
			testUtils.sinon.stub( console, 'warn' )
				.withArgs( sinon.match( /^domconverter-unsafe-attribute-detected/ ) )
				.callsFake( () => {} );

			console.warn
				.withArgs( sinon.match( /^domconverter-unsafe-script-element-detected/ ) )
				.callsFake( () => {} );

			console.warn
				.withArgs( sinon.match( /^domconverter-unsafe-style-element-detected/ ) )
				.callsFake( () => {} );

			console.warn.callThrough();
		} );

		it( 'should remove the plain attribute value', () => {
			const domElement = document.createElement( 'img' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/png,foo' );
			expect( domElement.outerHTML ).to.equal( '<img src="data:image/png,foo">' );

			converter.removeDomElementAttribute( domElement, 'src' );
			expect( domElement.outerHTML ).to.equal( '<img>' );
		} );

		it( 'should also remove the unsafe (prefixed) attribute value together with the safe value', () => {
			const domElement = document.createElement( 'iframe' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).to.equal( '<iframe data-ck-unsafe-attribute-src="data:image/svg,foo"></iframe>' );

			converter.removeDomElementAttribute( domElement, 'src' );
			expect( domElement.outerHTML ).to.equal( '<iframe></iframe>' );
		} );

		it( 'should skip removing the (replacement) attribute representing the unsafe <script> tag', () => {
			const domElement = document.createElement( 'p' );
			const html = 'foo<script class="foo-class" style="foo-style" data-foo="bar">bar</script>';

			converter.setContentOf( domElement, html );

			expect( domElement.outerHTML ).to.equal(
				'<p>foo<span data-ck-unsafe-element="script" class="foo-class" style="foo-style" data-foo="bar">bar</span></p>'
			);

			converter.removeDomElementAttribute( domElement.lastChild, 'data-ck-unsafe-element' );

			expect( domElement.outerHTML ).to.equal(
				'<p>foo<span data-ck-unsafe-element="script" class="foo-class" style="foo-style" data-foo="bar">bar</span></p>'
			);

			converter.removeDomElementAttribute( domElement.lastChild, 'class' );

			expect( domElement.outerHTML ).to.equal(
				'<p>foo<span data-ck-unsafe-element="script" style="foo-style" data-foo="bar">bar</span></p>'
			);
		} );

		it( 'should skip removing the (replacement) attribute representing the unsafe <style> tag', () => {
			const domElement = document.createElement( 'p' );
			const html = 'foo<style class="foo-class" style="foo-style" data-foo="bar">bar</style>';

			converter.setContentOf( domElement, html );

			expect( domElement.outerHTML ).to.equal(
				'<p>foo<span data-ck-unsafe-element="style" class="foo-class" style="foo-style" data-foo="bar">bar</span></p>'
			);

			converter.removeDomElementAttribute( domElement.lastChild, 'data-ck-unsafe-element' );

			expect( domElement.outerHTML ).to.equal(
				'<p>foo<span data-ck-unsafe-element="style" class="foo-class" style="foo-style" data-foo="bar">bar</span></p>'
			);

			converter.removeDomElementAttribute( domElement.lastChild, 'class' );

			expect( domElement.outerHTML ).to.equal(
				'<p>foo<span data-ck-unsafe-element="style" style="foo-style" data-foo="bar">bar</span></p>'
			);
		} );
	} );

	describe( '_clearDomSelection()', () => {
		let viewEditable, domEditable, domEditableParent, domP, domTextNode, viewP, viewText;

		beforeEach( () => {
			// View structure.
			viewEditable = new ViewEditable( viewDocument, 'div' );
			viewP = new ViewContainerElement( viewDocument, 'p' );
			viewText = new ViewText( viewDocument, 'foobar' );

			viewEditable._insertChild( 0, viewP );
			viewP._insertChild( 0, viewText );

			// DOM structure.
			domEditableParent = document.createElement( 'div' );
			domEditable = document.createElement( 'div' );
			domP = document.createElement( 'p' );
			domTextNode = document.createTextNode( 'foobar' );

			domEditable.setAttribute( 'contenteditable', 'true' );

			domP.appendChild( domTextNode );
			domEditable.appendChild( domP );
			domEditableParent.appendChild( domEditable );
			document.body.appendChild( domEditableParent );

			// Binding.
			converter.bindElements( domEditable, viewEditable );
			converter.bindElements( domP, viewP );
		} );

		afterEach( () => {
			converter.unbindDomElement( domEditable );
			document.body.removeChild( domEditableParent );
		} );

		it( 'should remove all selection ranges if selection is in editor editable element', () => {
			const domSelection = document.getSelection();
			const viewSelection = viewDocument.selection;

			domSelection.setBaseAndExtent( domTextNode, 3, domTextNode, 5 );
			viewSelection._setTo( new ViewRange(
				new ViewPosition( viewP.getChild( 0 ), 3 ),
				new ViewPosition( viewP.getChild( 0 ), 5 )
			) );

			converter._clearDomSelection();

			expect( domSelection.rangeCount ).to.equal( 0 );
		} );

		it( 'should do nothing if DOM selection is not in editor editable element', () => {
			const domSelection = document.getSelection();
			const viewSelection = viewDocument.selection;

			domSelection.setBaseAndExtent( domEditableParent, 0, domEditableParent, 0 );
			viewSelection._setTo( new ViewRange(
				new ViewPosition( viewP.getChild( 0 ), 3 ),
				new ViewPosition( viewP.getChild( 0 ), 5 )
			) );

			converter._clearDomSelection();

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.anchorNode ).to.equal( domEditableParent );
			expect( domSelection.anchorOffset ).to.equal( 0 );
			expect( domSelection.focusNode ).to.equal( domEditableParent );
			expect( domSelection.focusOffset ).to.equal( 0 );
		} );

		it( 'should do nothing if view selection is not in editor editable element', () => {
			const domSelection = document.getSelection();
			const viewSelection = viewDocument.selection;

			domSelection.setBaseAndExtent( domTextNode, 3, domTextNode, 5 );
			viewSelection._setTo( null );

			converter._clearDomSelection();

			expect( domSelection.rangeCount ).to.equal( 1 );
			expect( domSelection.anchorNode ).to.equal( domTextNode );
			expect( domSelection.anchorOffset ).to.equal( 3 );
			expect( domSelection.focusNode ).to.equal( domTextNode );
			expect( domSelection.focusOffset ).to.equal( 5 );
		} );
	} );
} );
