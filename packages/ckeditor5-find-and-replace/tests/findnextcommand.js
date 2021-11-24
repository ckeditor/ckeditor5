/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData, stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import FindAndReplaceEditing from '../src/findandreplaceediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'FindNextCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ FindAndReplaceEditing, Paragraph ]
			} ).then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'findNext' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets public properties', () => {
			expect( command ).to.have.property( 'isEnabled', false );
			expect( command ).to.have.property( 'affectsData', false );
		} );

		it( 'sets state property', () => {
			expect( command ).to.have.property( '_state', editor.plugins.get( 'FindAndReplaceEditing' ).state );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be disabled in empty document', () => {
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

		it( 'should be enabled after disabling readonly mode', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );

			command._state.results.clear();
			command._state.results.add( {} );
			command._state.results.add( {} );

			editor.isReadOnly = true;
			editor.isReadOnly = false;

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be enabled if the next occurrence is not in the main root', async () => {
			const multiRootEditor = await initMultiRootEditor();

			multiRootEditor.execute( 'find', 'bar' );

			expect( multiRootEditor.commands.get( 'findNext' ).isEnabled ).to.be.true;

			await multiRootEditor.destroy();
		} );
	} );

	describe( 'execute()', () => {
		it( 'moves forward from the first match', () => {
			setData( model, '<paragraph>[]Foo bar baz. Bam bar bom. bar bar</paragraph>' );

			editor.execute( 'find', 'bar' );

			command.execute();

			const markers = getSimplifiedHighlightedMarkers( model.markers );

			expect( stringify( model.document.getRoot(), null, markers ) ).to.equal(
				'<paragraph>' +
					'Foo bar baz. Bam ' +
					'<highlightedResult:start></highlightedResult:start>' +
						'bar' +
					'<highlightedResult:end></highlightedResult:end>' +
					' bom. bar bar' +
				'</paragraph>'
			);
		} );

		it( 'handles subsequent calls properly', () => {
			setData( model, '<paragraph>Foo bar baz. Bam[] bar bom. bar bar</paragraph>' );

			editor.execute( 'find', 'bar' );

			command.execute();
			command.execute();

			const markers = getSimplifiedHighlightedMarkers( model.markers );

			expect( stringify( model.document.getRoot(), null, markers ) ).to.equal(
				'<paragraph>' +
					'Foo bar baz. Bam bar bom. ' +
					'<highlightedResult:start></highlightedResult:start>' +
						'bar' +
					'<highlightedResult:end></highlightedResult:end>' +
					' bar' +
				'</paragraph>'
			);
		} );

		it( 'should move to the next root', async () => {
			const multiRootEditor = await initMultiRootEditor();
			model = multiRootEditor.model;

			multiRootEditor.execute( 'find', 'bar' );
			multiRootEditor.execute( 'findNext' );

			const markers = getSimplifiedHighlightedMarkers( model.markers );

			expect( stringify( model.document.getRoot( 'second' ), null, markers ) ).to.equal(
				'<paragraph>' +
					'Foo ' +
					'<highlightedResult:start></highlightedResult:start>' +
						'bar' +
					'<highlightedResult:end></highlightedResult:end>' +
					' baz' +
				'</paragraph>'
			);

			await multiRootEditor.destroy();
		} );

		/**
		 * Returns the highlighted markers from the markers map. All markers have their name simplified to "highlightedResult"
		 * as otherwise they're random and unique.
		 */
		function getSimplifiedHighlightedMarkers( markers ) {
			return Array.from( markers )
				.filter( marker => marker.name.startsWith( 'findResultHighlighted:' ) )
				.map( marker => {
					// Replace markers id to a predefined value, as originally these are unique random ids.
					marker.name = 'highlightedResult';

					return marker;
				} );
		}
	} );

	class MultiRootEditor extends ModelTestEditor {
		constructor( config ) {
			super( config );

			this.model.document.createRoot( '$root', 'second' );
		}
	}

	async function initMultiRootEditor() {
		const multiRootEditor = await MultiRootEditor.create( { plugins: [ FindAndReplaceEditing, Paragraph ] } );

		setData( multiRootEditor.model, '<paragraph>Foo bar baz</paragraph>' );
		setData( multiRootEditor.model, '<paragraph>Foo bar baz</paragraph>', { rootName: 'second' } );

		return multiRootEditor;
	}
} );
