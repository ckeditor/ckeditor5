
import FindAndReplaceEditing from '../src/findandreplaceediting';

import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import FindAndReplace from '../src/findandreplace';

import FindCommand from '../src/findcommand';
import ReplaceCommand from '../src/replacecommand';
import ReplaceAllCommand from '../src/replaceallcommand';

describe( 'FindAndReplaceEditing', () => {
	const FOO_BAR_PARAGRAPH = '<p>Foo bar baz</p>';
	const TWO_FOO_BAR_PARAGRAPHS = FOO_BAR_PARAGRAPH + FOO_BAR_PARAGRAPH;

	let editor, model, root;

	beforeEach( async () => {
		editor = await DecoupledEditor.create( '', {
			plugins: [ Essentials, Paragraph, BoldEditing, FindAndReplace ]
		} );

		model = editor.model;
		root = model.document.getRoot();
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should be named', () => {
		expect( FindAndReplaceEditing.pluginName ).to.equal( 'FindAndReplaceEditing' );
	} );

	describe( 'downcast conversion', () => {
		it( 'should add editing downcast conversion for find results markers', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			addMarker( 'findResult:test-uid', paragraph, 4, 7 );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo <span class="ck-find-result" data-find-result="test-uid">bar</span> baz</p>'
			);
		} );

		it( 'should add editing downcast conversion for find results highlight markers', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const paragraph = root.getChild( 0 );
			addMarker( 'findResultHighlighted:test-uid', paragraph, 4, 7 );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo <span class="ck-find-result_selected" data-find-result="test-uid">bar</span> baz</p>'
			);
		} );

		it( 'should keep rendered markers in editing view on adding new markers', () => {
			editor.setData( TWO_FOO_BAR_PARAGRAPHS );

			const secondParagraph = root.getChild( 1 );
			addMarker( 'findResult:test-uid-1', secondParagraph, 4, 7 );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo bar baz</p><p>Foo <span class="ck-find-result" data-find-result="test-uid-1">bar</span> baz</p>'
			);

			const firstParagraph = root.getChild( 0 );
			addMarker( 'findResult:test-uid-2', firstParagraph, 4, 7 );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo <span class="ck-find-result" data-find-result="test-uid-2">bar</span> baz</p>' +
          '<p>Foo <span class="ck-find-result" data-find-result="test-uid-1">bar</span> baz</p>'
			);
		} );

		it( 'should keep rendered markers in editing view on removing markers', () => {
			editor.setData( TWO_FOO_BAR_PARAGRAPHS );

			const firstParagraph = root.getChild( 0 );
			const secondParagraph = root.getChild( 1 );

			addMarker( 'findResult:test-uid-1', firstParagraph, 0, 3 );
			addMarker( 'findResult:test-uid-2', secondParagraph, 0, 3 );
			addMarker( 'findResult:test-uid-3', secondParagraph, 4, 7 );

			model.change( writer => {
				writer.removeMarker( 'findResult:test-uid-1' );
			} );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal(
				'<p>Foo bar baz</p>' +
          '<p>' +
          '<span class="ck-find-result" data-find-result="test-uid-2">Foo</span>' +
          ' <span class="ck-find-result" data-find-result="test-uid-3">bar</span>' +
          ' baz' +
          '</p>'
			);
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

	describe( 'commands', () => {
		it( 'should register find command', () => {
			expect( editor.commands.get( 'find' ) ).to.be.instanceOf( FindCommand );
		} );

		it( 'should register replace command', () => {
			expect( editor.commands.get( 'replace' ) ).to.be.instanceOf( ReplaceCommand );
		} );

		it( 'should register replace all command', () => {
			expect( editor.commands.get( 'replaceAll' ) ).to.be.instanceOf( ReplaceAllCommand );
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
} );
