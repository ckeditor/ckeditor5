/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Input from '../../../src/input';
import { fireBeforeInputDomEvent } from '../../_utils/utils';
import env from '@ckeditor/ckeditor5-utils/src/env';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'Input', () => {
	describe( 'Typing text using beforeinput event', () => {
		let domElement, editor, editableElement;

		testUtils.createSinonSandbox();

		beforeEach( async () => {
			// Force the browser to use the beforeinput event.
			testUtils.sinon.stub( env.features, 'isInputEventsLevel1Supported' ).get( () => true );

			domElement = document.createElement( 'div' );
			document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Input, Paragraph ],
				initialData: '<p>foo</p>'
			} );

			editableElement = editor.ui.getEditableElement();
		} );

		afterEach( async () => {
			await editor.destroy();

			domElement.remove();
		} );

		describe( 'injectBeforeInputTypingHandling()', () => {
			describe( 'beforeinput event types handling', () => {
				it( 'should handle the insertText input type and execute the input command', () => {
					const inputCommandSpy = testUtils.sinon.spy( editor.commands.get( 'input' ), 'execute' );

					const domRange1 = document.createRange();
					const domRange2 = document.createRange();
					domRange1.selectNodeContents( editableElement.firstChild );
					domRange2.setStart( editableElement.firstChild, 0 );
					domRange2.setEnd( editableElement.firstChild, 0 );

					const modelRange = editor.model.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );

					fireBeforeInputDomEvent( editableElement, {
						inputType: 'insertText',
						ranges: [ domRange1, domRange2 ],
						data: 'bar'
					} );

					sinon.assert.calledOnce( inputCommandSpy );

					const firstCallArgs = inputCommandSpy.firstCall.args[ 0 ];

					expect( firstCallArgs.text ).to.equal( 'bar' );
					expect( firstCallArgs.range.isEqual( modelRange ) ).to.be.true;
				} );

				it( 'should handle the insertReplacementText input type and execute the input command', () => {
					const inputCommandSpy = testUtils.sinon.spy( editor.commands.get( 'input' ), 'execute' );

					const domRange1 = document.createRange();
					const domRange2 = document.createRange();
					domRange1.selectNodeContents( editableElement.firstChild );
					domRange2.setStart( editableElement.firstChild, 0 );
					domRange2.setEnd( editableElement.firstChild, 0 );
					const modelRange = editor.model.createRangeIn( editor.model.document.getRoot().getChild( 0 ) );

					fireBeforeInputDomEvent( editableElement, {
						inputType: 'insertReplacementText',
						ranges: [ domRange1, domRange2 ],
						data: 'bar'
					} );

					sinon.assert.calledOnce( inputCommandSpy );

					const firstCallArgs = inputCommandSpy.firstCall.args[ 0 ];

					expect( firstCallArgs.text ).to.equal( 'bar' );
					expect( firstCallArgs.range.isEqual( modelRange ) ).to.be.true;
				} );
			} );

			it( 'should stop() the beforeinput event', () => {
				const domRange = document.createRange();
				domRange.selectNodeContents( editableElement.firstChild );

				let interceptedEventInfo;

				editor.editing.view.document.on( 'beforeinput', evt => {
					interceptedEventInfo = evt;
				}, { priority: Number.POSITIVE_INFINITY } );

				fireBeforeInputDomEvent( editableElement, {
					inputType: 'insertText',
					ranges: [ domRange ],
					data: 'bar'
				} );

				expect( interceptedEventInfo.stop.called ).to.be.true;
			} );

			it( 'should preventDefault() the DOM beforeinput event', () => {
				const domRange = document.createRange();
				domRange.selectNodeContents( editableElement.firstChild );

				let interceptedEventData;

				editor.editing.view.document.on( 'beforeinput', ( evt, data ) => {
					interceptedEventData = data;
					sinon.spy( interceptedEventData, 'preventDefault' );
				}, { priority: Number.POSITIVE_INFINITY } );

				fireBeforeInputDomEvent( editableElement, {
					inputType: 'insertText',
					ranges: [ domRange ],
					data: 'bar'
				} );

				sinon.assert.calledOnce( interceptedEventData.preventDefault );
			} );
		} );
	} );
} );
