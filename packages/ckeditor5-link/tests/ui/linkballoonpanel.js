/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, link */

import LinkBalloonPanel from '/ckeditor5/link/ui/linkballoonpanel.js';
import LinkBalloonPanelView from '/ckeditor5/link/ui/linkballoonpanelview.js';
import BalloonPanel from '/ckeditor5/ui/balloonpanel/balloonpanel.js';
import Model from '/ckeditor5/ui/model.js';

import Form from '/ckeditor5/ui/form/form.js';
import LabeledInput from '/ckeditor5/ui/labeledinput/labeledinput.js';
import Button from '/ckeditor5/ui/button/button.js';

import LocaleMock from '/tests/utils/_utils/locale-mock.js';

describe( 'LinkBalloonPanel', () => {
	let model, linkBalloonPanel, view;

	beforeEach( () => {
		model = new Model( {
			maxWidth: 200,
			url: 'http://ckeditor.com'
		} );

		view = new LinkBalloonPanelView( new LocaleMock() );
		linkBalloonPanel = new LinkBalloonPanel( model, view );
	} );

	describe( 'constructor', () => {
		it( 'should extends BalloonPanel class', () => {
			expect( linkBalloonPanel ).to.be.instanceOf( BalloonPanel );
		} );

		describe( 'child components', () => {
			describe( 'form', () => {
				it( 'should creates Form instance', () => {
					expect( linkBalloonPanel.form ).to.instanceof( Form );
				} );

				it( 'should appends to "content" collection', () => {
					expect( linkBalloonPanel.collections.get( 'content' ).get( 0 ) ).to.deep.equal( linkBalloonPanel.form );
				} );

				it( 'should delegates form.model#execute to the model', () => {
					const executeSpy = sinon.spy();

					model.on( 'execute', executeSpy );

					linkBalloonPanel.form.model.fire( 'execute' );

					expect( executeSpy.calledOnce ).to.true;
				} );
			} );

			describe( 'urlInput', () => {
				it( 'should creates LabeledInput instance', () => {
					expect( linkBalloonPanel.urlInput ).to.instanceof( LabeledInput );
				} );

				it( 'should appends to Form "content" collection', () => {
					expect( linkBalloonPanel.form.collections.get( 'content' ).get( 0 ) ).to.deep.equal( linkBalloonPanel.urlInput );
				} );

				it( 'should binds model#url to urlInput.model#value', () => {
					expect( linkBalloonPanel.urlInput.model.value ).to.equal( model.url ).to.equal( 'http://ckeditor.com' );

					model.url = 'http://cksource.com';

					expect( linkBalloonPanel.urlInput.model.value ).to.equal( 'http://cksource.com' );
				} );
			} );

			describe( 'saveButton', () => {
				it( 'should creates Button instance', () => {
					expect( linkBalloonPanel.saveButton ).to.instanceof( Button );
				} );

				it( 'should trigger model#execute event after clicking', ( done ) => {
					const executeSpy = sinon.spy();

					model.on( 'execute', executeSpy );

					linkBalloonPanel.init().then( () => {
						linkBalloonPanel.saveButton.view.element.click();

						expect( executeSpy.calledOnce ).to.true;
						done();
					} );
				} );

				it( 'should be a submit', () => {
					expect( linkBalloonPanel.saveButton.model.type ).to.equal( 'submit' );
				} );
			} );

			describe( 'cancelButton', () => {
				it( 'should creates Button instance', () => {
					expect( linkBalloonPanel.cancelButton ).to.instanceof( Button );
				} );

				it( 'should hide LinkBalloonPanel on cancelButton.model#execute event', () => {
					const hideSpy = sinon.spy( linkBalloonPanel.view, 'hide' );

					linkBalloonPanel.cancelButton.model.fire( 'execute' );

					expect( hideSpy.calledOnce ).to.true;
				} );
			} );
		} );
	} );
} );
