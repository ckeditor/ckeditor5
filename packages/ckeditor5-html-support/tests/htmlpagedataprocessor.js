/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HtmlPageDataProcessor } from '../src/htmlpagedataprocessor.js';
import {
	HtmlDataProcessor,
	StylesProcessor,
	ViewDocument,
	ViewDocumentFragment,
	_stringifyView,
	_parseView
} from '@ckeditor/ckeditor5-engine';

describe( 'HtmlPageDataProcessor', () => {
	let dataProcessor, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		dataProcessor = new HtmlPageDataProcessor( viewDocument );
	} );

	it( 'should extend HtmlDataProcessor', () => {
		expect( dataProcessor ).toBeInstanceOf( HtmlDataProcessor );
	} );

	describe( 'toView()', () => {
		it( 'should return empty DocumentFragment when empty string is passed', () => {
			const fragment = dataProcessor.toView( '' );

			expect( fragment ).toBeInstanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).toBe( 0 );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).toBeUndefined();
		} );

		it( 'should convert HTML to DocumentFragment with single text node', () => {
			const fragment = dataProcessor.toView( 'foo bar' );

			expect( _stringifyView( fragment ) ).toBe( 'foo bar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).toBeUndefined();
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = dataProcessor.toView( '<p>foo</p><p>bar</p>' );

			expect( _stringifyView( fragment ) ).toBe( '<p>foo</p><p>bar</p>' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).toBeUndefined();
		} );

		it( 'should not add any additional nodes', () => {
			const fragment = dataProcessor.toView( 'foo <b>bar</b> text' );

			expect( _stringifyView( fragment ) ).toBe( 'foo <b>bar</b> text' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).toBeUndefined();
		} );

		it( 'should set custom property for full document', () => {
			const fragment = dataProcessor.toView(
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">foobar</body>' +
				'</html>'
			);

			expect( _stringifyView( fragment ) ).toBe( 'foobar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).toBe(
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).toBeUndefined();
		} );

		it( 'should set custom property for full document and doctype', () => {
			const fragment = dataProcessor.toView(
				'<!DOCTYPE html>' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">foobar</body>' +
				'</html>'
			);

			expect( _stringifyView( fragment ) ).toBe( 'foobar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).toBe(
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).toBe( '<!DOCTYPE html>' );
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).toBeUndefined();
		} );

		it( 'should set custom property for full document and xml declaration', () => {
			const fragment = dataProcessor.toView(
				'<?xml version="1.0" encoding="UTF-8"?>' +
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">foobar</body>' +
				'</html>'
			);

			expect( _stringifyView( fragment ) ).toBe( 'foobar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).toBe(
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).toBeUndefined();
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).toBe( '<?xml version="1.0" encoding="UTF-8"?>' );
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

			expect( _stringifyView( fragment ) ).toBe( 'foobar' );
			expect( fragment.getCustomProperty( '$fullPageDocument' ) ).toBe(
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			expect( fragment.getCustomProperty( '$fullPageDocType' ) ).toBe( '<!DOCTYPE html>' );
			expect( fragment.getCustomProperty( '$fullPageXmlDeclaration' ) ).toBe( '<?xml version="1.0" encoding="UTF-8"?>' );
		} );
	} );

	describe( 'toData()', () => {
		it( 'should return empty string when empty DocumentFragment is passed', () => {
			const fragment = new ViewDocumentFragment( viewDocument );

			expect( dataProcessor.toData( fragment ) ).toBe( '' );
		} );

		it( 'should return text if document fragment with single text node is passed', () => {
			const fragment = new ViewDocumentFragment( viewDocument );
			fragment._appendChild( _parseView( 'foo bar' ) );

			expect( dataProcessor.toData( fragment ) ).toBe( 'foo bar' );
		} );

		it( 'should return multiple child nodes', () => {
			const fragment = _parseView( '<p>foo</p><p>bar</p>' );

			expect( dataProcessor.toData( fragment ) ).toBe( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should return full page HTML if document fragment had custom property', () => {
			const fragment = _parseView( '<p>foo</p><p>bar</p>' );

			fragment._setCustomProperty(
				'$fullPageDocument',
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);

			expect( dataProcessor.toData( fragment ) ).toBe(
				'<html>' +
					'<head><title>Testing full page</title></head>' +
					'<body style="background: red">' +
						'<p>foo</p><p>bar</p>' +
					'</body>' +
				'</html>'
			);
		} );

		it( 'should return full page HTML with doctype if document fragment had custom property', () => {
			const fragment = _parseView( '<p>foo</p><p>bar</p>' );

			fragment._setCustomProperty(
				'$fullPageDocument',
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			fragment._setCustomProperty(
				'$fullPageDocType',
				'<!DOCTYPE html>'
			);

			expect( dataProcessor.toData( fragment ) ).toBe(
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
			const fragment = _parseView( '<p>foo</p><p>bar</p>' );

			fragment._setCustomProperty(
				'$fullPageDocument',
				'<html><head><title>Testing full page</title></head><body style="background: red"></body></html>'
			);
			fragment._setCustomProperty(
				'$fullPageXmlDeclaration',
				'<?xml version="1.0" encoding="UTF-8"?>'
			);

			expect( dataProcessor.toData( fragment ) ).toBe(
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
			const fragment = _parseView( '<p>foo</p><p>bar</p>' );

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

			expect( dataProcessor.toData( fragment ) ).toBe(
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
