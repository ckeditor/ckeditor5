/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console */

import { global } from '@ckeditor/ckeditor5-utils';
import { Command } from 'ckeditor5/src/core';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Essentials } from '@ckeditor/ckeditor5-essentials';

import CKBoxImageEditCommand from '../../src/ckboximageedit/ckboximageeditcommand';

describe( 'CKBoxImageEditCommand', () => {
	let editor, domElement, command;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials
			]
		} );

		command = new CKBoxImageEditCommand( editor );
		command.isEnabled = true;
		editor.commands.add( 'ckboxImageEdit', command );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should be a command instance', () => {
			expect( command ).to.be.instanceOf( Command );
		} );

		it( 'should set "#value" property to false', () => {
			expect( command.value ).to.be.false;
		} );
	} );

	describe( '#execute()', () => {
		it( 'should invoke console.warn()', () => {
			const consoleWarnStub = testUtils.sinon.stub( console, 'warn' );

			editor.execute( 'ckboxImageEdit' );

			expect( consoleWarnStub.callCount ).to.equal( 1 );
		} );

		it( 'should set "#value" property to true', () => {
			editor.execute( 'ckboxImageEdit' );

			expect( command.value ).to.be.true;
		} );
	} );
} );
