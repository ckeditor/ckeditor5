/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import FindAndReplaceEditing from '../src/findandreplaceediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'FindPreviousCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ FindAndReplaceEditing, Paragraph ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'findPrevious' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled in empty document', () => {
			setData( model, '[]' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'is disabled when there are no results', () => {
			command._state.results.clear();

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'is disabled when there is just one result', () => {
			command._state.results.clear();
			command._state.results.add( {} );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'is enabled when there are more than one result', () => {
			command._state.results.clear();
			command._state.results.add( {} );
			command._state.results.add( {} );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be enabled in readonly mode editor', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );

			command._state.results.clear();
			command._state.results.add( {} );
			command._state.results.add( {} );

			editor.isReadOnly = true;

			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'state', () => {
		it( 'is set to plugin\'s state', () => {
			expect( command._state ).to.equal( editor.plugins.get( 'FindAndReplaceEditing' ).state );
		} );
	} );

	describe( 'execute()', () => {
		it( 'moves backward from the first match', () => {
			setData( model, '<paragraph>[]Foo bar baz. Bam bar bom.</paragraph>' );

			editor.execute( 'find', 'bar' );

			command.execute();

			const markers = Array.from( editor.model.markers )
				.filter( marker => marker.name.startsWith( 'findResultHighlighted:' ) )
				.map( marker => {
					marker.name = 'findResultHighlighted:foo';
					return marker;
				} );

			expect( stringify( model.document.getRoot(), null, markers ) ).to.equal(
				'<paragraph>' +
					'Foo bar baz. Bam ' +
					'<findResultHighlighted:foo:start></findResultHighlighted:foo:start>' +
						'bar' +
					'<findResultHighlighted:foo:end></findResultHighlighted:foo:end>' +
					' bom.' +
				'</paragraph>'
			);
		} );

		it( 'handles subsequent calls properly', () => {
			setData( model, '<paragraph>Foo bar baz. Bam[] bar bom.</paragraph>' );

			editor.execute( 'find', 'bar' );

			command.execute();
			command.execute();

			const markers = Array.from( editor.model.markers )
				.filter( marker => marker.name.startsWith( 'findResultHighlighted:' ) )
				.map( marker => {
					marker.name = 'findResultHighlighted:foo';
					return marker;
				} );

			expect( stringify( model.document.getRoot(), null, markers ) ).to.equal(
				'<paragraph>' +
					'Foo ' +
					'<findResultHighlighted:foo:start></findResultHighlighted:foo:start>' +
						'bar' +
					'<findResultHighlighted:foo:end></findResultHighlighted:foo:end>' +
					' baz. Bam bar bom.' +
				'</paragraph>'
			);
		} );
	} );
} );
