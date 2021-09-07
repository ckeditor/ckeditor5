/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import FindAndReplace from '../src/findandreplace';
import FindAndReplaceState from '../src/findandreplacestate';

describe( 'FindAndReplaceState', () => {
	const FOO_BAR_PARAGRAPH = '<p>Foo bar baz</p>';

	let editor, model, root, state;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await DecoupledEditor.create( '', {
			plugins: [ Essentials, Paragraph, BoldEditing, FindAndReplace ]
		} );

		model = editor.model;
		root = model.document.getRoot();
		state = new FindAndReplaceState();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'State initiall value', () => {
		it( 'should create results collection', () => {
			expect( state.results ).to.be.instanceOf( Collection );
			expect( state.results ).to.be.length( 0 );
		} );

		it( 'highlightedResult should be null', () => {
			expect( state.highlightedResult ).to.be.null;
		} );

		it( 'searchText should be an empty string', () => {
			expect( state.searchText ).to.be.equal( '' );
		} );

		it( 'replaceText should be an empty string', () => {
			expect( state.replaceText ).to.be.equal( '' );
		} );

		it( 'matchCase should be false', () => {
			expect( state.matchCase ).to.be.false;
		} );

		it( 'matchWholeWords should be false', () => {
			expect( state.matchWholeWords ).to.be.false;
		} );
	} );

	describe( 'highlighted result handling', () => {
		it( 'adds a highlight marker', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			const marker = addMarker( 'findResult:test-uid', paragraph, 4, 7 );

			const matchInfo = addSearchResultToState( marker );

			editor.plugins.get( 'FindAndReplaceEditing' ).state.highlightedResult = matchInfo;

			expect( editor.model.markers.has( 'findResultHighlighted:test-uid' ) ).to.be.true;
		} );

		it( 'removes the previous highlight marker', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			const marker = addMarker( 'findResult:test-uid', paragraph, 4, 7 );
			const highlightedMatch = addSearchResultToState( marker );
			editor.plugins.get( 'FindAndReplaceEditing' ).state.highlightedResult = highlightedMatch;

			editor.plugins.get( 'FindAndReplaceEditing' ).state.highlightedResult = null;

			expect( editor.model.markers.has( 'findResultHighlighted:test-uid' ) ).to.be.false;
		} );

		it( 'moves the highlight marker', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			const firstMarker = addMarker( 'findResult:test1', paragraph, 1, 3 );
			const secondMarker = addMarker( 'findResult:test2', paragraph, 4, 6 );
			const firstMatch = addSearchResultToState( firstMarker );
			const secondMatch = addSearchResultToState( secondMarker );

			editor.plugins.get( 'FindAndReplaceEditing' ).state.highlightedResult = firstMatch;
			editor.plugins.get( 'FindAndReplaceEditing' ).state.highlightedResult = secondMatch;

			expect( editor.model.markers.has( 'findResultHighlighted:test1' ) ).to.be.false;
			expect( editor.model.markers.has( 'findResultHighlighted:test2' ) ).to.be.true;
		} );
	} );

	describe( 'state', () => {
		it.skip( 'should automatically remove unused marker', () => {
			const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;

			editor.setData( '<p>foo foo foo</p>' );

			editor.execute( 'find', 'foo' );

			state.results.remove( 1 );

			const markers = Array.from( editor.model.markers ).filter( markers => markers.name.startsWith( 'findResult:' ) );

			expect( markers ).to.have.length( 2 );
		} );

		describe( 'changing highlighted result', () => {
			it( 'should automatically change highlighted result', () => {
				const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;

				editor.setData( '<p>foo foo foo</p>' );
				editor.execute( 'find', 'foo' );

				const expectedHighlightedResult = state.results.get( 1 );

				state.results.remove( 0 );

				expect( state.highlightedResult ).to.eql( expectedHighlightedResult );
			} );

			it( 'should automatically change last highlighted result', () => {
				const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;

				editor.setData( '<p>foo foo foo</p>' );
				editor.execute( 'find', 'foo' );
				editor.execute( 'findNext' );
				editor.execute( 'findNext' );

				const expectedHighlightedResult = state.results.get( 0 );

				state.results.remove( 2 );

				expect( state.highlightedResult ).to.eql( expectedHighlightedResult );
			} );

			it( 'should remove highlighted result if there is nothing more to highlight', () => {
				const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;

				editor.setData( '<p>foo </p>' );

				editor.execute( 'find', 'foo' );

				state.results.remove( 0 );

				expect( state.highlightedResult ).to.be.null;
			} );
		} );
	} );

	describe( 'clear()', () => {
		it( 'should remove searchText', () => {
			const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;

			editor.setData( '<p>foo foo foo</p>' );
			editor.execute( 'find', 'foo' );

			state.clear( model );

			expect( state.searchText ).to.be.equal( '' );
		} );

		it( 'should clear results', () => {
			const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;

			editor.setData( '<p>foo foo foo</p>' );
			editor.execute( 'find', 'foo' );

			state.clear( model );

			expect( state.results ).to.be.length( 0 );
		} );

		it( 'should remove findResult markers', () => {
			const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;

			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			const firstMarker = addMarker( 'findResult:test1', paragraph, 1, 3 );
			const secondMarker = addMarker( 'findResult:test2', paragraph, 4, 6 );

			addSearchResultToState( firstMarker );
			addSearchResultToState( secondMarker );

			state.clear( model );

			expect( editor.model.markers.has( 'findResult:test1' ) ).to.be.false;
			expect( editor.model.markers.has( 'findResult:test2' ) ).to.be.false;
		} );

		it( 'should remove findResultHighlighted marker', () => {
			const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;

			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			const marker = addMarker( 'findResult:test1', paragraph, 1, 3 );
			const match = addSearchResultToState( marker );

			state.highlightedResult = match;

			state.clear( model );

			expect( editor.model.markers.has( 'findResultHighlighted:test1' ) ).to.be.false;
		} );

		it( 'should not throw exception when there is no findResultHighlighted marker', () => {
			const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;

			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			const marker = addMarker( 'findResult:test1', paragraph, 1, 3 );
			const match = addSearchResultToState( marker );

			state.highlightedResult = match;
			removeMarker( 'findResultHighlighted:test1' );

			expect( () => state.clear( model ) ).to.not.throw();
		} );
	} );

	function addMarker( name, secondParagraph, start, end ) {
		let marker = null;

		model.change( writer => {
			marker = writer.addMarker( name, {
				usingOperation: false,
				affectsData: false,
				range: writer.createRange(
					writer.createPositionAt( secondParagraph, start ),
					writer.createPositionAt( secondParagraph, end )
				)
			} );
		} );

		return marker;
	}

	function removeMarker( name ) {
		model.change( writer => {
			if ( model.markers.has( name ) ) {
				writer.removeMarker( name );
			}
		} );
	}

	function addSearchResultToState( marker ) {
		const state = editor.plugins.get( 'FindAndReplaceEditing' ).state;
		const matchInfo = {
			id: marker.name.replace( /^findResult:/, '' ),
			label: 'label',
			marker
		};

		state.results.add( matchInfo );

		return matchInfo;
	}
} );
