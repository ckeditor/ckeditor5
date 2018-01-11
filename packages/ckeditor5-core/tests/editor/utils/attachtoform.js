/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import attachToForm from '../../../src/editor/utils/attachtoform';
import ElementInterface from '../../../src/editor/utils/elementinterface';
import Editor from '../../../src/editor/editor';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/* global document, Event */

describe( 'attachToForm()', () => {
	let editor, form, textarea, submitStub;

	beforeEach( () => {
		form = document.createElement( 'form' );
		textarea = document.createElement( 'textarea' );
		form.appendChild( textarea );
		document.body.appendChild( form );
		submitStub = sinon.stub( form, 'submit' );

		// Prevents page realods in Firefox ;|
		form.addEventListener( 'submit', evt => {
			evt.preventDefault();
		} );

		class CustomEditor extends Editor {}
		mix( CustomEditor, ElementInterface );

		editor = new CustomEditor();
		editor.data.processor = new HtmlDataProcessor();
		editor.model.document.createRoot();
		editor.model.schema.extend( '$text', { allowIn: '$root' } );

		editor.data.set( 'foo bar' );
	} );

	afterEach( () => {
		submitStub.restore();
		form.remove();

		return editor.destroy();
	} );

	it( 'should throw an error when is used with editor without `ElementInterface`', () => {
		expect( () => {
			attachToForm( new Editor() );
		} ).to.throw( CKEditorError, /^attachtoform-missing-elementinterface/ );
	} );

	it( 'should update editor#element after the "submit" event', () => {
		editor.element = textarea;
		attachToForm( editor );

		expect( textarea.value ).to.equal( '' );

		form.dispatchEvent( new Event( 'submit', {
			// We need to be able to do preventDefault() to prevent page reloads in Firefox.
			cancelable: true
		} ) );

		expect( textarea.value, 2 ).to.equal( 'foo bar' );
	} );

	it( 'should update editor#element after calling the submit() method', () => {
		editor.element = textarea;
		attachToForm( editor );

		expect( textarea.value ).to.equal( '' );

		// Submit method is replaced by our implementation.
		expect( form.submit ).to.not.equal( submitStub );
		form.submit();

		expect( textarea.value ).to.equal( 'foo bar' );
		sinon.assert.calledOnce( submitStub );

		// Check if original function was called in correct context.
		sinon.assert.calledOn( submitStub, form );
	} );

	it( 'should not update editor#element if it is not a textarea in a form', () => {
		const element = document.createElement( 'div' );
		form.appendChild( element );

		editor.element = element;
		attachToForm( editor );

		expect( textarea.value ).to.equal( '' );

		// Submit method is not replaced by our implementation.
		expect( form.submit ).to.equal( submitStub );
		form.submit();

		expect( textarea.value ).to.equal( '' );
	} );

	it( 'should not update editor#element not belonging to a form', () => {
		const standaloneTextarea = document.createElement( 'textarea' );
		document.body.appendChild( standaloneTextarea );

		editor.element = standaloneTextarea;
		attachToForm( editor );

		expect( standaloneTextarea.value ).to.equal( '' );

		// Submit method is not replaced by our implementation.
		expect( form.submit ).to.equal( submitStub );
		form.submit();

		expect( standaloneTextarea.value ).to.equal( '' );

		standaloneTextarea.remove();
	} );

	it( 'should not update editor#element after destruction of the editor - form.submit()', () => {
		editor.element = textarea;
		attachToForm( editor );

		expect( textarea.value ).to.equal( '' );

		return editor.destroy().then( () => {
			// Submit method is no longer replaced by our implementation.
			expect( form.submit ).to.equal( submitStub );
			form.submit();

			expect( textarea.value ).to.equal( '' );
		} );
	} );

	it( 'should not update the editor#element after destruction of the editor - "submit" event', () => {
		editor.element = textarea;
		attachToForm( editor );

		expect( textarea.value ).to.equal( '' );

		return editor.destroy().then( () => {
			form.dispatchEvent( new Event( 'submit', {
				// We need to be able to do preventDefault() to prevent page reloads in Firefox.
				cancelable: true
			} ) );

			expect( textarea.value ).to.equal( '' );
		} );
	} );

	it( 'should not replace submit() method when one of the elements in a form is named "submit"', () => {
		// Restore stub since we want to mask submit function with input with name="submit".
		submitStub.restore();

		const input = document.createElement( 'input' );
		input.setAttribute( 'name', 'submit' );
		form.appendChild( input );

		editor.element = textarea;
		attachToForm( editor );

		expect( form.submit ).to.equal( input );
		expect( textarea.value ).to.equal( '' );

		form.dispatchEvent( new Event( 'submit', {
			// We need to be able to do preventDefault() to prevent page reloads in Firefox.
			cancelable: true
		} ) );

		expect( textarea.value ).to.equal( 'foo bar' );

		return editor.destroy().then( () => {
			expect( form.submit ).to.equal( input );
			input.remove();
		} );
	} );
} );
