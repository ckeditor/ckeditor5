/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import InputObserver from '../../../src/view/observer/inputobserver';
import View from '../../../src/view/view';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'InputObserver', () => {
	const oldEnvIsAndroid = env.isAndroid;

	let view, viewDocument, observer;

	before( () => {
		env.isAndroid = true;
	} );

	beforeEach( () => {
		view = new View( new StylesProcessor() );
		viewDocument = view.document;
		observer = view.getObserver( InputObserver );
	} );

	afterEach( () => {
		view.destroy();
	} );

	after( () => {
		env.isAndroid = oldEnvIsAndroid;
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.contains( 'beforeinput' );
	} );

	it( 'should fire beforeinput with dom event data', () => {
		const spy = sinon.spy();

		viewDocument.on( 'beforeinput', spy );

		const domEvtData = {
			type: 'beforeinput'
		};

		observer.onDomEvent( domEvtData );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.args[ 0 ][ 1 ].domEvent ).to.equal( domEvtData );
	} );
} );
