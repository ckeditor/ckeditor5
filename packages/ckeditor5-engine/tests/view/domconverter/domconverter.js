/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ViewDomConverter } from '../../../src/view/domconverter.js';
import { ViewEditableElement } from '../../../src/view/editableelement.js';
import { ViewDocument } from '../../../src/view/document.js';
import { ViewUIElement } from '../../../src/view/uielement.js';
import { ViewContainerElement } from '../../../src/view/containerelement.js';
import { ViewDowncastWriter } from '../../../src/view/downcastwriter.js';
import { BR_FILLER, INLINE_FILLER, INLINE_FILLER_LENGTH, NBSP_FILLER, MARKED_NBSP_FILLER } from '../../../src/view/filler.js';
import { global } from '@ckeditor/ckeditor5-utils';
import { StylesProcessor } from '../../../src/view/stylesmap.js';
import { ViewPosition } from '../../../src/view/position.js';
import { ViewRange } from '../../../src/view/range.js';
import { ViewText } from '@ckeditor/ckeditor5-engine';

describe( 'ViewDomConverter', () => {
	let converter, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		converter = new ViewDomConverter( viewDocument );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'constructor()', () => {
		it( 'should create converter with BR block filler mode by default', () => {
			expect( converter.blockFillerMode ).toBe( 'br' );
		} );

		it( 'should create converter with defined block mode filler', () => {
			converter = new ViewDomConverter( viewDocument, { blockFillerMode: 'nbsp' } );
			expect( converter.blockFillerMode ).toBe( 'nbsp' );
		} );

		it( 'should create converter with proper default block mode filler - depending on the rendering mode', () => {
			converter = new ViewDomConverter( viewDocument, { renderingMode: 'data' } );
			expect( converter.blockFillerMode ).toBe( 'nbsp' );

			converter = new ViewDomConverter( viewDocument, { renderingMode: 'editing' } );
			expect( converter.blockFillerMode ).toBe( 'br' );
		} );
	} );

	describe( 'domDocument', () => {
		it( 'should return DOM document instance used by the ViewDomConverter #1 - rendering mode data', () => {
			expect( converter.domDocument ).toBeInstanceOf( globalThis.Document );
		} );

		it( 'should return DOM document instance used by the ViewDomConverter #2 - rendering mode editing', () => {
			const converterEditing = new ViewDomConverter( viewDocument, {
				renderingMode: 'editing'
			} );

			expect( converterEditing.domDocument ).toBe( globalThis.document );
		} );
	} );

	describe( 'focus()', () => {
		let viewEditable, domEditable, domEditableParent, viewDocument;

		beforeEach( () => {
			viewDocument = new ViewDocument( new StylesProcessor() );
			viewEditable = new ViewEditableElement( viewDocument, 'div' );

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
			const focusSpy = vi.spyOn( domEditable, 'focus' );

			converter.focus( viewEditable );

			expect( focusSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should not focus already focused editable', () => {
			const focusSpy = vi.spyOn( domEditable, 'focus' );

			converter.focus( viewEditable );
			converter.focus( viewEditable );

			expect( focusSpy ).toHaveBeenCalledOnce();
		} );

		it( 'should use preventScroll option', () => {
			const focusSpy = vi.spyOn( domEditable, 'focus' );

			converter.focus( viewEditable );

			expect( focusSpy ).toHaveBeenCalledOnce();
			expect( focusSpy.mock.calls[ 0 ][ 0 ] ).toEqual( { preventScroll: true } );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/951
		// https://github.com/ckeditor/ckeditor5-engine/issues/957
		it( 'should actively prevent scrolling', () => {
			const scrollToSpy = vi.spyOn( global.window, 'scrollTo' ).mockImplementation( () => {} );
			const editableScrollLeftSpy = vi.fn();
			const editableScrollTopSpy = vi.fn();
			const parentScrollLeftSpy = vi.fn();
			const parentScrollTopSpy = vi.fn();
			const documentElementScrollLeftSpy = vi.fn();
			const documentElementScrollTopSpy = vi.fn();

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

			vi.spyOn( global.document.documentElement, 'scrollLeft', 'get' ).mockReturnValue( 60 );
			vi.spyOn( global.document.documentElement, 'scrollTop', 'get' ).mockReturnValue( 600 );
			vi.spyOn( global.document.documentElement, 'scrollLeft', 'set' ).mockImplementation( documentElementScrollLeftSpy );
			vi.spyOn( global.document.documentElement, 'scrollTop', 'set' ).mockImplementation( documentElementScrollTopSpy );

			vi.spyOn( global.window, 'scrollX', 'get' ).mockReturnValue( 10 );
			vi.spyOn( global.window, 'scrollY', 'get' ).mockReturnValue( 100 );

			converter.focus( viewEditable );
			expect( scrollToSpy ).toHaveBeenCalledWith( 10, 100 );
			expect( editableScrollLeftSpy ).toHaveBeenCalledWith( 20 );
			expect( editableScrollTopSpy ).toHaveBeenCalledWith( 200 );
			expect( parentScrollLeftSpy ).toHaveBeenCalledWith( 40 );
			expect( parentScrollTopSpy ).toHaveBeenCalledWith( 400 );
			expect( documentElementScrollLeftSpy ).toHaveBeenCalledWith( 60 );
			expect( documentElementScrollTopSpy ).toHaveBeenCalledWith( 600 );
		} );
	} );

	describe( 'DOM nodes type checking', () => {
		let text, element, documentFragment, comment;

		beforeEach( () => {
			text = document.createTextNode( 'test' );
			element = document.createElement( 'div' );
			documentFragment = document.createDocumentFragment();
			comment = document.createComment( 'a' );
		} );

		describe( 'isElement()', () => {
			it( 'should return true for HTMLElement nodes', () => {
				expect( converter.isElement( element ) ).toBe( true );
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isElement( text ) ).toBe( false );
				expect( converter.isElement( documentFragment ) ).toBe( false );
				expect( converter.isElement( comment ) ).toBe( false );
				expect( converter.isElement( {} ) ).toBe( false );
			} );
		} );

		describe( 'isDocumentFragment()', () => {
			it( 'should return true for HTMLElement nodes', () => {
				expect( converter.isDocumentFragment( documentFragment ) ).toBe( true );
			} );

			it( 'should return false for other arguments', () => {
				expect( converter.isDocumentFragment( text ) ).toBe( false );
				expect( converter.isDocumentFragment( element ) ).toBe( false );
				expect( converter.isDocumentFragment( comment ) ).toBe( false );
				expect( converter.isDocumentFragment( {} ) ).toBe( false );
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
			expect( converter.isDomSelectionCorrect( sel1 ) ).toBe( true );

			// <p>INLINE_FILLERfoo[]<span></span></p>.
			const sel2 = domSelection( domP, 1, domP, 1 );
			expect( converter.isDomSelectionCorrect( sel2 ) ).toBe( true );

			// <p>INLINE_FILLERfoo<span></span>[]</p>.
			const sel3 = domSelection( domP, 2, domP, 2 );
			expect( converter.isDomSelectionCorrect( sel3 ) ).toBe( true );
		} );

		describe( 'should return false', () => {
			it( 'if anchor or focus is before filler node', () => {
				// Tests forward and backward selection.
				// <p>[INLINE_FILLERfoo]<span-ui><span-container></span></span></p>.
				const sel1 = domSelection( domP, 0, domP, 1 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).toBe( false );

				const sel2 = domSelection( domP, 1, domP, 0 );
				expect( converter.isDomSelectionCorrect( sel2 ) ).toBe( false );
			} );

			it( 'if anchor or focus is before filler sequence', () => {
				// Tests forward and backward selection.
				// <p>{INLINE_FILLERfoo}<span-ui><span-container></span></span></p>.
				const sel1 = domSelection( domFillerTextNode, 0, domFillerTextNode, INLINE_FILLER_LENGTH + 3 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).toBe( false );

				const sel2 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH + 3, domFillerTextNode, 0 );
				expect( converter.isDomSelectionCorrect( sel2 ) ).toBe( false );
			} );

			it( 'if anchor or focus is in the middle of filler sequence', () => {
				// Tests forward and backward selection.
				// <p>I{NLINE_FILLERfoo}<span-ui><span-container></span></span></p>.
				const sel1 = domSelection( domFillerTextNode, 1, domFillerTextNode, INLINE_FILLER_LENGTH + 3 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).toBe( false );

				const sel2 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH + 3, domFillerTextNode, 1 );
				expect( converter.isDomSelectionCorrect( sel2 ) ).toBe( false );
			} );

			it( 'if anchor or focus is directly inside dom element that represents view ui element', () => {
				// Set text indside ui element to put selection there.
				domUiSpan.innerText = 'xxx';
				// Tests forward and backward selection.
				// <p>INLINE_FILLER{foo<span-ui>xxx]<span-container></span></span></p>.
				const sel1 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH, domUiSpan, 1 );

				expect( converter.isDomSelectionCorrect( sel1 ) ).toBe( false );

				const sel2 = domSelection( domUiSpan, 1, domFillerTextNode, INLINE_FILLER_LENGTH );
				expect( converter.isDomSelectionCorrect( sel2 ) ).toBe( false );
			} );

			it( 'if anchor or focus is inside deep ui element structure (not directly in ui element)', () => {
				// Set text indside ui element to put selection there.
				domUiDeepSpan.innerText = 'xxx';
				// Tests forward and backward selection.
				// <p>INLINE_FILLER{foo<span-ui><span-container>xxx]</span></span></p>.
				const sel1 = domSelection( domFillerTextNode, INLINE_FILLER_LENGTH, domUiDeepSpan, 1 );
				expect( converter.isDomSelectionCorrect( sel1 ) ).toBe( false );

				const sel2 = domSelection( domUiDeepSpan, 1, domFillerTextNode, INLINE_FILLER_LENGTH );
				expect( converter.isDomSelectionCorrect( sel2 ) ).toBe( false );
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
					converter = new ViewDomConverter( viewDocument, { blockFillerMode: mode } );
				} );

				for ( const elementName of blockElements ) {
					describe( `<${ elementName }> context`, () => {
						it( 'should return true if the node is an nbsp filler and is a single child of a block level element', () => {
							const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

							const context = document.createElement( elementName );
							context.appendChild( nbspFillerInstance );

							expect( converter.isBlockFiller( nbspFillerInstance ) ).toBe( true );
						} );

						it( 'should return false if the node is an nbsp filler and is not a single child of a block level element', () => {
							const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

							const context = document.createElement( elementName );
							context.appendChild( nbspFillerInstance );
							context.appendChild( document.createTextNode( 'a' ) );

							expect( converter.isBlockFiller( nbspFillerInstance ) ).toBe( false );
						} );

						it( 'should return false if there are two nbsp fillers in a block element', () => {
							const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

							const context = document.createElement( elementName );
							context.appendChild( nbspFillerInstance );
							context.appendChild( NBSP_FILLER( document ) ); // eslint-disable-line new-cap

							expect( converter.isBlockFiller( nbspFillerInstance ) ).toBe( false );
						} );

						it( 'should return false for a normal <br> element', () => {
							const context = document.createElement( elementName );
							context.innerHTML = 'x<br>x';

							expect( converter.isBlockFiller( context.childNodes[ 1 ] ) ).toBe( false );
						} );

						// SPECIAL CASE (see https://github.com/ckeditor/ckeditor5/issues/5564).
						it( 'should return true for a <br> element which is the only child of its block parent', () => {
							const context = document.createElement( elementName );
							context.innerHTML = '<br>';

							expect( converter.isBlockFiller( context.firstChild ) ).toBe( true );
						} );
					} );
				}

				it( 'should return false filler is placed in a non-block element', () => {
					const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap

					const context = document.createElement( 'span' );
					context.appendChild( nbspFillerInstance );

					expect( converter.isBlockFiller( nbspFillerInstance ) ).toBe( false );
				} );

				it( 'should return false if the node is an instance of the BR block filler', () => {
					const brFillerInstance = BR_FILLER( document ); // eslint-disable-line new-cap

					expect( converter.isBlockFiller( brFillerInstance ) ).toBe( false );
				} );

				it( 'should return false for inline filler', () => {
					expect( converter.isBlockFiller( document.createTextNode( INLINE_FILLER ) ) ).toBe( false );
				} );

				it( 'should return false for a <br> element which is the only child of its non-block parent', () => {
					const context = document.createElement( 'span' );
					context.innerHTML = '<br>';

					expect( converter.isBlockFiller( context.firstChild ) ).toBe( false );
				} );

				it( 'should return false for a <br> element which is followed by an nbsp', () => {
					const context = document.createElement( 'span' );
					context.innerHTML = '<br>&nbsp;';

					expect( converter.isBlockFiller( context.firstChild ) ).toBe( false );
				} );

				it( 'should return true if the node is an instance of the marked nbsp block filler', () => {
					const markedNbspFillerInstance = MARKED_NBSP_FILLER( document ); // eslint-disable-line new-cap

					expect( converter.isBlockFiller( markedNbspFillerInstance ) ).toBe( true );
				} );
			} );
		}

		describe( 'mode "br"', () => {
			beforeEach( () => {
				converter = new ViewDomConverter( viewDocument, { blockFillerMode: 'br' } );
			} );

			it( 'should return true if the node is an instance of the BR block filler', () => {
				const brFillerInstance = BR_FILLER( document ); // eslint-disable-line new-cap

				expect( converter.isBlockFiller( brFillerInstance ) ).toBe( true );
				// Check it twice to ensure that caching breaks nothing.
				expect( converter.isBlockFiller( brFillerInstance ) ).toBe( true );
			} );

			it( 'should return false if the node is an instance of the NBSP block filler', () => {
				converter = new ViewDomConverter( viewDocument, { blockFillerMode: 'br' } );
				const nbspFillerInstance = NBSP_FILLER( document ); // eslint-disable-line new-cap
				// NBSP must be check inside a context.
				const context = document.createElement( 'div' );
				context.appendChild( nbspFillerInstance );

				expect( converter.isBlockFiller( nbspFillerInstance ) ).toBe( false );
			} );

			it( 'should return false for inline filler', () => {
				expect( converter.isBlockFiller( document.createTextNode( INLINE_FILLER ) ) ).toBe( false );
			} );
		} );
	} );

	describe( 'shouldRenderAttribute()', () => {
		it( 'should allow all in data pipeline', () => {
			expect( converter.shouldRenderAttribute( 'onclick', 'anything' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', 'javascript:something' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', '   javascript:something' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', 'data:image/svg,foo' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', ' data:image/svg,foo' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', 'data:text/html,foo' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', '   data:text/html,foo' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'srcdoc', '<script>something</script>' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'srcdoc', '<div onclick="alert(1)">' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'srcdoc', '<a href="javascript:alert(1)">' ) ).toBe( false );

			// Make sure it's rendered in the editing mode.
			expect( converter.shouldRenderAttribute( 'contenteditable', 'anything' ) ).toBe( true );

			// It should not filter out the attribute that do not match URI.
			expect( converter.shouldRenderAttribute( 'anything', 'foobar data:text/html,foo' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'anything', 'foobar javascript:something' ) ).toBe( true );

			converter.renderingMode = 'data';

			expect( converter.shouldRenderAttribute( 'onclick', 'anything' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'anything', 'javascript:something' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'anything', '   javascript:something' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'anything', 'data:image/svg,foo' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'anything', ' data:image/svg,foo' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'anything', 'data:text/html,foo' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'anything', '   data:text/html,foo' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'srcdoc', '<script>something</script>' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'srcdoc', '<div onclick="alert(1)">' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'srcdoc', '<a href="javascript:alert(1)">' ) ).toBe( true );

			expect( converter.shouldRenderAttribute( 'contenteditable', 'anything' ) ).toBe( true );
		} );

		it( 'should allow SVG in src attribute of img element', () => {
			expect( converter.shouldRenderAttribute( 'src', 'data:image/svg,foo', 'img' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'srcset', 'data:image/svg,foo', 'img' ) ).toBe( true );
		} );

		it( 'should allow SVG in srcset attribute of img element', () => {
			expect( converter.shouldRenderAttribute( 'srcset', 'data:image/svg,foo', 'img' ) ).toBe( true );
		} );

		it( 'should allow SVG in srcset attribute of source element', () => {
			expect( converter.shouldRenderAttribute( 'srcset', 'data:image/svg,foo', 'source' ) ).toBe( true );
		} );

		it( 'should accept all Base64-encoded content', () => {
			// Notice, that the Base64 string has a word starting with `on` and ending with `=` which could lead to false positives.
			expect( converter.shouldRenderAttribute( 'src', 'data:image/jpeg;base64,bAr+onZm9vonFy=' ) ).toBe( true );
		} );

		it( 'should reject certain attributes in the editing pipeline', () => {
			expect( converter.shouldRenderAttribute( 'some-attribute', 'anything' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'data-custom-attribute', 'anything' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'class', 'anything' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'style', 'anything' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'value', 'data:image/jpeg' ) ).toBe( true );
			expect( converter.shouldRenderAttribute( 'value', 'DATA:IMAGE/GIF' ) ).toBe( true );

			expect( converter.shouldRenderAttribute( 'onclick', 'anything' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'ONCLICK', 'anything' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', 'javascript:something' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', 'JAVASCRIPT:something' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', 'data:image/svg,foo' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'anything', 'data:text/html,foo' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'srcdoc', '<script>something</script>' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'srcdoc', '<SCRIPT>something</SCRIPT>' ) ).toBe( false );
			expect( converter.shouldRenderAttribute( 'srcdoc', 'something</SCRIPT>' ) ).toBe( false );
		} );
	} );

	describe( 'setContentOf()', () => {
		describe( 'data pipeline', () => {
			it( 'should set content as-is', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<span>bar</span></div>';

				converter.renderingMode = 'data';

				converter.setContentOf( element, html );

				expect( element.innerHTML ).toBe( html );
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
						// The Chrome browser in version 139 changed escaping `<` and `>` in attributes.
						// See: https://github.com/ckeditor/ckeditor5-commercial/issues/8122
						expected: '<div data-foo="bar">' +
							'foo' +
							'<iframe class="foo-class" style="border:1px solid blue" data-foo="bar" ' +
								'srcdoc="&lt;script&gt;baz&lt;/script&gt;">' +
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

					expect( element.innerHTML, `Case #${ index }` ).toBe( testCase.expected );
				} );
			} );

			it( 'should keep script element', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<script onclick="foo">bar</script></div>';

				converter.renderingMode = 'data';
				converter.setContentOf( element, html );

				expect( element.innerHTML ).toBe( '<div>foo<script onclick="foo">bar</script></div>' );
			} );

			it( 'should keep style element', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<style nonce="foo">bar</style></div>';

				converter.renderingMode = 'data';
				converter.setContentOf( element, html );

				expect( element.innerHTML ).toBe( '<div>foo<style nonce="foo">bar</style></div>' );
			} );
		} );

		describe( 'editing pipeline', () => {
			let warnStub;

			beforeEach( () => {
				warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
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
						// The Chrome browser in version 139 changed escaping `<` and `>` in attributes.
						// See: https://github.com/ckeditor/ckeditor5-commercial/issues/8122
						expected: '<div data-foo="bar">' +
							'foo' +
							'<iframe ' +
								'class="foo-class" ' +
								'style="border:1px solid blue" ' +
								'data-foo="bar" ' +
								'data-ck-unsafe-attribute-srcdoc="&lt;script&gt;baz&lt;/script&gt;">bar' +
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
					},
					// Newline characters in the src attribute are unsafe on Chromium as it executes
					// javascript: URLs with line breaks.
					{
						html: '<iframe src="jav&#10;ascript:console.log(\'unsafe\')"></iframe>',
						expected: '<iframe data-ck-unsafe-attribute-src="jav\nascript:console.log(\'unsafe\')"></iframe>'
					},
					{
						html: '<iframe src="jav&#13;ascript:console.log(\'unsafe\')"></iframe>',
						expected: '<iframe data-ck-unsafe-attribute-src="jav\rascript:console.log(\'unsafe\')"></iframe>'
					},
					{
						html: '<iframe srcdoc="<div>Hello&#10;World</div>"></iframe>',
						expected: '<iframe data-ck-unsafe-attribute-srcdoc="&lt;div&gt;Hello\nWorld&lt;/div&gt;"></iframe>'
					}
				];

				testCases.forEach( ( testCase, index ) => {
					converter.setContentOf( element, testCase.html );

					expect( element.innerHTML, `Case #${ index }` ).toBe( testCase.expected );
				} );
			} );

			it( 'should warn when an unsafe attribute was detected and renamed', () => {
				const element = document.createElement( 'p' );
				const html = '<a href="foo" onclick="alert(1)">foo</a>';

				converter.setContentOf( element, html );

				expect( warnStub ).toHaveBeenCalledOnce();
				expect( warnStub ).toHaveBeenCalledWith(
					expect.stringMatching( /^domconverter-unsafe-attribute-detected/ ),
					{
						domElement: element.firstChild,
						key: 'onclick',
						value: 'alert(1)'
					},
					expect.any( String ) // Link to the documentation
				);
			} );

			it( 'should replace a script element with a span', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<script class="foo-class" style="foo-style" data-foo="bar">bar</script></div>';

				converter.setContentOf( element, html );

				expect( element.innerHTML ).toBe(
					'<div>foo<span data-ck-unsafe-element="script" class="foo-class" style="foo-style" data-foo="bar">bar</span></div>'
				);
			} );

			it( 'should warn when an unsafe script element was detected and renamed', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<script class="foo-class" style="foo-style" data-foo="bar">bar</script></div>';

				converter.setContentOf( element, html );

				expect( warnStub ).toHaveBeenCalledOnce();
				expect( warnStub ).toHaveBeenCalledWith(
					expect.stringMatching( /^domconverter-unsafe-script-element-detected/ ),
					expect.any( String ) // Link to the documentation
				);
			} );

			it( 'should warn when an unsafe style element was detected and renamed', () => {
				const element = document.createElement( 'p' );
				const html = '<div>foo<style class="foo-class" nonce="foo-nonce" data-foo="bar">bar</style></div>';

				converter.setContentOf( element, html );

				expect( warnStub ).toHaveBeenCalledOnce();
				expect( warnStub ).toHaveBeenCalledWith(
					expect.stringMatching( /^domconverter-unsafe-style-element-detected/ ),
					expect.any( String ) // Link to the documentation
				);
			} );
		} );
	} );

	describe( 'setDomElementAttribute()', () => {
		let writer, warnStub;

		beforeEach( () => {
			writer = new ViewDowncastWriter( viewDocument );
			converter = new ViewDomConverter( viewDocument, {
				renderingMode: 'editing'
			} );

			warnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		} );

		it( 'should set the plain value of an attribute', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, 'foo', 'bar' );

			expect( domElement.outerHTML ).toBe( '<p foo="bar"></p>' );
		} );

		it( 'should not remove while overriding it\'s value (the plain value of an attribute)', () => {
			const domElement = document.createElement( 'p' );

			domElement.setAttribute( 'foo', '123' );

			const spy = vi.spyOn( domElement, 'removeAttribute' );

			converter.setDomElementAttribute( domElement, 'foo', 'bar' );

			expect( domElement.outerHTML ).toBe( '<p foo="bar"></p>' );
			expect( spy.mock.calls.length ).toBe( 0 );
		} );

		it( 'should render the prefixed value of an attribute if considered unsafe', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, 'onclick', 'bar' );

			expect( domElement.outerHTML ).toBe( '<p data-ck-unsafe-attribute-onclick="bar"></p>' );
		} );

		it( 'should not remove while overriding it\'s value (the value considered unsafe)', () => {
			const domElement = document.createElement( 'p' );

			domElement.setAttribute( 'data-ck-unsafe-attribute-onclick', '123' );

			const spy = vi.spyOn( domElement, 'removeAttribute' );

			converter.setDomElementAttribute( domElement, 'onclick', 'bar' );

			expect( domElement.outerHTML ).toBe( '<p data-ck-unsafe-attribute-onclick="bar"></p>' );
			expect( spy.mock.calls.length ).toBe( 0 );
		} );

		it( 'should render the plain attribute if unsafe but declaratively permitted on the related view element', () => {
			const viewElement = writer.createContainerElement( 'p', {}, { renderUnsafeAttributes: [ 'onclick' ] } );
			viewElement.getFillerOffset = () => null;

			const domElement = converter.viewToDom( viewElement );

			converter.setDomElementAttribute( domElement, 'onclick', 'bar', viewElement );

			expect( domElement.outerHTML ).toBe( '<p onclick="bar"></p>' );
		} );

		it( 'should render the prefixed value if the previous value was unsafe but the new one is safe (avoiding duplication)', () => {
			const domElement = document.createElement( 'iframe' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).toBe( '<iframe data-ck-unsafe-attribute-src="data:image/svg,foo"></iframe>' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/png,foo' );
			expect( domElement.outerHTML ).toBe( '<iframe src="data:image/png,foo"></iframe>' );
		} );

		it( 'should not render the prefixed value if the previous value was safe but the new one is unsafe (avoiding duplication)', () => {
			const domElement = document.createElement( 'iframe' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/png,foo' );
			expect( domElement.outerHTML ).toBe( '<iframe src="data:image/png,foo"></iframe>' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).toBe( '<iframe data-ck-unsafe-attribute-src="data:image/svg,foo"></iframe>' );
		} );

		it( 'should warn when an unsafe attribute was prefixed (renamed)', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, 'onclick', 'bar' );

			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub ).toHaveBeenCalledWith(
				expect.stringMatching( /^domconverter-unsafe-attribute-detected/ ),
				{
					domElement,
					key: 'onclick',
					value: 'bar'
				},
				expect.any( String ) // Link to the documentation
			);
		} );

		it( 'should not render the attribute with invalid name', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, 'space inside', 'foo' );
			expect( domElement.outerHTML ).toBe( '<p></p>' );
		} );

		it( 'should warn when the attribute has invalid name', () => {
			const domElement = document.createElement( 'p' );

			converter.setDomElementAttribute( domElement, 'space inside', 'foo' );

			expect( warnStub ).toHaveBeenCalledOnce();
			expect( warnStub ).toHaveBeenCalledWith(
				expect.stringMatching( /^domconverter-invalid-attribute-detected/ ),
				{
					domElement,
					key: 'space inside',
					value: 'foo'
				},
				expect.any( String ) // Link to the documentation
			);
		} );

		it( 'should set src attribute for SVG on img element', () => {
			const domElement = document.createElement( 'img' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).toBe( '<img src="data:image/svg,foo">' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg+xml;base64,foo' );
			expect( domElement.outerHTML ).toBe( '<img src="data:image/svg+xml;base64,foo">' );
		} );

		it( 'should set srcset attribute for SVG on img element', () => {
			const domElement = document.createElement( 'img' );

			converter.setDomElementAttribute( domElement, 'srcset', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).toBe( '<img srcset="data:image/svg,foo">' );

			converter.setDomElementAttribute( domElement, 'srcset', 'data:image/svg+xml;base64,foo' );
			expect( domElement.outerHTML ).toBe( '<img srcset="data:image/svg+xml;base64,foo">' );
		} );

		it( 'should set srcset attribute for SVG on source element', () => {
			const domElement = document.createElement( 'source' );

			converter.setDomElementAttribute( domElement, 'srcset', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).toBe( '<source srcset="data:image/svg,foo">' );

			converter.setDomElementAttribute( domElement, 'srcset', 'data:image/svg+xml;base64,foo' );
			expect( domElement.outerHTML ).toBe( '<source srcset="data:image/svg+xml;base64,foo">' );
		} );

		it( 'should transform src attribute to unsafe for SVG on iframe element', () => {
			const domElement = document.createElement( 'iframe' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).toBe( '<iframe data-ck-unsafe-attribute-src="data:image/svg,foo"></iframe>' );
		} );

		it( 'should transform src attribute to unsafe for SVG on embed element', () => {
			const domElement = document.createElement( 'embed' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).toBe( '<embed data-ck-unsafe-attribute-src="data:image/svg,foo">' );
		} );

		it( 'should transform data attribute to unsafe for SVG on object element', () => {
			const domElement = document.createElement( 'object' );

			converter.setDomElementAttribute( domElement, 'data', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).toBe( '<object data-ck-unsafe-attribute-data="data:image/svg,foo"></object>' );
		} );
	} );

	describe( 'removeDomElementAttribute()', () => {
		beforeEach( () => {
			// Silence warnings about unsafe attributes and elements created by the ViewDomConverter.
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		} );

		it( 'should remove the plain attribute value', () => {
			const domElement = document.createElement( 'img' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/png,foo' );
			expect( domElement.outerHTML ).toBe( '<img src="data:image/png,foo">' );

			converter.removeDomElementAttribute( domElement, 'src' );
			expect( domElement.outerHTML ).toBe( '<img>' );
		} );

		it( 'should also remove the unsafe (prefixed) attribute value together with the safe value', () => {
			const domElement = document.createElement( 'iframe' );

			converter.setDomElementAttribute( domElement, 'src', 'data:image/svg,foo' );
			expect( domElement.outerHTML ).toBe( '<iframe data-ck-unsafe-attribute-src="data:image/svg,foo"></iframe>' );

			converter.removeDomElementAttribute( domElement, 'src' );
			expect( domElement.outerHTML ).toBe( '<iframe></iframe>' );
		} );

		it( 'should skip removing the (replacement) attribute representing the unsafe <script> tag', () => {
			const domElement = document.createElement( 'p' );
			const html = 'foo<script class="foo-class" style="foo-style" data-foo="bar">bar</script>';

			converter.setContentOf( domElement, html );

			expect( domElement.outerHTML ).toBe(
				'<p>foo<span data-ck-unsafe-element="script" class="foo-class" style="foo-style" data-foo="bar">bar</span></p>'
			);

			converter.removeDomElementAttribute( domElement.lastChild, 'data-ck-unsafe-element' );

			expect( domElement.outerHTML ).toBe(
				'<p>foo<span data-ck-unsafe-element="script" class="foo-class" style="foo-style" data-foo="bar">bar</span></p>'
			);

			converter.removeDomElementAttribute( domElement.lastChild, 'class' );

			expect( domElement.outerHTML ).toBe(
				'<p>foo<span data-ck-unsafe-element="script" style="foo-style" data-foo="bar">bar</span></p>'
			);
		} );

		it( 'should skip removing the (replacement) attribute representing the unsafe <style> tag', () => {
			const domElement = document.createElement( 'p' );
			const html = 'foo<style class="foo-class" style="foo-style" data-foo="bar">bar</style>';

			converter.setContentOf( domElement, html );

			expect( domElement.outerHTML ).toBe(
				'<p>foo<span data-ck-unsafe-element="style" class="foo-class" style="foo-style" data-foo="bar">bar</span></p>'
			);

			converter.removeDomElementAttribute( domElement.lastChild, 'data-ck-unsafe-element' );

			expect( domElement.outerHTML ).toBe(
				'<p>foo<span data-ck-unsafe-element="style" class="foo-class" style="foo-style" data-foo="bar">bar</span></p>'
			);

			converter.removeDomElementAttribute( domElement.lastChild, 'class' );

			expect( domElement.outerHTML ).toBe(
				'<p>foo<span data-ck-unsafe-element="style" style="foo-style" data-foo="bar">bar</span></p>'
			);
		} );
	} );

	describe( '_clearDomSelection()', () => {
		let viewEditable, domEditable, domEditableParent, domP, domTextNode, viewP, viewText;

		beforeEach( () => {
			// View structure.
			viewEditable = new ViewEditableElement( viewDocument, 'div' );
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

			expect( domSelection.rangeCount ).toBe( 0 );
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

			expect( domSelection.rangeCount ).toBe( 1 );
			expect( domSelection.anchorNode ).toBe( domEditableParent );
			expect( domSelection.anchorOffset ).toBe( 0 );
			expect( domSelection.focusNode ).toBe( domEditableParent );
			expect( domSelection.focusOffset ).toBe( 0 );
		} );

		it( 'should do nothing if view selection is not in editor editable element', () => {
			const domSelection = document.getSelection();
			const viewSelection = viewDocument.selection;

			domSelection.setBaseAndExtent( domTextNode, 3, domTextNode, 5 );
			viewSelection._setTo( null );

			converter._clearDomSelection();

			expect( domSelection.rangeCount ).toBe( 1 );
			expect( domSelection.anchorNode ).toBe( domTextNode );
			expect( domSelection.anchorOffset ).toBe( 3 );
			expect( domSelection.focusNode ).toBe( domTextNode );
			expect( domSelection.focusOffset ).toBe( 5 );
		} );
	} );
} );
