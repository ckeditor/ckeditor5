/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import MentionEditing from '../src/mentionediting';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'MentionEditing', () => {
	testUtils.createSinonSandbox();

	it( 'should be named', () => {
		expect( MentionEditing.pluginName ).to.equal( 'MentionEditing' );
	} );

	describe( 'init()', () => {
		it( 'should be loaded', () => {
			return createTestEditor()
				.then( newEditor => {
					expect( newEditor.plugins.get( MentionEditing ) ).to.be.instanceOf( MentionEditing );
				} );
		} );

		it( 'should set proper schema rules', () => {
			return createTestEditor()
				.then( newEditor => {
					const model = newEditor.model;

					expect( model.schema.checkAttribute( [ '$root', '$text' ], 'mention' ) ).to.be.true;

					expect( model.schema.checkAttribute( [ '$block', '$text' ], 'mention' ) ).to.be.true;
					expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'mention' ) ).to.be.true;

					expect( model.schema.checkAttribute( [ '$block' ], 'mention' ) ).to.be.false;
				} );
		} );
	} );

	function createTestEditor( mentionConfig ) {
		return VirtualTestEditor
			.create( {
				plugins: [ MentionEditing ],
				mention: mentionConfig
			} );
	}
} );
