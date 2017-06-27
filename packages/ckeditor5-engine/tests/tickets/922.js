/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import { setData as setViewData, getData as getViewData } from '../../src/dev-utils/view';
import ViewDocument from '../../src/view/document';
import { unwrap, insert } from '../../src/view/writer';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewPosition from '../../src/view/position';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml';

describe( 'Bug ckeditor5-engine#922', () => {
	let viewDoc, viewRoot, domRoot;

	beforeEach( () => {
		viewDoc = new ViewDocument();
		domRoot = document.createElement( 'div' );
		document.body.appendChild( domRoot );
		viewRoot = viewDoc.createRoot( domRoot );
	} );

	it( 'should properly render unwrapped attributes #1', () => {
		setViewData( viewDoc,
			'<container:p>' +
				'[<attribute:italic>' +
					'<attribute:strong>f</attribute:strong>' +
				'</attribute:italic>]' +
				'<attribute:strong>oo</attribute:strong>' +
			'</container:p>'
		);

		// Render it to DOM to create initial DOM <-> view mappings.
		viewDoc.render();

		// Unwrap italic attribute element.
		unwrap( viewDoc.selection.getFirstRange(), new ViewAttributeElement( 'italic' ) );
		expect( getViewData( viewDoc ) ).to.equal( '<p>[<strong>foo</strong>]</p>' );

		// Re-render changes in view to DOM.
		viewDoc.render();

		// Check if DOM is rendered correctly.
		expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><strong>foo</strong></p>' );
	} );

	it( 'should properly render unwrapped attributes #2', () => {
		setViewData( viewDoc,
			'<container:p>' +
				'[<attribute:italic>' +
					'<attribute:strong>foo</attribute:strong>' +
				'</attribute:italic>]' +
			'</container:p>' );

		// Render it to DOM to create initial DOM <-> view mappings.
		viewDoc.render();

		// Unwrap italic attribute element and change text inside.
		unwrap( viewDoc.selection.getFirstRange(), new ViewAttributeElement( 'italic' ) );
		viewRoot.getChild( 0 ).getChild( 0 ).getChild( 0 ).data = 'bar';
		expect( getViewData( viewDoc ) ).to.equal( '<p>[<strong>bar</strong>]</p>' );

		// Re-render changes in view to DOM.
		viewDoc.render();

		// Check if DOM is rendered correctly.
		expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><strong>bar</strong></p>' );
	} );

	it( 'should properly render if text is changed and element is inserted into same node #1', () => {
		setViewData( viewDoc,
			'<container:p>foo</container:p>'
		);

		// Render it to DOM to create initial DOM <-> view mappings.
		viewDoc.render();

		// Change text and insert new element into paragraph.
		const textNode = viewRoot.getChild( 0 ).getChild( 0 );
		textNode.data = 'foobar';
		insert( ViewPosition.createAfter( textNode ), new ViewAttributeElement( 'img' ) );
		expect( getViewData( viewDoc ) ).to.equal( '<p>foobar<img></img></p>' );

		// Re-render changes in view to DOM.
		viewDoc.render();

		// Check if DOM is rendered correctly.
		expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p>foobar<img></img></p>' );
	} );

	it( 'should properly render if text is changed and element is inserted into same node #2', () => {
		setViewData( viewDoc,
			'<container:p>foo</container:p>'
		);

		// Render it to DOM to create initial DOM <-> view mappings.
		viewDoc.render();

		// Change text and insert new element into paragraph.
		const textNode = viewRoot.getChild( 0 ).getChild( 0 );
		textNode.data = 'foobar';
		insert( ViewPosition.createBefore( textNode ), new ViewAttributeElement( 'img' ) );
		expect( getViewData( viewDoc ) ).to.equal( '<p><img></img>foobar</p>' );

		// Re-render changes in view to DOM.
		viewDoc.render();

		// Check if DOM is rendered correctly.
		expect( normalizeHtml( domRoot.innerHTML ) ).to.equal( '<p><img></img>foobar</p>' );
	} );
} );
