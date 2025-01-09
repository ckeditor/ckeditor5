/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import HtmlPageDataProcessor from '../src/htmlpagedataprocessor.js';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor.js';
import { StylesProcessor, ViewDocument, ViewDocumentFragment } from '@ckeditor/ckeditor5-engine';
import { stringify, parse } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

describe( 'HtmlPageDataProcessor', () => {
	let dataProcessor, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		dataProcessor = new HtmlPageDataProcessor( viewDocument );
	} );

	it( 'should extend HtmlDataProcessor', () => {
		expect( dataProcessor ).to.be.instanceOf( HtmlDataProcessor );
	} );

	describe( 'toView()', () => {
		it( 'should return empty DocumentFragment when empty string is passed', () => {
			const fragment = dataProcessor.toView( '' );

			expect( fragment ).to.be.an.instanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).to.be.undefined;
		} );

		it( 'should convert HTML to DocumentFragment with single text node', () => {
			const fragment = dataProcessor.toView( 'foo bar' );

			expect( stringify( fragment ) ).to.equal( 'foo bar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).to.be.undefined;
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = dataProcessor.toView( '<p>foo</p><p>bar</p>' );

			expect( stringify( fragment ) ).to.equal( '<p>foo</p><p>bar</p>' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).to.be.undefined;
		} );

		it( 'should not add any additional nodes', () => {
			const fragment = dataProcessor.toView( 'foo <b>bar</b> text' );

			expect( stringify( fragment ) ).to.equal( 'foo <b>bar</b> text' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).to.be.undefined;
		} );

		it( 'should set custom property for full document', () => {
			const fragment = dataProcessor.toView(
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">foobar</body>' +
				'</html>'
			);

			expect( stringify( fragment ) ).to.equal( 'foobar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).to.equal(
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).to.be.undefined;
		} );

		it( 'should set custom property for full document and doctype', () => {
			const fragment = dataProcessor.toView(
				'<!DOCTYPE html>' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">foobar</body>' +
				'</html>'
			);

			expect( stringify( fragment ) ).to.equal( 'foobar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).to.equal(
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).to.equal( '<!DOCTYPE html>' );
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).to.be.undefined;
		} );

		it( 'should set custom property for full document and xml declaration', () => {
			const fragment = dataProcessor.toView(
				'<?xml version="1.0" encoding="UTF-8"?>' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">foobar</body>' +
				'</html>'
			);

			expect( stringify( fragment ) ).to.equal( 'foobar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).to.equal(
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).to.be.undefined;
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).to.equal( '<?xml version="1.0" encoding="UTF-8"?>' );
		} );

		it( 'should set custom property for full document, doctype and xml declaration', () => {
			const fragment = dataProcessor.toView(
				'<?xml version="1.0" encoding="UTF-8"?>' +
				'<!DOCTYPE html>' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">foobar</body>' +
				'</html>'
			);

			expect( stringify( fragment ) ).to.equal( 'foobar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).to.equal(
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).to.equal( '<!DOCTYPE html>' );
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).to.equal( '<?xml version="1.0" encoding="UTF-8"?>' );
		} );
	} );

	describe( 'toData()', () => {
		it( 'should return empty string when empty DocumentFragment is passed', () => {
			const fragment = new ViewDocumentFragment( viewDocument );

			expect( dataProcessor.toData( fragment ) ).to.equal( '' );
		} );

		it( 'should return text if document fragment with single text node is passed', () => {
			const fragment = new ViewDocumentFragment( viewDocument );
			fragment._appendChild( parse( 'foo bar' ) );

			expect( dataProcessor.toData( fragment ) ).to.equal( 'foo bar' );
		} );

		it( 'should return multiple child nodes', () => {
			const fragment = parse( '<p>foo</p><p>bar</p>' );

			expect( dataProcessor.toData( fragment ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should return full page HTML if document fragment had custom property', () => {
			const fragment = parse( '<p>foo</p><p>bar</p>' );

			fragment._setCustomProperty(
				'$fullPageDocument',
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);

			expect( dataProcessor.toData( fragment ) ).to.equal(
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>'
			);
		} );

		it( 'should return full page HTML with doctype if document fragment had custom property', () => {
			const fragment = parse( '<p>foo</p><p>bar</p>' );

			fragment._setCustomProperty(
				'$fullPageDocument',
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			fragment._setCustomProperty(
				'$fullPageDocType',
				'<!DOCTYPE html>'
			);

			expect( dataProcessor.toData( fragment ) ).to.equal(
				'<!DOCTYPE html>\n' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>'
			);
		} );

		it( 'should return full page HTML with xml declaration if document fragment had custom property', () => {
			const fragment = parse( '<p>foo</p><p>bar</p>' );

			fragment._setCustomProperty(
				'$fullPageDocument',
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			fragment._setCustomProperty(
				'$fullPageXmlDeclaration',
				'<?xml version="1.0" encoding="UTF-8"?>'
			);

			expect( dataProcessor.toData( fragment ) ).to.equal(
				'<?xml version="1.0" encoding="UTF-8"?>\n' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>'
			);
		} );

		it( 'should return full page HTML with xml declaration and doctype if document fragment had custom property', () => {
			const fragment = parse( '<p>foo</p><p>bar</p>' );

			fragment._setCustomProperty(
				'$fullPageDocument',
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			fragment._setCustomProperty(
				'$fullPageXmlDeclaration',
				'<?xml version="1.0" encoding="UTF-8"?>'
			);
			fragment._setCustomProperty(
				'$fullPageDocType',
				'<!DOCTYPE html>'
			);

			expect( dataProcessor.toData( fragment ) ).to.equal(
				'<?xml version="1.0" encoding="UTF-8"?>\n' +
				'<!DOCTYPE html>\n' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>'
			);
		} );
	} );
} );
