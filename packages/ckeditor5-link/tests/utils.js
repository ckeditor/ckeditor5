/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document.js';
import ViewDowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter.js';
import AttributeElement from '@ckeditor/ckeditor5-engine/src/view/attributeelement.js';
import ContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement.js';
import Text from '@ckeditor/ckeditor5-engine/src/view/text.js';
import Schema from '@ckeditor/ckeditor5-engine/src/model/schema.js';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import {
	createLinkElement,
	isLinkElement,
	ensureSafeUrl,
	normalizeDecorators,
	isLinkableElement,
	isEmail,
	addLinkProtocolIfApplicable,
	openLink,
	extractTextFromLinkRange
} from '../src/utils.js';

describe( 'utils', () => {
	describe( 'isLinkElement()', () => {
		it( 'should return true for elements created by createLinkElement', () => {
			const writer = new ViewDowncastWriter( new ViewDocument() );
			const element = createLinkElement( 'http://ckeditor.com', { writer } );

			expect( isLinkElement( element ) ).to.be.true;
		} );

		it( 'should return false for other AttributeElements', () => {
			expect( isLinkElement( new AttributeElement( 'a' ) ) ).to.be.false;
		} );

		it( 'should return false for ContainerElements', () => {
			expect( isLinkElement( new ContainerElement( 'p' ) ) ).to.be.false;
		} );

		it( 'should return false for text nodes', () => {
			expect( isLinkElement( new Text( 'foo' ) ) ).to.be.false;
		} );
	} );

	describe( 'createLinkElement()', () => {
		it( 'should create link AttributeElement', () => {
			const writer = new ViewDowncastWriter( new ViewDocument() );
			const element = createLinkElement( 'http://cksource.com', { writer } );

			expect( isLinkElement( element ) ).to.be.true;
			expect( element.priority ).to.equal( 5 );
			expect( element.getAttribute( 'href' ) ).to.equal( 'http://cksource.com' );
			expect( element.name ).to.equal( 'a' );
		} );
	} );

	describe( 'ensureSafeUrl()', () => {
		it( 'returns the same absolute http URL', () => {
			const url = 'http://xx.yy/zz#foo';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same absolute https URL', () => {
			const url = 'https://xx.yy/zz';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same absolute ftp URL', () => {
			const url = 'ftp://xx.yy/zz';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same absolute ftps URL', () => {
			const url = 'ftps://xx.yy/zz';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same absolute mailto URL', () => {
			const url = 'mailto://foo@bar.com';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same absolute tel URL (if allowed in config)', () => {
			const url = 'tel:+48123456789';
			const allowedCustomProtocols = [ 'tel' ];

			expect( ensureSafeUrl( url, allowedCustomProtocols ) ).to.equal( url );
		} );

		it( 'returns the same absolute sms URL (if allowed in config)', () => {
			const url = 'sms:+48987654321';
			const allowedCustomProtocols = [ 'sms' ];

			expect( ensureSafeUrl( url, allowedCustomProtocols ) ).to.equal( url );
		} );

		it( 'returns the same absolute sftp URL (if allowed in config)', () => {
			const url = 'sftp://xx.yy/zz';
			const allowedCustomProtocols = [ 'sftp' ];

			expect( ensureSafeUrl( url, allowedCustomProtocols ) ).to.equal( url );
		} );

		it( 'returns the same relative URL (starting with a dot)', () => {
			const url = './xx/yyy';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same relative URL (starting with two dots)', () => {
			const url = '../../xx/yyy';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same relative URL (starting with a slash)', () => {
			const url = '/xx/yyy';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same relative URL (starting with a backslash)', () => {
			const url = '\\xx\\yyy';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same relative URL (starting with a letter)', () => {
			const url = 'xx/yyy';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same relative URL (starting with hash)', () => {
			const url = '#thatsection1';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same URL even if it contains whitespaces', () => {
			const url = '  ./xx/ yyy\t';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same URL even if it contains non ASCII characters', () => {
			const url = 'https://kłącze.yy/źdźbło';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'returns the same URL even if it starts with an IP address', () => {
			const url = '192.178.10.123/subpath';

			expect( ensureSafeUrl( url ) ).to.equal( url );
		} );

		it( 'accepts non string values', () => {
			expect( ensureSafeUrl( undefined ) ).to.equal( 'undefined' );
			expect( ensureSafeUrl( null ) ).to.equal( 'null' );
		} );

		it( 'returns safe URL when a malicious URL starts with javascript:', () => {
			const url = 'javascript:alert(1)';

			expect( ensureSafeUrl( url ) ).to.equal( '#' );
		} );

		it( 'returns safe URL when a malicious URL starts with an unknown protocol', () => {
			const url = 'foo:alert(1)';

			expect( ensureSafeUrl( url ) ).to.equal( '#' );
		} );

		it( 'returns the same URL when the URL contains a custom protocol defined in the allowedProtocols parameter', () => {
			const url = 'foo:customurl.resource';
			const allowedCustomProtocols = [ 'https', 'http', 'foo' ];

			expect( ensureSafeUrl( url, allowedCustomProtocols ) ).to.equal( url );
		} );

		it( 'returns safe URL when a malicious URL contains spaces', () => {
			const url = 'java\u0000script:\talert(1)';

			expect( ensureSafeUrl( url ) ).to.equal( '#' );
		} );

		it( 'returns safe URL when a malicious URL contains spaces (2)', () => {
			const url = '\u0000 javascript:alert(1)';

			expect( ensureSafeUrl( url ) ).to.equal( '#' );
		} );

		it( 'returns safe URL when a malicious URL contains a safe part', () => {
			const url = 'javascript:alert(1)\nhttp://xxx';

			expect( ensureSafeUrl( url ) ).to.equal( '#' );
		} );

		it( 'returns safe URL when a malicious URL contains a safe part (2)', () => {
			const url = 'javascript:alert(1);http://xxx';

			expect( ensureSafeUrl( url ) ).to.equal( '#' );
		} );
	} );

	describe( 'normalizeDecorators()', () => {
		it( 'should transform an entry object to a normalized array', () => {
			const callback = () => {};
			const entryObject = {
				foo: {
					mode: 'manual',
					label: 'Foo',
					attributes: {
						foo: 'foo'
					}
				},
				bar: {
					mode: 'automatic',
					callback,
					attributes: {
						bar: 'bar'
					}
				},
				baz: {
					mode: 'manual',
					label: 'Baz label',
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				}
			};

			expect( normalizeDecorators( entryObject ) ).to.deep.equal( [
				{
					id: 'linkFoo',
					mode: 'manual',
					label: 'Foo',
					attributes: {
						foo: 'foo'
					}
				},
				{
					id: 'linkBar',
					mode: 'automatic',
					callback,
					attributes: {
						bar: 'bar'
					}
				},
				{
					id: 'linkBaz',
					mode: 'manual',
					label: 'Baz label',
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				}
			] );
		} );
	} );

	describe( 'isLinkableElement()', () => {
		it( 'returns false when passed "null" as element', () => {
			expect( isLinkableElement( null, new Schema() ) ).to.equal( false );
		} );

		it( 'returns false when passed an element that is not the image element', () => {
			const element = new ModelElement( 'paragraph' );
			expect( isLinkableElement( element, new Schema() ) ).to.equal( false );
		} );

		it( 'returns false when schema does not allow linking images (block image)', () => {
			const element = new ModelElement( 'imageBlock' );
			expect( isLinkableElement( element, new Schema() ) ).to.equal( false );
		} );

		it( 'returns false when schema does not allow linking images (inline image)', () => {
			const element = new ModelElement( 'imageInline' );
			expect( isLinkableElement( element, new Schema() ) ).to.equal( false );
		} );

		it( 'returns true when passed a block image element and it can be linked', () => {
			const element = new ModelElement( 'imageBlock' );
			const schema = new Schema();

			schema.register( 'imageBlock', {
				allowIn: '$root',
				allowAttributes: [ 'linkHref' ]
			} );

			expect( isLinkableElement( element, schema ) ).to.equal( true );
		} );

		it( 'returns true when passed an inline image element and it can be linked', () => {
			const element = new ModelElement( 'imageInline' );
			const schema = new Schema();

			schema.register( 'imageInline', {
				allowIn: '$root',
				allowAttributes: [ 'linkHref' ]
			} );

			expect( isLinkableElement( element, schema ) ).to.equal( true );
		} );
	} );

	describe( 'isEmail()', () => {
		it( 'should return true for email string', () => {
			expect( isEmail( 'newsletter@cksource.com' ) ).to.be.true;
		} );

		it( 'should return false for not email string', () => {
			expect( isEmail( 'test' ) ).to.be.false;
			expect( isEmail( 'test.test' ) ).to.be.false;
			expect( isEmail( 'test@test' ) ).to.be.false;
		} );
	} );

	describe( 'addLinkProtocolIfApplicable()', () => {
		it( 'should return link with email protocol for email string', () => {
			expect( addLinkProtocolIfApplicable( 'foo@bar.com' ) ).to.equal( 'mailto:foo@bar.com' );
			expect( addLinkProtocolIfApplicable( 'foo@bar.com', 'http://' ) ).to.equal( 'mailto:foo@bar.com' );
		} );

		it( 'should return link with http protocol for url string if defaultProtocol is provided', () => {
			expect( addLinkProtocolIfApplicable( 'www.ckeditor.com', 'http://' ) ).to.equal( 'http://www.ckeditor.com' );
		} );

		it( 'should return unmodified link if not applicable', () => {
			expect( addLinkProtocolIfApplicable( 'test' ) ).to.equal( 'test' );
			expect( addLinkProtocolIfApplicable( 'www.ckeditor.com' ) ).to.equal( 'www.ckeditor.com' );
			expect( addLinkProtocolIfApplicable( 'http://www.ckeditor.com' ) ).to.equal( 'http://www.ckeditor.com' );
			expect( addLinkProtocolIfApplicable( 'http://www.ckeditor.com', 'http://' ) ).to.equal( 'http://www.ckeditor.com' );
			expect( addLinkProtocolIfApplicable( 'mailto:foo@bar.com' ) ).to.equal( 'mailto:foo@bar.com' );
			expect( addLinkProtocolIfApplicable( 'mailto:foo@bar.com', 'http://' ) ).to.equal( 'mailto:foo@bar.com' );
		} );
	} );

	describe( 'openLink()', () => {
		let stub;

		beforeEach( () => {
			stub = sinon.stub( window, 'open' );

			stub.returns( undefined );
		} );

		afterEach( () => {
			stub.restore();
		} );

		it( 'should open a new browser tab', () => {
			const url = 'http://www.ckeditor.com';

			openLink( url );

			expect( stub.calledOnce ).to.be.true;
			expect( stub.calledOn( window ) ).to.be.true;
			expect( stub.calledWith( url, '_blank', 'noopener' ) ).to.be.true;
		} );
	} );

	describe( 'extractTextFromLinkRange()', () => {
		let editor;

		beforeEach( async () => {
			function InlineWidget( editor ) {
				editor.model.schema.register( 'inlineWidget', { inheritAllFrom: '$inlineObject' } );
				editor.conversion.elementToElement( {
					view: { name: 'span', class: 'foo' },
					model: 'inlineWidget'
				} );
			}

			editor = await ModelTestEditor.create( {
				plugins: [ Paragraph, InlineWidget, BoldEditing ]
			} );
		} );

		afterEach( async () => {
			await editor.destroy();
		} );

		it( 'should extract text from range', () => {
			setModelData( editor.model, '<paragraph>foo[bar]baz</paragraph>' );

			const text = extractTextFromLinkRange( editor.model.document.selection.getFirstRange() );

			expect( text ).to.equal( 'bar' );
		} );

		it( 'should extract text from range even when split into multiple text nodes with different style', () => {
			setModelData( editor.model,
				'<paragraph>' +
					'abc[fo' +
					'<$text bold="true">ob</$text>' +
					'ar]def' +
				'</paragraph>'
			);

			expect( editor.model.document.getRoot().getChild( 0 ).childCount ).to.equal( 3 );

			const text = extractTextFromLinkRange( editor.model.document.selection.getFirstRange() );

			expect( text ).to.equal( 'foobar' );
		} );

		it( 'should return undefined if range includes an inline object', () => {
			setModelData( editor.model, '<paragraph>foo[ba<inlineWidget></inlineWidget>r]baz</paragraph>' );

			const text = extractTextFromLinkRange( editor.model.document.selection.getFirstRange() );

			expect( text ).to.be.undefined;
		} );

		it( 'should return undefined if range is on an inline object', () => {
			setModelData( editor.model, '<paragraph>fooba[<inlineWidget></inlineWidget>]rbaz</paragraph>' );

			const text = extractTextFromLinkRange( editor.model.document.selection.getFirstRange() );

			expect( text ).to.be.undefined;
		} );

		it( 'should return undefined if range is spanning multiple blocks', () => {
			setModelData( editor.model, '<paragraph>f[oo</paragraph><paragraph>ba]z</paragraph>' );

			const text = extractTextFromLinkRange( editor.model.document.selection.getFirstRange() );

			expect( text ).to.be.undefined;
		} );
	} );
} );
