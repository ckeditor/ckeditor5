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
import DeltaFactory from '../../src/model/delta/deltafactory';
import Delta from '../../src/model/delta/delta';
import { default as AttributeDelta, RootAttributeDelta } from '../../src/model/delta/attributedelta';
import InsertDelta from '../../src/model/delta/insertdelta';
import MarkerDelta from '../../src/model/delta/markerdelta';
import MergeDelta from '../../src/model/delta/mergedelta';
import MoveDelta from '../../src/model/delta/movedelta';
import RenameDelta from '../../src/model/delta/renamedelta';
import SplitDelta from '../../src/model/delta/splitdelta';
import UnwrapDelta from '../../src/model/delta/unwrapdelta';
import WrapDelta from '../../src/model/delta/wrapdelta';
import deltaTransform from '../../src/model/delta/transform';
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
	let DebugPlugin, log, error;

	class TestEditor extends StandardEditor {
		constructor( ...args ) {
			super( ...args );

			this.document.createRoot( 'main' );
			this.editing.createRoot( this.element, 'main' );
		}
	}

	before( () => {
		log = sinon.spy();
		error = sinon.spy();
		DebugPlugin = enableEngineDebug( { log, error } );
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

				expect( op.toString() ).to.equal( 'AttributeOperation( 0 ): "key": null -> {"foo":"bar"}, main [ 0 ] - [ 6 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'InsertOperation (text node)', () => {
				const op = new InsertOperation( ModelPosition.createAt( modelRoot, 3 ), [ new ModelText( 'abc' ) ], 0 );

				expect( op.toString() ).to.equal( 'InsertOperation( 0 ): #abc -> main [ 3 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'InsertOperation (element)', () => {
				const op = new InsertOperation( ModelPosition.createAt( modelRoot, 3 ), [ new ModelElement( 'paragraph' ) ], 0 );

				expect( op.toString() ).to.equal( 'InsertOperation( 0 ): <paragraph> -> main [ 3 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'InsertOperation (multiple nodes)', () => {
				const nodes = [ new ModelText( 'x' ), new ModelElement( 'y' ), new ModelText( 'z' ) ];
				const op = new InsertOperation( ModelPosition.createAt( modelRoot, 3 ), nodes, 0 );

				expect( op.toString() ).to.equal( 'InsertOperation( 0 ): [ 3 ] -> main [ 3 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'MarkerOperation', () => {
				const op = new MarkerOperation( 'marker', null, ModelRange.createIn( modelRoot ), modelDoc.markers, 0 );

				expect( op.toString() ).to.equal( 'MarkerOperation( 0 ): "marker": null -> main [ 0 ] - [ 6 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'MoveOperation', () => {
				const op = new MoveOperation( ModelPosition.createAt( modelRoot, 1 ), 2, ModelPosition.createAt( modelRoot, 6 ), 0 );

				expect( op.toString() ).to.equal( 'MoveOperation( 0 ): main [ 1 ] - [ 3 ] -> main [ 6 ]' );

				op.log();
				expect( log.calledWithExactly( op.toString() ) ).to.be.true;
			} );

			it( 'MoveOperation sticky', () => {
				const op = new MoveOperation( ModelPosition.createAt( modelRoot, 1 ), 2, ModelPosition.createAt( modelRoot, 6 ), 0 );
				op.isSticky = true;

				expect( op.toString() ).to.equal( 'MoveOperation( 0 ): main [ 1 ] - [ 3 ] -> main [ 6 ] (sticky)' );

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
				const op = new RenameOperation( ModelPosition.createAt( modelRoot, 1 ), 'old', 'new', 0 );

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

				expect( delta.toString() ).to.equal( 'AttributeDelta( 0 ): "key": -> {"foo":"bar"}, main [ 0 ] - [ 6 ], 1 ops' );
				delta.log();

				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'InsertDelta (text node)', () => {
				const delta = new InsertDelta();
				const op = new InsertOperation( ModelPosition.createAt( modelRoot, 3 ), [ new ModelText( 'abc' ) ], 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'InsertDelta( 0 ): #abc -> main [ 3 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'InsertDelta (element)', () => {
				const delta = new InsertDelta();
				const op = new InsertOperation( ModelPosition.createAt( modelRoot, 3 ), [ new ModelElement( 'paragraph' ) ], 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'InsertDelta( 0 ): <paragraph> -> main [ 3 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'InsertDelta (multiple nodes)', () => {
				const delta = new InsertDelta();
				const nodes = [ new ModelText( 'x' ), new ModelElement( 'y' ), new ModelText( 'z' ) ];
				const op = new InsertOperation( ModelPosition.createAt( modelRoot, 3 ), nodes, 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'InsertDelta( 0 ): [ 3 ] -> main [ 3 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'MarkerDelta', () => {
				modelRoot.appendChildren( new ModelText( 'foobar' ) );

				const delta = new MarkerDelta();
				const op = new MarkerOperation( 'marker', null, ModelRange.createIn( modelRoot ), modelDoc.markers, 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'MarkerDelta( 0 ): "marker": null -> main [ 0 ] - [ 6 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'MergeDelta', () => {
				const otherRoot = modelDoc.createRoot( '$root', 'otherRoot' );
				const firstEle = new ModelElement( 'paragraph' );
				const removedEle = new ModelElement( 'paragraph', null, [ new ModelText( 'foo' ) ] );

				otherRoot.appendChildren( [ firstEle, removedEle ] );

				const graveyard = modelDoc.graveyard;
				const delta = new MergeDelta();
				const move = new MoveOperation( ModelPosition.createAt( removedEle, 0 ), 3, ModelPosition.createAt( firstEle, 0 ), 0 );
				const remove = new RemoveOperation(
					ModelPosition.createBefore( removedEle ),
					1,
					ModelPosition.createAt( graveyard, 0 ),
					1
				);

				delta.addOperation( move );
				delta.addOperation( remove );

				expect( delta.toString() ).to.equal( 'MergeDelta( 0 ): otherRoot [ 1 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'MoveDelta', () => {
				const delta = new MoveDelta();
				const move1 = new MoveOperation( ModelPosition.createAt( modelRoot, 0 ), 1, ModelPosition.createAt( modelRoot, 3 ), 0 );
				const move2 = new MoveOperation( ModelPosition.createAt( modelRoot, 1 ), 1, ModelPosition.createAt( modelRoot, 6 ), 0 );

				delta.addOperation( move1 );
				delta.addOperation( move2 );

				expect( delta.toString() ).to.equal( 'MoveDelta( 0 ): main [ 0 ] - [ 1 ] -> main [ 3 ]; main [ 1 ] - [ 2 ] -> main [ 6 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'RenameDelta', () => {
				const delta = new RenameDelta();
				const op = new RenameOperation( ModelPosition.createAt( modelRoot, 1 ), 'old', 'new', 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'RenameDelta( 0 ): main [ 1 ]: "old" -> "new"' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'RootAttributeDelta', () => {
				const delta = new RootAttributeDelta();
				const op = new RootAttributeOperation( modelRoot, 'key', 'old', null, 0 );

				delta.addOperation( op );

				expect( delta.toString() ).to.equal( 'RootAttributeDelta( 0 ): "key": "old" -> null, main' );

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

				expect( delta.toString() ).to.equal( 'SplitDelta( 0 ): otherRoot [ 0, 1 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'SplitDelta - NoOperation as second operation', () => {
				const otherRoot = modelDoc.createRoot( 'main', 'otherRoot' );
				const splitEle = new ModelElement( 'paragraph', null, [ new ModelText( 'foo' ) ] );

				otherRoot.appendChildren( [ splitEle ] );

				const delta = new SplitDelta();
				const insert = new InsertOperation( ModelPosition.createAt( otherRoot, 1 ), [ new ModelElement( 'paragraph' ) ], 0 );
				const move = new NoOperation( 1 );

				delta.addOperation( insert );
				delta.addOperation( move );

				expect( delta.toString() ).to.equal( 'SplitDelta( 0 ): (clone to otherRoot [ 1 ])' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'SplitDelta - NoOperation as second operation, MoveOperation as first operation', () => {
				const otherRoot = modelDoc.createRoot( 'main', 'otherRoot' );

				const delta = new SplitDelta();
				const insert = new MoveOperation( ModelPosition.createAt( modelRoot, 1 ), 1, ModelPosition.createAt( otherRoot, 1 ), 0 );
				const move = new NoOperation( 1 );

				delta.addOperation( insert );
				delta.addOperation( move );

				expect( delta.toString() ).to.equal( 'SplitDelta( 0 ): (clone to otherRoot [ 1 ])' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'UnwrapDelta', () => {
				const otherRoot = modelDoc.createRoot( 'main', 'otherRoot' );
				const unwrapEle = new ModelElement( 'paragraph', null, [ new ModelText( 'foo' ) ] );

				otherRoot.appendChildren( [ unwrapEle ] );

				const graveyard = modelDoc.graveyard;
				const delta = new UnwrapDelta();
				const move = new MoveOperation( ModelPosition.createAt( unwrapEle, 0 ), 3, ModelPosition.createAt( otherRoot, 0 ), 0 );
				const remove = new RemoveOperation( ModelPosition.createAt( otherRoot, 3 ), 1, ModelPosition.createAt( graveyard, 0 ), 1 );

				delta.addOperation( move );
				delta.addOperation( remove );

				expect( delta.toString() ).to.equal( 'UnwrapDelta( 0 ): otherRoot [ 0 ]' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );

			it( 'WrapDelta', () => {
				const delta = new WrapDelta();

				const insert = new InsertOperation( ModelPosition.createAt( modelRoot, 6 ), new ModelElement( 'paragraph' ), 0 );
				const move = new MoveOperation( ModelPosition.createAt( modelRoot, 0 ), 6, new ModelPosition( modelRoot, [ 1, 0 ] ), 1 );

				delta.addOperation( insert );
				delta.addOperation( move );

				expect( delta.toString() ).to.equal( 'WrapDelta( 0 ): main [ 0 ] - [ 6 ] -> <paragraph>' );

				delta.log();
				expect( log.calledWithExactly( delta.toString() ) ).to.be.true;
			} );
		} );

		it( 'for applied operations', () => {
			const delta = new InsertDelta();
			const op = new InsertOperation( ModelPosition.createAt( modelRoot, 0 ), [ new ModelText( 'foo' ) ], 0 );
			delta.addOperation( op );

			modelDoc.applyOperation( op );

			expect( log.calledWithExactly( 'Applying InsertOperation( 0 ): #foo -> main [ 0 ]' ) ).to.be.true;
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
			} ).then( _editor => {
				editor = _editor;
			} );
		} );

		it( 'should store model and view state after each applied operation', () => {
			const model = editor.document;
			const modelRoot = model.getRoot();
			const view = editor.editing.view;

			const insert = new InsertOperation( ModelPosition.createAt( modelRoot, 0 ), new ModelText( 'foobar' ), 0 );
			model.applyOperation( wrapInDelta( insert ) );

			const graveyard = model.graveyard;
			const remove = new RemoveOperation( ModelPosition.createAt( modelRoot, 1 ), 2, ModelPosition.createAt( graveyard, 0 ), 1 );
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
				'\n\too' +
				'\n</$graveyard>' +
				'\n<main>' +
				'\n\tfbar' +
				'\n</main>'
			);

			model.log();
			expectLog(
				'<$graveyard>' +
				'\n\too' +
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

			expect( modelDoc.getAppliedDeltas() ).to.equal( '' );

			const otherRoot = modelDoc.createRoot( '$root', 'otherRoot' );
			const firstEle = new ModelElement( 'paragraph' );
			const removedEle = new ModelElement( 'paragraph', null, [ new ModelText( 'foo' ) ] );

			otherRoot.appendChildren( [ firstEle, removedEle ] );

			const delta = new MergeDelta();
			const graveyard = modelDoc.graveyard;
			const move = new MoveOperation( ModelPosition.createAt( removedEle, 0 ), 3, ModelPosition.createAt( firstEle, 0 ), 0 );
			const remove = new RemoveOperation( ModelPosition.createBefore( removedEle ), 1, ModelPosition.createAt( graveyard, 0 ), 1 );

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
			const graveyard = modelDoc.graveyard;
			const move = new MoveOperation( ModelPosition.createAt( removedEle, 0 ), 3, ModelPosition.createAt( firstEle, 0 ), 0 );
			const remove = new RemoveOperation( ModelPosition.createBefore( removedEle ), 1, ModelPosition.createAt( graveyard, 0 ), 1 );

			delta.addOperation( move );
			delta.addOperation( remove );

			const stringifiedDeltas = JSON.stringify( delta.toJSON() );

			const deltaReplayer = modelDoc.createReplayer( stringifiedDeltas );

			expect( deltaReplayer.getDeltasToReplay() ).to.deep.equal( [ JSON.parse( stringifiedDeltas ) ] );
		} );
	} );

	describe( 'should provide debug tools for delta transformation', () => {
		let document, root, otherRoot;

		beforeEach( () => {
			document = new ModelDocument();
			root = document.createRoot();
			otherRoot = document.createRoot( 'other', 'other' );
		} );

		it( 'Delta#_saveHistory()', () => {
			const insertDeltaA = new InsertDelta();
			const insertOpA = new InsertOperation( ModelPosition.createAt( root, 0 ), new ModelText( 'a' ), 0 );
			insertDeltaA.addOperation( insertOpA );

			const insertDeltaB = new InsertDelta();
			const insertOpB = new InsertOperation( ModelPosition.createAt( root, 0 ), new ModelText( 'a' ), 0 );
			insertDeltaB.addOperation( insertOpB );

			const insertDeltaFinalA = new InsertDelta();
			const insertOpFinalA = new InsertOperation( ModelPosition.createAt( root, 0 ), new ModelText( 'a' ), 1 );
			insertDeltaFinalA.addOperation( insertOpFinalA );
			const insertDeltaFinalAJsonWithoutHistory = JSON.stringify( insertDeltaFinalA );
			insertDeltaFinalA._saveHistory( {
				before: insertDeltaA,
				transformedBy: insertDeltaB,
				wasImportant: true,
				resultIndex: 0,
				resultsTotal: 1
			} );

			const insertDeltaC = new InsertDelta();
			const insertOpC = new InsertOperation( ModelPosition.createAt( root, 0 ), new ModelText( 'a' ), 1 );
			insertDeltaC.addOperation( insertOpC );

			const insertDeltaFinalB = new InsertDelta();
			const insertOpFinalB = new InsertOperation( ModelPosition.createAt( root, 0 ), new ModelText( 'a' ), 2 );
			insertDeltaFinalB.addOperation( insertOpFinalB );
			insertDeltaFinalB._saveHistory( {
				before: insertDeltaFinalA,
				transformedBy: insertDeltaC,
				wasImportant: false,
				resultIndex: 1,
				resultsTotal: 3
			} );

			expect( insertDeltaA.history ).to.be.undefined;
			expect( insertDeltaB.history ).to.be.undefined;

			expect( insertDeltaFinalA.history ).not.to.be.undefined;
			expect( insertDeltaFinalA.history.length ).to.equal( 1 );
			expect( insertDeltaFinalA.history[ 0 ] ).to.deep.equal( {
				before: JSON.stringify( insertDeltaA ),
				transformedBy: JSON.stringify( insertDeltaB ),
				wasImportant: true,
				resultIndex: 0,
				resultsTotal: 1
			} );

			expect( insertDeltaFinalB.history ).not.to.be.undefined;
			expect( insertDeltaFinalB.history.length ).to.equal( 2 );
			expect( insertDeltaFinalB.history[ 0 ] ).to.deep.equal( {
				before: JSON.stringify( insertDeltaA ),
				transformedBy: JSON.stringify( insertDeltaB ),
				wasImportant: true,
				resultIndex: 0,
				resultsTotal: 1
			} );
			expect( insertDeltaFinalB.history[ 1 ] ).to.deep.equal( {
				before: insertDeltaFinalAJsonWithoutHistory,
				transformedBy: JSON.stringify( insertDeltaC ),
				wasImportant: false,
				resultIndex: 1,
				resultsTotal: 3
			} );
		} );

		it( 'save delta history on deltaTransform.transform', () => {
			const deltaA = new MoveDelta();
			const opA = new MoveOperation( ModelPosition.createAt( root, 4 ), 4, ModelPosition.createAt( otherRoot, 4 ), 0 );
			deltaA.addOperation( opA );

			const deltaB = new InsertDelta();
			const opB = new InsertOperation( ModelPosition.createAt( root, 0 ), new ModelText( 'a' ), 0 );
			deltaB.addOperation( opB );

			const deltaC = new MoveDelta();
			const opC = new MoveOperation( ModelPosition.createAt( root, 4 ), 2, ModelPosition.createAt( root, 0 ), 1 );
			deltaC.addOperation( opC );

			let result = deltaTransform.transform( deltaA, deltaB, { document, wasAffected: new Map() } );

			expect( result[ 0 ].history ).not.to.be.undefined;
			expect( result[ 0 ].history.length ).to.equal( 1 );

			expect( result[ 0 ].history[ 0 ] ).to.deep.equal( {
				before: JSON.stringify( deltaA ),
				transformedBy: JSON.stringify( deltaB ),
				wasImportant: false,
				resultIndex: 0,
				resultsTotal: 1
			} );

			const firstResultWithoutHistory = result[ 0 ].clone();
			delete firstResultWithoutHistory.history;

			result = deltaTransform.transform( result[ 0 ], deltaC, { isStrong: true, document, wasAffected: new Map() } );
			expect( result[ 0 ].history ).not.to.be.undefined;
			expect( result[ 0 ].history.length ).to.equal( 2 );

			expect( result[ 0 ].history[ 0 ] ).to.deep.equal( {
				before: JSON.stringify( deltaA ),
				transformedBy: JSON.stringify( deltaB ),
				wasImportant: false,
				resultIndex: 0,
				resultsTotal: 1
			} );

			expect( result[ 0 ].history[ 1 ] ).to.deep.equal( {
				before: JSON.stringify( firstResultWithoutHistory ),
				transformedBy: JSON.stringify( deltaC ),
				wasImportant: true,
				resultIndex: 0,
				resultsTotal: 2
			} );
		} );

		it( 'recreate delta using Delta#history', () => {
			const deltaA = new MoveDelta();
			const opA = new MoveOperation( ModelPosition.createAt( root, 4 ), 4, ModelPosition.createAt( otherRoot, 4 ), 0 );
			deltaA.addOperation( opA );

			const deltaB = new InsertDelta();
			const opB = new InsertOperation( ModelPosition.createAt( root, 0 ), new ModelText( 'a' ), 0 );
			deltaB.addOperation( opB );

			const deltaC = new MoveDelta();
			const opC = new MoveOperation( ModelPosition.createAt( root, 4 ), 2, ModelPosition.createAt( root, 0 ), 1 );
			deltaC.addOperation( opC );

			let original = deltaTransform.transform( deltaA, deltaB, { document, wasAffected: new Map() } );
			original = deltaTransform.transform( original[ 0 ], deltaC, { isStrong: true, document, wasAffected: new Map() } )[ 0 ];

			const history = original.history;

			let recreated = deltaTransform.transform(
				DeltaFactory.fromJSON( JSON.parse( history[ 0 ].before ), document ),
				DeltaFactory.fromJSON( JSON.parse( history[ 0 ].transformedBy ), document ),
				{ isStrong: history[ 0 ].wasImportant, document, wasAffected: new Map() }
			);

			recreated = recreated[ history[ 0 ].resultIndex ];

			recreated = deltaTransform.transform(
				recreated,
				DeltaFactory.fromJSON( JSON.parse( history[ 1 ].transformedBy ), document ),
				{ isStrong: history[ 1 ].wasImportant, document, wasAffected: new Map() }
			);

			recreated = recreated[ history[ 1 ].resultIndex ];

			delete original.history;
			delete recreated.history;

			expect( JSON.stringify( recreated ) ).to.equal( JSON.stringify( original ) );
		} );

		describe( 'provide additional logging when transformation crashes', () => {
			it( 'with more important delta A', () => {
				const deltaA = new MoveDelta();
				const opA = new MoveOperation( ModelPosition.createAt( root, 4 ), 4, ModelPosition.createAt( otherRoot, 4 ), 0 );
				deltaA.addOperation( opA );

				const deltaB = new InsertDelta();
				const opB = new InsertOperation( ModelPosition.createAt( root, 0 ), new ModelText( 'a' ), 0 );
				deltaB.addOperation( opB );

				deltaTransform.defaultTransform = () => {
					throw new Error();
				};

				expect( () => deltaTransform.transform( deltaA, deltaB, { isStrong: true } ) ).to.throw( Error );
				expect( error.calledWith( deltaA.toString() + ' (important)' ) ).to.be.true;
				expect( error.calledWith( deltaB.toString() ) ).to.be.true;
			} );

			it( 'with more important delta B', () => {
				const deltaA = new MoveDelta();
				const opA = new MoveOperation( ModelPosition.createAt( root, 4 ), 4, ModelPosition.createAt( otherRoot, 4 ), 0 );
				deltaA.addOperation( opA );

				const deltaB = new InsertDelta();
				const opB = new InsertOperation( ModelPosition.createAt( root, 0 ), new ModelText( 'a' ), 0 );
				deltaB.addOperation( opB );

				deltaTransform.defaultTransform = () => {
					throw new Error();
				};

				expect( () => deltaTransform.transform( deltaA, deltaB, { isStrong: false } ) ).to.throw( Error );
				expect( error.calledWith( deltaA.toString() ) ).to.be.true;
				expect( error.calledWith( deltaB.toString() + ' (important)' ) ).to.be.true;
			} );
		} );
	} );

	function expectLog( expectedLogMsg ) {
		expect( log.calledWithExactly( expectedLogMsg ) ).to.be.true;
		log.reset();
	}

	function wrapInDelta( op ) {
		const delta = new Delta();
		delta.addOperation( op );

		return op;
	}
} );
