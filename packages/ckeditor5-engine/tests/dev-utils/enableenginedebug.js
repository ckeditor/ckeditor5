/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import enableEngineDebug from '../../src/dev-utils/enableenginedebug';
import StandardEditor from '@ckeditor/ckeditor5-core/src/editor/standardeditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ModelPosition from '../../src/model/position';
import ModelRange from '../../src/model/range';
import ModelText from '../../src/model/text';
import ModelTextProxy from '../../src/model/textproxy';
import ModelElement from '../../src/model/element';
import AttributeOperation from '../../src/model/operation/attributeoperation';
import InsertOperation from '../../src/model/operation/insertoperation';
import MarkerOperation from '../../src/model/operation/markeroperation';
import MoveOperation from '../../src/model/operation/moveoperation';
import NoOperation from '../../src/model/operation/nooperation';
import RenameOperation from '../../src/model/operation/renameoperation';
import RootAttributeOperation from '../../src/model/operation/rootattributeoperation';
import RemoveOperation from '../../src/model/operation/removeoperation';
import Delta from '../../src/model/delta/delta';
import AttributeDelta from '../../src/model/delta/attributedelta';
import { RootAttributeDelta } from '../../src/model/delta/attributedelta';
import InsertDelta from '../../src/model/delta/insertdelta';
import MarkerDelta from '../../src/model/delta/markerdelta';
import MergeDelta from '../../src/model/delta/mergedelta';
import MoveDelta from '../../src/model/delta/movedelta';
import RenameDelta from '../../src/model/delta/renamedelta';
import SplitDelta from '../../src/model/delta/splitdelta';
import UnwrapDelta from '../../src/model/delta/unwrapdelta';
import WrapDelta from '../../src/model/delta/wrapdelta';
import ModelDocument from '../../src/model/document';
import ModelDocumentFragment from '../../src/model/documentfragment';

import ViewDocument from '../../src/view/document';
import ViewAttributeElement from '../../src/view/attributeelement';
import ViewContainerElement from '../../src/view/containerelement';
import ViewText from '../../src/view/text';
import ViewTextProxy from '../../src/view/textproxy';
import ViewDocumentFragment from '../../src/view/documentfragment';

/* global document */

describe( 'enableEngineDebug', () => {
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

describe( 'debug tools', () => {
	let DebugPlugin, log;

	class TestEditor extends StandardEditor {
		constructor( ...args ) {
			super( ...args );

			this.document.createRoot( 'main' );
			this.editing.createRoot( this.element, 'main' );
		}
	}

	before( () => {
		log = sinon.spy();
		DebugPlugin = enableEngineDebug( log );
	} );

	afterEach( () => {
		log.reset();
	} );

	describe( 'should provide logging tools', () => {
		let modelDoc, modelRoot, modelElement, modelDocFrag;

		beforeEach( () => {
			modelDoc = new ModelDocument();
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
			const rangeInRoot = ModelRange.createIn( modelRoot );
			const rangeInElement = ModelRange.createIn( modelElement );
			const rangeInDocFrag = ModelRange.createIn( modelDocFrag );

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
				modelRoot.appendChildren( [ new ModelText( 'foobar' ) ] );
			} );

			it( 'AttributeOperation', () => {
				const op = new AttributeOperation( ModelRange.createIn( modelRoot ), 'key', null, { foo: 'bar' }, 0 );

				expect( op.toString() ).to.equal( 'AttributeOperation: "key": null -> {"foo":"bar"}, main [ 0 ] - [ 6 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'InsertOperation', () => {
				const op = new InsertOperation( ModelPosition.createAt( modelRoot, 3 ), [ new ModelText( 'abc' ) ], 0 );

				expect( op.toString() ).to.equal( 'InsertOperation: [ 1 ] -> main [ 3 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'MarkerOperation', () => {
				const op = new MarkerOperation( 'marker', null, ModelRange.createIn( modelRoot ), modelDoc.markers, 0 );

				expect( op.toString() ).to.equal( 'MarkerOperation: "marker": null -> main [ 0 ] - [ 6 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'MoveOperation', () => {
				const op = new MoveOperation( ModelPosition.createAt( modelRoot, 1 ), 2, ModelPosition.createAt( modelRoot, 6 ), 0 );

				expect( op.toString() ).to.equal( 'MoveOperation: main [ 1 ] - [ 3 ] -> main [ 6 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'NoOperation', () => {
				const op = new NoOperation( 0 );

				expect( op.toString() ).to.equal( 'NoOperation' );

				op.log();
				expect( log.calledWithExactly( 'NoOperation' ) ).to.be.true;
			} );

			it( 'RenameOperation', () => {
				const op = new RenameOperation( ModelPosition.createAt( modelRoot, 1 ), 'old', 'new', 0 );

				expect( op.toString() ).to.equal( 'RenameOperation: main [ 1 ]: "old" -> "new"' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'RootAttributeOperation', () => {
				const op = new RootAttributeOperation( modelRoot, 'key', 'old', null, 0 );

				expect( op.toString() ).to.equal( 'RootAttributeOperation: "key": "old" -> null, main' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );
		} );

		describe( 'for deltas', () => {
			it( 'Delta', () => {
				const delta = new Delta();
				const op = { log: sinon.spy() };
				delta.addOperation( op );

				sinon.spy( delta, 'log' );
				delta.logAll();

				expect( op.log.called ).to.be.true;
				expect( delta.log.called ).to.be.true;
			} );

			it( 'AttributeDelta', () => {
				modelRoot.appendChildren( new ModelText( 'foobar' ) );

				const delta = new AttributeDelta();
				const op = new AttributeOperation( ModelRange.createIn( modelRoot ), 'key', null, { foo: 'bar' }, 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'AttributeDelta: "key": -> {"foo":"bar"}, main [ 0 ] - [ 6 ], 1 ops' );
				delta.log();

				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'InsertDelta', () => {
				const delta = new InsertDelta();
				const op = new InsertOperation( ModelPosition.createAt( modelRoot, 3 ), [ new ModelText( 'abc' ) ], 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'InsertDelta: [ 1 ] -> main [ 3 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'MarkerDelta', () => {
				modelRoot.appendChildren( new ModelText( 'foobar' ) );

				const delta = new MarkerDelta();
				const op = new MarkerOperation( 'marker', null, ModelRange.createIn( modelRoot ), modelDoc.markers, 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'MarkerDelta: "marker": null -> main [ 0 ] - [ 6 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'MergeDelta', () => {
				const otherRoot = modelDoc.createRoot( '$root', 'otherRoot' );
				const firstEle = new ModelElement( 'paragraph' );
				const removedEle = new ModelElement( 'paragraph', null, [ new ModelText( 'foo' ) ] );

				otherRoot.appendChildren( [ firstEle, removedEle ] );

				const delta = new MergeDelta();
				const move = new MoveOperation( ModelPosition.createAt( removedEle, 0 ), 3, ModelPosition.createAt( firstEle, 0 ), 0 );
				const remove = new RemoveOperation( ModelPosition.createBefore( removedEle ), 1, 1 );

				delta.addOperation( move );
				delta.addOperation( remove );

				expect( delta.toString() ).to.equal( 'MergeDelta: otherRoot [ 1 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'MoveDelta', () => {
				const delta = new MoveDelta();
				const move1 = new MoveOperation( ModelPosition.createAt( modelRoot, 0 ), 1, ModelPosition.createAt( modelRoot, 3 ), 0 );
				const move2 = new MoveOperation( ModelPosition.createAt( modelRoot, 1 ), 1, ModelPosition.createAt( modelRoot, 6 ), 0 );

				delta.addOperation( move1 );
				delta.addOperation( move2 );

				expect( delta.toString() ).to.equal( 'MoveDelta: main [ 0 ] - [ 1 ] -> main [ 3 ]; main [ 1 ] - [ 2 ] -> main [ 6 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'RenameDelta', () => {
				const delta = new RenameDelta();
				const op = new RenameOperation( ModelPosition.createAt( modelRoot, 1 ), 'old', 'new', 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'RenameDelta: main [ 1 ]: "old" -> "new"' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'RootAttributeDelta', () => {
				const delta = new RootAttributeDelta();
				const op = new RootAttributeOperation( modelRoot, 'key', 'old', null, 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'RootAttributeDelta: "key": "old" -> null, main' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'SplitDelta', () => {
				const otherRoot = modelDoc.createRoot( 'main', 'otherRoot' );
				const splitEle = new ModelElement( 'paragraph', null, [ new ModelText( 'foo' ) ] );

				otherRoot.appendChildren( [ splitEle ] );

				const delta = new SplitDelta();
				const insert = new InsertOperation( ModelPosition.createAt( otherRoot, 1 ), [ new ModelElement( 'paragraph' ) ], 0 );
				const move = new MoveOperation( ModelPosition.createAt( splitEle, 1 ), 2, new ModelPosition( otherRoot, [ 1, 0 ] ), 1 );

				delta.addOperation( insert );
				delta.addOperation( move );

				expect( delta.toString() ).to.equal( 'SplitDelta: otherRoot [ 0, 1 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'UnwrapDelta', () => {
				const otherRoot = modelDoc.createRoot( 'main', 'otherRoot' );
				const unwrapEle = new ModelElement( 'paragraph', null, [ new ModelText( 'foo' ) ] );

				otherRoot.appendChildren( [ unwrapEle ] );

				const delta = new UnwrapDelta();
				const move = new MoveOperation( ModelPosition.createAt( unwrapEle, 0 ), 3, ModelPosition.createAt( otherRoot, 0 ), 1 );
				const remove = new RemoveOperation( ModelPosition.createAt( otherRoot, 3 ), 1, 0 );

				delta.addOperation( move );
				delta.addOperation( remove );

				expect( delta.toString() ).to.equal( 'UnwrapDelta: otherRoot [ 0 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'WrapDelta', () => {
				const delta = new WrapDelta();

				const insert = new InsertOperation( ModelPosition.createAt( modelRoot, 6 ), new ModelElement( 'paragraph' ), 0 );
				const move = new MoveOperation( ModelPosition.createAt( modelRoot, 0 ), 6, new ModelPosition( modelRoot, [ 1, 0 ] ), 1 );

				delta.addOperation( insert );
				delta.addOperation( move );

				expect( delta.toString() ).to.equal( 'WrapDelta: main [ 0 ] - [ 6 ] -> <paragraph>' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );
		} );

		it( 'for applied operations', () => {
			const delta = new InsertDelta();
			const op = new InsertOperation( ModelPosition.createAt( modelRoot, 0 ), [ new ModelText( 'foo' ) ], 0 );
			delta.addOperation( op );

			modelDoc.applyOperation( op );

			expect( log.calledWithExactly( 'Applying InsertOperation: [ 1 ] -> main [ 0 ]' ) ).to.be.true;
		} );
	} );

	describe( 'should provide tree printing tools', () => {
		it( 'for model', () => {
			const modelDoc = new ModelDocument();
			const modelRoot = modelDoc.createRoot();

			modelRoot.appendChildren( [
				new ModelElement( 'paragraph', { foo: 'bar' }, [
					new ModelText( 'This is ' ), new ModelText( 'bold', { bold: true } ), new ModelText( '.' )
				] ),
				new ModelElement( 'listItem', { type: 'numbered', indent: 0 }, new ModelText( 'One.' ) ),
			] );

			const modelRootTree = modelRoot.printTree();

			expect( modelRootTree ).to.equal(
				'<main>' +
				'\n\t<paragraph foo="bar">' +
				'\n\t\tThis is ' +
				'\n\t\t<$text bold=true>bold</$text>' +
				'\n\t\t.' +
				'\n\t</paragraph>' +
				'\n\t<listItem type="numbered" indent=0>' +
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

			log.reset();
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

			log.reset();
			modelDocFrag.logTree();
			expect( log.calledWithExactly( modelDocFragTree ) ).to.be.true;
		} );

		it( 'for view', () => {
			const viewDoc = new ViewDocument();
			const viewRoot = viewDoc.createRoot( 'div' );

			viewRoot.appendChildren( [
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

			log.reset();
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

			log.reset();
			viewDocFrag.logTree();
			expect( log.calledWithExactly( viewDocFragTree ) ).to.be.true;
		} );
	} );

	describe( 'should store model and view trees state', () => {
		let editor;

		beforeEach( () => {
			const div = document.createElement( 'div' );

			return TestEditor.create( div, {
				plugins: [ DebugPlugin ]
			} ).then( ( _editor ) => {
				editor = _editor;
			} );
		} );

		it( 'should store model and view state after each applied operation', () => {
			const model = editor.document;
			const modelRoot = model.getRoot();
			const view = editor.editing.view;

			const insert = new InsertOperation( ModelPosition.createAt( modelRoot, 0 ), new ModelText( 'foobar' ), 0 );
			model.applyOperation( wrapInDelta( insert ) );

			const remove = new RemoveOperation( ModelPosition.createAt( modelRoot, 1 ), 2, 1 );
			model.applyOperation( wrapInDelta( remove ) );

			log.reset();

			model.log( 0 );
			expectLog(
				'<$graveyard></$graveyard>' +
				'\n<main></main>'
			);

			model.log( 1 );
			expectLog(
				'<$graveyard></$graveyard>' +
				'\n<main>' +
				'\n\tfoobar' +
				'\n</main>'
			);

			model.log( 2 );
			expectLog(
				'<$graveyard>' +
				'\n\t<$graveyardHolder>' +
				'\n\t\too' +
				'\n\t</$graveyardHolder>' +
				'\n</$graveyard>' +
				'\n<main>' +
				'\n\tfbar' +
				'\n</main>'
			);

			model.log();
			expectLog(
				'<$graveyard>' +
				'\n\t<$graveyardHolder>' +
				'\n\t\too' +
				'\n\t</$graveyardHolder>' +
				'\n</$graveyard>' +
				'\n<main>' +
				'\n\tfbar' +
				'\n</main>'
			);

			view.log( 0 );
			expectLog(
				'<div></div>'
			);

			view.log( 1 );
			expectLog(
				'<div>' +
				'\n\tfoobar' +
				'\n</div>'
			);

			view.log( 2 );
			expectLog(
				'<div>' +
				'\n\tfbar' +
				'\n</div>'
			);

			sinon.spy( model, 'log' );
			sinon.spy( view, 'log' );

			editor.logModel( 1 );
			expect( model.log.calledWithExactly( 1 ) ).to.be.true;

			editor.logView( 2 );
			expect( view.log.calledWithExactly( 2 ) ).to.be.true;

			model.log.reset();
			view.log.reset();

			editor.logModel();
			expect( model.log.calledWithExactly( 2 ) ).to.be.true;

			model.log.reset();
			view.log.reset();

			editor.logDocuments();
			expect( model.log.calledWithExactly( 2 ) ).to.be.true;
			expect( view.log.calledWithExactly( 2 ) ).to.be.true;

			model.log.reset();
			view.log.reset();

			editor.logDocuments( 1 );
			expect( model.log.calledWithExactly( 1 ) ).to.be.true;
			expect( view.log.calledWithExactly( 1 ) ).to.be.true;
		} );

		it( 'should remove old states', () => {
			const model = editor.document;
			const modelRoot = model.getRoot();

			for ( let i = 0; i < 25; i++ ) {
				const insert = new InsertOperation( ModelPosition.createAt( modelRoot, 0 ), new ModelText( 'foobar' ), model.version );
				model.applyOperation( wrapInDelta( insert ) );
			}

			model.log( 0 );
			expectLog( 'Tree log unavailable for given version: 0' );
		} );
	} );

	describe( 'should provide methods for delta replayer', () => {
		it( 'getAppliedDeltas()', () => {
			const modelDoc = new ModelDocument();

			const otherRoot = modelDoc.createRoot( '$root', 'otherRoot' );
			const firstEle = new ModelElement( 'paragraph' );
			const removedEle = new ModelElement( 'paragraph', null, [ new ModelText( 'foo' ) ] );

			otherRoot.appendChildren( [ firstEle, removedEle ] );

			const delta = new MergeDelta();
			const move = new MoveOperation( ModelPosition.createAt( removedEle, 0 ), 3, ModelPosition.createAt( firstEle, 0 ), 0 );
			const remove = new RemoveOperation( ModelPosition.createBefore( removedEle ), 1, 1 );

			delta.addOperation( move );
			delta.addOperation( remove );

			modelDoc.applyOperation( move );
			modelDoc.applyOperation( remove );

			const stringifiedDeltas = modelDoc.getAppliedDeltas();

			expect( stringifiedDeltas ).to.equal( JSON.stringify( delta.toJSON() ) );
		} );

		it( 'createReplayer()', () => {
			const modelDoc = new ModelDocument();

			const otherRoot = modelDoc.createRoot( '$root', 'otherRoot' );
			const firstEle = new ModelElement( 'paragraph' );
			const removedEle = new ModelElement( 'paragraph', null, [ new ModelText( 'foo' ) ] );

			otherRoot.appendChildren( [ firstEle, removedEle ] );

			const delta = new MergeDelta();
			const move = new MoveOperation( ModelPosition.createAt( removedEle, 0 ), 3, ModelPosition.createAt( firstEle, 0 ), 0 );
			const remove = new RemoveOperation( ModelPosition.createBefore( removedEle ), 1, 1 );

			delta.addOperation( move );
			delta.addOperation( remove );

			const stringifiedDeltas = JSON.stringify( delta.toJSON() );

			const deltaReplayer = modelDoc.createReplayer( stringifiedDeltas );

			expect( deltaReplayer.getDeltasToReplay() ).to.deep.equal( [ JSON.parse( stringifiedDeltas ) ] );
		} );
	} );

	function expectLog( expectedLogMsg ) {
		expect( log.calledWithExactly( expectedLogMsg ) ).to.be.true;
		log.reset();
	}
} );

function wrapInDelta( op ) {
	const delta = new Delta();
	delta.addOperation( op );

	return op;
}
