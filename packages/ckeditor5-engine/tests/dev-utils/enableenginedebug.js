/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { default as enableEngineDebug, disableEngineDebug } from '../../src/dev-utils/enableenginedebug';
import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ModelPosition from '../../src/model/position';
import ModelRange from '../../src/model/range';
import ModelText from '../../src/model/text';
import ModelTextProxy from '../../src/model/textproxy';
import ModelElement from '../../src/model/element';
import AttributeOperation from '../../src/model/operation/attributeoperation';
import DetachOperation from '../../src/model/operation/detachoperation';
import InsertOperation from '../../src/model/operation/insertoperation';
import MarkerOperation from '../../src/model/operation/markeroperation';
import MoveOperation from '../../src/model/operation/moveoperation';
import NoOperation from '../../src/model/operation/nooperation';
import RenameOperation from '../../src/model/operation/renameoperation';
import RootAttributeOperation from '../../src/model/operation/rootattributeoperation';
import MergeOperation from '../../src/model/operation/mergeoperation';
import SplitOperation from '../../src/model/operation/splitoperation';
import Model from '../../src/model/model';
import ModelDocumentFragment from '../../src/model/documentfragment';

import ViewDocument from '../../src/view/document';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewContainerElement from '../../src/view/containerelement';
import ViewText from '../../src/view/text';
import ViewTextProxy from '../../src/view/textproxy';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewElement from '../../src/view/element';

import createViewRoot from '../view/_utils/createroot';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'enableEngineDebug', () => {
	testUtils.createSinonSandbox();

	afterEach( () => {
		disableEngineDebug();
	} );

	it( 'should return plugin class', () => {
		const result = enableEngineDebug();

		expect( result.prototype ).to.be.instanceof( Plugin );
	} );

	it( 'should not throw when called multiple times', () => {
		enableEngineDebug();
		enableEngineDebug();
		const result = enableEngineDebug();

		expect( result.prototype ).to.be.instanceof( Plugin );
	} );
} );

describe( 'disableEngineDebug', () => {
	testUtils.createSinonSandbox();

	it( 'restores modified stubs', () => {
		expect( ModelPosition.prototype.log ).to.equal( undefined, 'Initial value (model/position)' );
		expect( ModelElement.prototype.printTree ).to.equal( undefined, 'Initial value (model/element)' );
		expect( ViewElement.prototype.printTree ).to.equal( undefined, 'Initial value (view/element)' );
		expect( Model.prototype.createReplayer ).to.equal( undefined, 'Initial value (model/document)' );
		expect( Editor.prototype.logDocuments ).to.equal( undefined, 'Initial value (core~editor/editor)' );

		enableEngineDebug();

		expect( ModelPosition.prototype.log ).to.be.a( 'function', 'After enabling engine debug (model/position)' );
		expect( ModelElement.prototype.printTree ).to.be.a( 'function', 'After enabling engine debug (model/element)' );
		expect( ViewElement.prototype.printTree ).to.be.a( 'function', 'After enabling engine debug (view/element)' );
		expect( Model.prototype.createReplayer ).to.be.a( 'function', 'After enabling engine debug (model/document)' );
		expect( Editor.prototype.logDocuments ).to.be.a( 'function', 'After enabling engine debug (core~editor/editor)' );

		disableEngineDebug();

		expect( ModelPosition.prototype.log ).to.equal( undefined, 'After disabling engine debug (model/position)' );
		expect( ModelElement.prototype.printTree ).to.equal( undefined, 'After disabling engine debug (model/element)' );
		expect( ViewElement.prototype.printTree ).to.equal( undefined, 'After disabling engine debug (view/element)' );
		expect( Model.prototype.createReplayer ).to.equal( undefined, 'After disabling engine debug (model/document)' );
		expect( Editor.prototype.logDocuments ).to.equal( undefined, 'After disabling engine debug (core~editor/editor)' );
	} );
} );

describe( 'debug tools', () => {
	let DebugPlugin, log, error;

	testUtils.createSinonSandbox();

	before( () => {
		log = sinon.spy();
		error = sinon.spy();
		DebugPlugin = enableEngineDebug( { log, error } );
	} );

	after( () => {
		disableEngineDebug();
	} );

	afterEach( () => {
		log.resetHistory();
	} );

	describe( 'should provide logging tools', () => {
		let model, modelDoc, modelRoot, modelElement, modelDocFrag;

		beforeEach( () => {
			model = new Model();
			modelDoc = model.document;
			modelRoot = modelDoc.createRoot();
			modelElement = new ModelElement( 'paragraph', null, new ModelText( 'foo' ) );
			modelDocFrag = new ModelDocumentFragment( [ new ModelText( 'bar' ) ] );
		} );

		it( 'for ModelText', () => {
			const foo = new ModelText( 'foo', { foo: 'bar' } );

			expect( foo.toString() ).to.equal( '#foo' );

			foo.log();
			expect( log.calledWithExactly( 'ModelText: #foo' ) ).to.be.true;

			foo.logExtended();
			expect( log.calledWithExactly( 'ModelText: #foo, attrs: {"foo":"bar"}' ) ).to.be.true;
		} );

		it( 'for ModelTextProxy', () => {
			const foo = new ModelText( 'foo', { foo: 'bar' } );
			const proxy = new ModelTextProxy( foo, 1, 1 );

			expect( proxy.toString() ).to.equal( '#o' );

			proxy.log();
			expect( log.calledWithExactly( 'ModelTextProxy: #o' ) ).to.be.true;

			proxy.logExtended();
			expect( log.calledWithExactly( 'ModelTextProxy: #o, attrs: {"foo":"bar"}' ) ).to.be.true;
		} );

		it( 'for ModelElement', () => {
			const paragraph = new ModelElement( 'paragraph', { foo: 'bar' }, new ModelText( 'foo' ) );

			expect( paragraph.toString() ).to.equal( '<paragraph>' );

			paragraph.log();
			expectLog( 'ModelElement: <paragraph>' );

			paragraph.logExtended();
			expectLog( 'ModelElement: <paragraph>, 1 children, attrs: {"foo":"bar"}' );

			sinon.spy( paragraph, 'logExtended' );
			paragraph.logAll();
			expect( paragraph.logExtended.called ).to.be.true;
			expectLog( 'ModelText: #foo' );
		} );

		it( 'for ModelRootElement', () => {
			modelRoot.log();
			expectLog( 'ModelRootElement: main' );
		} );

		it( 'for ModelDocumentFragment', () => {
			modelDocFrag.log();
			expectLog( 'ModelDocumentFragment: documentFragment' );
		} );

		it( 'for ModelPosition', () => {
			const posInRoot = new ModelPosition( modelRoot, [ 0, 1, 0 ] );
			const posInElement = new ModelPosition( modelElement, [ 0 ] );
			const posInDocFrag = new ModelPosition( modelDocFrag, [ 2, 3 ] );

			expect( posInRoot.toString() ).to.equal( 'main [ 0, 1, 0 ]' );
			expect( posInElement.toString() ).to.equal( '<paragraph> [ 0 ]' );
			expect( posInDocFrag.toString() ).to.equal( 'documentFragment [ 2, 3 ]' );

			posInRoot.log();
			expectLog( 'ModelPosition: main [ 0, 1, 0 ]' );
		} );

		it( 'for ModelRange', () => {
			const rangeInRoot = ModelRange._createIn( modelRoot );
			const rangeInElement = ModelRange._createIn( modelElement );
			const rangeInDocFrag = ModelRange._createIn( modelDocFrag );

			expect( rangeInRoot.toString() ).to.equal( 'main [ 0 ] - [ 0 ]' );
			expect( rangeInElement.toString() ).to.equal( '<paragraph> [ 0 ] - [ 3 ]' );
			expect( rangeInDocFrag.toString() ).to.equal( 'documentFragment [ 0 ] - [ 3 ]' );

			rangeInRoot.log();
			expectLog( 'ModelRange: main [ 0 ] - [ 0 ]' );
		} );

		it( 'for ViewText', () => {
			const foo = new ViewText( 'foo' );

			expect( foo.toString() ).to.equal( '#foo' );

			foo.log();
			expect( log.calledWithExactly( 'ViewText: #foo' ) ).to.be.true;

			foo.logExtended();
			expect( log.calledWithExactly( 'ViewText: #foo' ) ).to.be.true;
		} );

		it( 'for ViewTextProxy', () => {
			const foo = new ViewText( 'foo', { foo: 'bar' } );
			const proxy = new ViewTextProxy( foo, 1, 1 );

			expect( proxy.toString() ).to.equal( '#o' );

			proxy.log();
			expect( log.calledWithExactly( 'ViewTextProxy: #o' ) ).to.be.true;

			proxy.logExtended();
			expect( log.calledWithExactly( 'ViewTextProxy: #o' ) ).to.be.true;
		} );

		describe( 'for operations', () => {
			beforeEach( () => {
				modelRoot._appendChild( [ new ModelText( 'foobar' ) ] );
			} );

			it( 'AttributeOperation', () => {
				const op = new AttributeOperation( ModelRange._createIn( modelRoot ), 'key', null, { foo: 'bar' }, 0 );

				expect( op.toString() ).to.equal( 'AttributeOperation( 0 ): "key": null -> {"foo":"bar"}, main [ 0 ] - [ 6 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'DetachOperation (text node)', () => {
				const op = new DetachOperation( ModelPosition._createAt( modelRoot, 0 ), 3 );

				expect( op.toString() ).to.equal( 'DetachOperation( null ): #foo -> main [ 0 ] - [ 3 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'DetachOperation (element)', () => {
				const element = new ModelElement( 'element' );
				modelRoot._insertChild( 0, element );

				const op = new DetachOperation( ModelPosition._createBefore( element ), 1 );

				expect( op.toString() ).to.equal( 'DetachOperation( null ): <element> -> main [ 0 ] - [ 1 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'DetachOperation (multiple nodes)', () => {
				const element = new ModelElement( 'element' );
				modelRoot._insertChild( 0, element );

				const op = new DetachOperation( ModelPosition._createBefore( element ), 2 );

				expect( op.toString() ).to.equal( 'DetachOperation( null ): [ 2 ] -> main [ 0 ] - [ 2 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'InsertOperation (text node)', () => {
				const op = new InsertOperation( ModelPosition._createAt( modelRoot, 3 ), [ new ModelText( 'abc' ) ], 0 );

				expect( op.toString() ).to.equal( 'InsertOperation( 0 ): #abc -> main [ 3 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'InsertOperation (element)', () => {
				const op = new InsertOperation( ModelPosition._createAt( modelRoot, 3 ), [ new ModelElement( 'paragraph' ) ], 0 );

				expect( op.toString() ).to.equal( 'InsertOperation( 0 ): <paragraph> -> main [ 3 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'InsertOperation (multiple nodes)', () => {
				const nodes = [ new ModelText( 'x' ), new ModelElement( 'y' ), new ModelText( 'z' ) ];
				const op = new InsertOperation( ModelPosition._createAt( modelRoot, 3 ), nodes, 0 );

				expect( op.toString() ).to.equal( 'InsertOperation( 0 ): [ 3 ] -> main [ 3 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'MarkerOperation', () => {
				const op = new MarkerOperation( 'marker', null, ModelRange._createIn( modelRoot ), modelDoc.markers, false, 0 );

				expect( op.toString() ).to.equal( 'MarkerOperation( 0 ): "marker": null -> main [ 0 ] - [ 6 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'MoveOperation', () => {
				const op = new MoveOperation( ModelPosition._createAt( modelRoot, 1 ), 2, ModelPosition._createAt( modelRoot, 6 ), 0 );

				expect( op.toString() ).to.equal( 'MoveOperation( 0 ): main [ 1 ] - [ 3 ] -> main [ 6 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'NoOperation', () => {
				const op = new NoOperation( 0 );

				expect( op.toString() ).to.equal( 'NoOperation( 0 )' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'RenameOperation', () => {
				const op = new RenameOperation( ModelPosition._createAt( modelRoot, 1 ), 'old', 'new', 0 );

				expect( op.toString() ).to.equal( 'RenameOperation( 0 ): main [ 1 ]: "old" -> "new"' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'RootAttributeOperation', () => {
				const op = new RootAttributeOperation( modelRoot, 'key', 'old', null, 0 );

				expect( op.toString() ).to.equal( 'RootAttributeOperation( 0 ): "key": "old" -> null, main' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'MergeOperation', () => {
				const op = new MergeOperation(
					new ModelPosition( modelRoot, [ 1, 0 ] ),
					2,
					new ModelPosition( modelRoot, [ 0, 2 ] ),
					new ModelPosition( modelDoc.graveyard, [ 0 ] ),
					0
				);

				expect( op.toString() ).to.equal(
					'MergeOperation( 0 ): main [ 1, 0 ] -> main [ 0, 2 ] ( 2 ), $graveyard [ 0 ]'
				);

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'SplitOperation without graveyard position', () => {
				const position = new ModelPosition( modelRoot, [ 1, 4 ] );
				const op = new SplitOperation( position, 6, null, 0 );

				expect( op.toString() ).to.equal(
					'SplitOperation( 0 ): main [ 1, 4 ] ( 6 ) -> main [ 2 ]'
				);

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'SplitOperation with graveyard position', () => {
				const position = new ModelPosition( modelRoot, [ 1, 4 ] );
				const op = new SplitOperation( position, 6, new ModelPosition( modelDoc.graveyard, [ 0 ] ), 0 );

				expect( op.toString() ).to.equal(
					'SplitOperation( 0 ): main [ 1, 4 ] ( 6 ) -> main [ 2 ] with $graveyard [ 0 ]'
				);

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );
		} );

		it( 'for applied operations', () => {
			const op = new InsertOperation( ModelPosition._createAt( modelRoot, 0 ), [ new ModelText( 'foo' ) ], 0 );

			model.applyOperation( op );

			expect( log.calledWithExactly( 'Applying InsertOperation( 0 ): #foo -> main [ 0 ]' ) ).to.be.true;
		} );
	} );

	describe( 'should provide tree printing tools', () => {
		it( 'for model', () => {
			const model = new Model();
			const modelDoc = model.document;
			const modelRoot = modelDoc.createRoot();

			modelRoot._appendChild( [
				new ModelElement( 'paragraph', { foo: 'bar' }, [
					new ModelText( 'This is ' ), new ModelText( 'bold', { bold: true } ), new ModelText( '.' )
				] ),
				new ModelElement( 'listItem', { listType: 'numbered', listIndent: 0 }, new ModelText( 'One.' ) ),
			] );

			const modelRootTree = modelRoot.printTree();

			expect( modelRootTree ).to.equal(
				'<main>' +
				'\n\t<paragraph foo="bar">' +
				'\n\t\tThis is ' +
				'\n\t\t<$text bold=true>bold</$text>' +
				'\n\t\t.' +
				'\n\t</paragraph>' +
				'\n\t<listItem listType="numbered" listIndent=0>' +
				'\n\t\tOne.' +
				'\n\t</listItem>' +
				'\n</main>'
			);

			modelRoot.logTree();
			expect( log.calledWithExactly( modelRootTree ) ).to.be.true;

			const modelParagraph = modelRoot.getChild( 0 );
			const modelParagraphTree = modelParagraph.printTree();
			expect( modelParagraphTree ).to.equal(
				'<paragraph foo="bar">' +
				'\n\tThis is ' +
				'\n\t<$text bold=true>bold</$text>' +
				'\n\t.' +
				'\n</paragraph>'
			);

			log.resetHistory();
			modelParagraph.logTree();
			expect( log.calledWithExactly( modelParagraphTree ) ).to.be.true;

			const modelDocFrag = new ModelDocumentFragment( [
				new ModelText( 'This is ' ), new ModelText( 'bold', { bold: true } ), new ModelText( '.' ),
				new ModelElement( 'paragraph', { foo: 'bar' }, [
					new ModelText( 'This is ' ), new ModelText( 'bold', { bold: true } ), new ModelText( '.' )
				] )
			] );

			const modelDocFragTree = modelDocFrag.printTree();
			expect( modelDocFragTree ).to.equal(
				'ModelDocumentFragment: [' +
				'\n\tThis is ' +
				'\n\t<$text bold=true>bold</$text>' +
				'\n\t.' +
				'\n\t<paragraph foo="bar">' +
				'\n\t\tThis is ' +
				'\n\t\t<$text bold=true>bold</$text>' +
				'\n\t\t.' +
				'\n\t</paragraph>' +
				'\n]'
			);

			log.resetHistory();
			modelDocFrag.logTree();
			expect( log.calledWithExactly( modelDocFragTree ) ).to.be.true;
		} );

		it( 'for view', () => {
			const viewDoc = new ViewDocument();
			const viewRoot = createViewRoot( viewDoc );

			viewRoot._appendChild( [
				new ViewContainerElement( 'p', { foo: 'bar' }, [
					new ViewText( 'This is ' ), new ViewAttributeElement( 'b', null, new ViewText( 'bold' ) ), new ViewText( '.' )
				] ),
				new ViewContainerElement( 'ol', null, [
					new ViewContainerElement( 'li', null, new ViewText( 'One.' ) )
				] )
			] );

			const viewRootTree = viewRoot.printTree();

			expect( viewRootTree ).to.equal(
				'<div>' +
				'\n\t<p foo="bar">' +
				'\n\t\tThis is ' +
				'\n\t\t<b>' +
				'\n\t\t\tbold' +
				'\n\t\t</b>' +
				'\n\t\t.' +
				'\n\t</p>' +
				'\n\t<ol>' +
				'\n\t\t<li>' +
				'\n\t\t\tOne.' +
				'\n\t\t</li>' +
				'\n\t</ol>' +
				'\n</div>'
			);

			viewRoot.logTree();
			expect( log.calledWithExactly( viewRootTree ) ).to.be.true;

			const viewParagraph = viewRoot.getChild( 0 );
			const viewParagraphTree = viewParagraph.printTree();
			expect( viewParagraphTree ).to.equal(
				'<p foo="bar">' +
				'\n\tThis is ' +
				'\n\t<b>' +
				'\n\t\tbold' +
				'\n\t</b>' +
				'\n\t.' +
				'\n</p>'
			);

			log.resetHistory();
			viewParagraph.logTree();
			expect( log.calledWithExactly( viewParagraphTree ) ).to.be.true;

			const viewDocFrag = new ViewDocumentFragment( [
				new ViewText( 'Text.' ),
				new ViewContainerElement( 'p', { foo: 'bar' }, [
					new ViewText( 'This is ' ), new ViewAttributeElement( 'b', null, new ViewText( 'bold' ) ), new ViewText( '.' )
				] )
			] );

			const viewDocFragTree = viewDocFrag.printTree();
			expect( viewDocFragTree ).to.equal(
				'ViewDocumentFragment: [' +
				'\n\tText.' +
				'\n\t<p foo="bar">' +
				'\n\t\tThis is ' +
				'\n\t\t<b>' +
				'\n\t\t\tbold' +
				'\n\t\t</b>' +
				'\n\t\t.' +
				'\n\t</p>' +
				'\n]'
			);

			log.resetHistory();
			viewDocFrag.logTree();
			expect( log.calledWithExactly( viewDocFragTree ) ).to.be.true;
		} );
	} );

	describe( 'should store model and view trees state', () => {
		let editor;

		beforeEach( () => {
			return VirtualTestEditor.create( {
				plugins: [ DebugPlugin ]
			} ).then( _editor => {
				editor = _editor;
			} );
		} );

		it( 'should store model and view state after each applied operation', () => {
			const model = editor.model;
			const modelDoc = model.document;
			const modelRoot = modelDoc.getRoot();
			const view = editor.editing.view;
			const viewDoc = view.document;

			// Reset model document version to ensure it will start at 0.
			model.document.version = 0;

			model.change( () => {
				const insert = new InsertOperation( ModelPosition._createAt( modelRoot, 0 ), new ModelText( 'foobar' ), 0 );
				model.applyOperation( insert );

				const graveyard = modelDoc.graveyard;
				const move = new MoveOperation( ModelPosition._createAt( modelRoot, 1 ), 2, ModelPosition._createAt( graveyard, 0 ), 1 );
				model.applyOperation( move );
			} );

			log.resetHistory();

			modelDoc.log( 0 );
			expectLog(
				'<$graveyard></$graveyard>' +
				'\n<main></main>'
			);

			modelDoc.log( 1 );
			expectLog(
				'<$graveyard></$graveyard>' +
				'\n<main>' +
				'\n\tfoobar' +
				'\n</main>'
			);

			modelDoc.log( 2 );
			expectLog(
				'<$graveyard>' +
				'\n\too' +
				'\n</$graveyard>' +
				'\n<main>' +
				'\n\tfbar' +
				'\n</main>'
			);

			modelDoc.log();
			expectLog(
				'<$graveyard>' +
				'\n\too' +
				'\n</$graveyard>' +
				'\n<main>' +
				'\n\tfbar' +
				'\n</main>'
			);

			viewDoc.log( 0 );
			expectLog(
				'<$root></$root>'
			);

			viewDoc.log( 2 );
			expectLog(
				'<$root>' +
				'\n\tfbar' +
				'\n</$root>'
			);

			sinon.spy( modelDoc, 'log' );
			sinon.spy( viewDoc, 'log' );

			editor.logModel( 1 );
			expect( modelDoc.log.calledWithExactly( 1 ), 1 ).to.be.true;

			editor.logView( 2 );
			expect( viewDoc.log.calledWithExactly( 2 ), 2 ).to.be.true;

			modelDoc.log.resetHistory();
			viewDoc.log.resetHistory();

			editor.logModel();
			expect( modelDoc.log.calledWithExactly( 2 ), 3 ).to.be.true;

			modelDoc.log.resetHistory();
			viewDoc.log.resetHistory();

			editor.logDocuments();
			expect( modelDoc.log.calledWithExactly( 2 ), 4 ).to.be.true;
			expect( viewDoc.log.calledWithExactly( 2 ), 5 ).to.be.true;

			modelDoc.log.resetHistory();
			viewDoc.log.resetHistory();

			editor.logDocuments( 1 );
			expect( modelDoc.log.calledWithExactly( 1 ), 6 ).to.be.true;
			expect( viewDoc.log.calledWithExactly( 1 ), 7 ).to.be.true;
		} );

		it( 'should remove old states', () => {
			const model = editor.model;
			const modelDoc = model.document;
			const modelRoot = model.document.getRoot();

			for ( let i = 0; i < 25; i++ ) {
				const insert = new InsertOperation( ModelPosition._createAt( modelRoot, 0 ), new ModelText( 'foobar' ), modelDoc.version );
				model.applyOperation( insert );
			}

			modelDoc.log( 0 );
			expectLog( 'Tree log unavailable for given version: 0' );
		} );
	} );

	describe( 'should provide methods for operation replayer', () => {
		it( 'getAppliedOperations()', () => {
			const model = new Model();
			const modelDoc = model.document;

			expect( model.getAppliedOperations() ).to.equal( '' );

			const otherRoot = modelDoc.createRoot( '$root', 'otherRoot' );
			const element = new ModelElement( 'paragraph' );

			otherRoot._appendChild( element );

			const insert = new InsertOperation( ModelPosition._createAt( element, 0 ), new ModelText( 'foo' ), 0 );
			model.applyOperation( insert );

			const stringifiedOperations = model.getAppliedOperations();

			expect( stringifiedOperations ).to.equal( JSON.stringify( insert ) );
		} );

		it( 'createReplayer()', () => {
			const model = new Model();
			const modelDoc = model.document;

			const otherRoot = modelDoc.createRoot( '$root', 'otherRoot' );
			const element = new ModelElement( 'paragraph' );

			otherRoot._appendChild( element );

			const insert = new InsertOperation( ModelPosition._createAt( element, 0 ), new ModelText( 'foo' ), 0 );
			model.applyOperation( insert );

			const stringifiedOperations = model.getAppliedOperations();
			const operationReplayer = model.createReplayer( stringifiedOperations );

			expect( operationReplayer.getOperationsToReplay() ).to.deep.equal( [ JSON.parse( stringifiedOperations ) ] );
		} );
	} );

	function expectLog( expectedLogMsg ) {
		expect( log.calledWithExactly( expectedLogMsg ) ).to.be.true;
		log.resetHistory();
	}
} );
