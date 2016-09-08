/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, balloonPanel */

import LinkBalloonPanel from '/ckeditor5/link/ui/linkballoonpanel.js';
import LinkBalloonPanelView from '/ckeditor5/link/ui/linkballoonpanelview.js';
import BalloonPanel from '/ckeditor5/ui/balloonpanel/balloonpanel.js';
import Model from '/ckeditor5/ui/model.js';

import LinkForm from '/ckeditor5/link/ui/linkform.js';
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
		it( 'should extend BalloonPanel class', () => {
			expect( linkBalloonPanel ).to.be.instanceOf( BalloonPanel );
		} );

		describe( 'child components', () => {
			describe( 'form', () => {
				it( 'should be created', () => {
					expect( linkBalloonPanel.form ).to.instanceof( LinkForm );
				} );

				it( 'should be appended to "content" collection', () => {
					expect( linkBalloonPanel.collections.get( 'content' ).get( 0 ) ).to.deep.equal( linkBalloonPanel.form );
				} );

				it( 'should delegate form.model#execute to the model', () => {
					const executeSpy = sinon.spy();

					model.on( 'execute', executeSpy );

					linkBalloonPanel.form.model.fire( 'execute' );

					expect( executeSpy.calledOnce ).to.true;
				} );
			} );

			describe( 'urlInput', () => {
				it( 'should be created', () => {
					expect( linkBalloonPanel.urlInput ).to.instanceof( LabeledInput );
				} );

				it( 'should be appended to the form "content" collection', () => {
					expect( linkBalloonPanel.form.collections.get( 'content' ).get( 0 ) ).to.deep.equal( linkBalloonPanel.urlInput );
				} );

				it( 'should bind model#url to urlInput.model#value', () => {
					expect( linkBalloonPanel.urlInput.model.value ).to.equal( model.url ).to.equal( 'http://ckeditor.com' );

					model.url = 'http://cksource.com';

					expect( linkBalloonPanel.urlInput.model.value ).to.equal( 'http://cksource.com' );
				} );
			} );

			describe( 'saveButton', () => {
				it( 'should be created', () => {
					expect( linkBalloonPanel.saveButton ).to.instanceof( Button );
				} );

				it( 'should be appended to the form "actions" collection', () => {
					expect( linkBalloonPanel.form.collections.get( 'actions' ).get( 0 ) ).to.deep.equal( linkBalloonPanel.saveButton );
				} );

				it( 'should fire model#execute event on DOM click event', ( done ) => {
					const executeSpy = sinon.spy();

					model.on( 'execute', executeSpy );

					linkBalloonPanel.init().then( () => {
						linkBalloonPanel.saveButton.view.element.click();

						expect( executeSpy.calledOnce ).to.true;
						done();
					} );
				} );

				it( 'should be a type `submit`', () => {
					expect( linkBalloonPanel.saveButton.model.type ).to.equal( 'submit' );
				} );
			} );

			describe( 'cancelButton', () => {
				it( 'should be created', () => {
					expect( linkBalloonPanel.cancelButton ).to.instanceof( Button );
				} );

				it( 'should be appended to the form "actions" collection', () => {
					expect( linkBalloonPanel.form.collections.get( 'actions' ).get( 1 ) ).to.deep.equal( linkBalloonPanel.cancelButton );
				} );

				it( 'should hide LinkBalloonPanel on cancelButton.model#execute event', () => {
					const hideSpy = sinon.spy( linkBalloonPanel.view, 'hide' );

					linkBalloonPanel.cancelButton.model.fire( 'execute' );

					expect( hideSpy.calledOnce ).to.true;
				} );
			} );

			describe( 'unlinkButton', () => {
				it( 'should be created', () => {
					expect( linkBalloonPanel.unlinkButton ).to.instanceof( Button );
				} );

				it( 'should be appended to the form "actions" collection', () => {
					expect( linkBalloonPanel.form.collections.get( 'actions' ).get( 2 ) ).to.deep.equal( linkBalloonPanel.unlinkButton );
				} );

				it( 'should fire model#execute-unlink event on unlinkButton.model#execute event', () => {
					const executeUnlinkSpy = sinon.spy();

					model.on( 'execute-unlink', executeUnlinkSpy );

					linkBalloonPanel.unlinkButton.model.fire( 'execute' );

					expect( executeUnlinkSpy.calledOnce ).to.true;
				} );
			} );
		} );
	} );
} );
