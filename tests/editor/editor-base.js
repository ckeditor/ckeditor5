/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editor */

import Editor from '/ckeditor5/editor/editor.js';
import Command from '/ckeditor5/command/command.js';
import Locale from '/ckeditor5/utils/locale.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'Editor', () => {
	describe( 'locale', () => {
		it( 'is instantiated and t() is exposed', () => {
			const editor = new Editor();

			expect( editor.locale ).to.be.instanceof( Locale );
			expect( editor.t ).to.equal( editor.locale.t );
		} );

		it( 'is configured with the config.lang', () => {
			const editor = new Editor( { lang: 'pl' } );

			expect( editor.locale.lang ).to.equal( 'pl' );
		} );
	} );

	describe( 'destroy', () => {
		it( 'should fire "destroy"', () => {
			const editor = new Editor();
			let spy = sinon.spy();

			editor.on( 'destroy', spy );

			return editor.destroy().then( () => {
				expect( spy.calledOnce ).to.be.true;
			} );
		} );

		it( 'should destroy all components it initialized', () => {
			const editor = new Editor();

			const spy1 = sinon.spy( editor.data, 'destroy' );
			const spy2 = sinon.spy( editor.document, 'destroy' );

			return editor.destroy()
				.then( () => {
					expect( spy1.calledOnce ).to.be.true;
					expect( spy2.calledOnce ).to.be.true;
				} );
		} );
	} );

	describe( 'execute', () => {
		it( 'should execute specified command', () => {
			const editor = new Editor();

			let command = new Command( editor );
			sinon.spy( command, '_execute' );

			editor.commands.set( 'commandName', command );
			editor.execute( 'commandName' );

			expect( command._execute.calledOnce ).to.be.true;
		} );

		it( 'should throw an error if specified command has not been added', () => {
			const editor = new Editor();

			expect( () => {
				editor.execute( 'command' );
			} ).to.throw( CKEditorError, /^editor-command-not-found:/ );
		} );
	} );
} );
