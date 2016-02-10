/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: creator */

'use strict';

import testUtils from '/tests/_utils/utils.js';
import Creator from '/ckeditor5/core/creator.js';
import Editor from '/ckeditor5/core/editor.js';
import Plugin from '/ckeditor5/core/plugin.js';

testUtils.createSinonSandbox();

describe( 'Creator', () => {
	let creator, editor;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = new Editor( editorElement );
		creator = new Creator( editor );
	} );

	describe( 'create', () => {
		it( 'should init the UI', () => {
			const promise = new Promise( () => {} );

			editor.ui = {
				init: sinon.stub().returns( promise )
			};

			const ret = creator.create();

			expect( ret ).to.equal( promise );
			expect( editor.ui.init.called ).to.be.true;
		} );
	} );

	describe( 'destroy', () => {
		it( 'calls super.destroy', () => {
			const pluginSpy  = testUtils.sinon.spy( Plugin.prototype, 'destroy' );

			editor.ui = {
				destroy() {}
			};

			creator.destroy();

			expect( pluginSpy.called ).to.be.true;
		} );

		it( 'should destroy the UI', () => {
			const uiSpy = sinon.stub().returns( new Promise( () => {} ) );

			editor.ui = {
				destroy: uiSpy
			};

			creator.destroy();

			expect( uiSpy.called ).to.be.true;
			expect( editor.ui ).to.be.null;
		} );

		it( 'should wait until UI is destroyed', () => {
			let resolved = false;
			let resolve;
			const uiSpy = sinon.stub().returns(
				new Promise( ( r ) => {
					resolve = r;
				} )
			);

			editor.ui = {
				destroy: uiSpy
			};

			// Is there an easier method to verify whether the promise chain isn't broken? ;/
			setTimeout( () => {
				resolved = true;
				resolve( 'foo' );
			} );

			return creator.destroy()
				.then( () => {
					expect( resolved ).to.be.true;
				} );
		} );

		it( 'should restore the replaced element', () => {
			const spy = testUtils.sinon.stub( creator, '_restoreElement' );
			const element = document.createElement( 'div' );

			editor.ui = {
				destroy() {}
			};

			creator._replaceElement( element );
			creator.destroy();

			expect( spy.calledOnce ).to.be.true;
		} );
	} );

	describe( 'updateEditorElement', () => {
		it( 'should pass data to the element', () => {
			editor.editable = {
				getData() {
					return 'foo';
				}
			};

			creator.updateEditorElement();

			expect( editor.element.innerHTML ).to.equal( 'foo' );
		} );
	} );

	describe( 'loadDataFromEditorElement', () => {
		it( 'should pass data to the element', () => {
			editor.editable = {
				setData: sinon.spy()
			};

			editor.element.innerHTML = 'foo';
			creator.loadDataFromEditorElement();

			expect( editor.editable.setData.args[ 0 ][ 0 ] ).to.equal( 'foo' );
		} );
	} );

	describe( 'getDataFromElement', () => {
		[ 'textarea', 'template', 'div' ].forEach( ( elementName ) => {
			it( 'should return the content of a ' + elementName, function() {
				const data = Creator.getDataFromElement( document.getElementById( 'getData-' + elementName ) );
				expect( data ).to.equal( '<b>foo</b>' );
			} );
		} );
	} );

	describe( 'setDataInElement', () => {
		[ 'textarea', 'template', 'div' ].forEach( ( elementName ) => {
			it( 'should set the content of a ' + elementName, () => {
				const el = document.createElement( elementName );
				const expectedData = '<b>foo</b>';

				Creator.setDataInElement( el, expectedData );

				const actualData = Creator.getDataFromElement( el );
				expect( actualData ).to.equal( actualData );
			} );
		} );
	} );

	describe( '_replaceElement', () => {
		it( 'should use editor ui element when arg not provided', () => {
			editor.ui = {
				view: {
					element: document.createElement( 'div' )
				}
			};

			creator._replaceElement();

			expect( editor.element.nextSibling ).to.equal( editor.ui.view.element );
		} );
	} );

	describe( '_restoreElement', () => {
		it( 'should remove the replacement element', () => {
			const element = document.createElement( 'div' );

			creator._replaceElement( element );

			expect( editor.element.nextSibling ).to.equal( element );

			creator._restoreElement();

			expect( element.parentNode ).to.be.null;
		} );
	} );
} );
