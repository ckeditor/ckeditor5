/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import BubblingObserver from '../../../src/view/observer/bubblingobserver';
import { setData as setModelData } from '../../../src/dev-utils/model';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';

import { priorities } from '@ckeditor/ckeditor5-utils';

describe( 'BubblingObserver', () => {
	let editor, model, view, viewDocument, observer;

	class MockedBubblingObserver extends BubblingObserver {
		constructor( view ) {
			super( view, 'fakeEvent' );
		}
	}

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, BlockQuoteEditing ] } );

		model = editor.model;
		view = editor.editing.view;
		viewDocument = view.document;
		observer = view.addObserver( MockedBubblingObserver );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should define eventType', () => {
		expect( observer.eventType ).to.equal( 'fakeEvent' );
	} );

	it( 'should fire bubbling event with the same data as original event', () => {
		const spy = sinon.spy();
		const data = {};

		viewDocument.on( 'fakeEvent', spy, { context: '$root' } );
		viewDocument.fire( 'fakeEvent', data );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
	} );

	it( 'should not fire fakeEvent event on other event fired', () => {
		const spy = sinon.spy();

		viewDocument.on( 'fakeEvent', spy, { context: '$root' } );
		viewDocument.fire( 'otherEvent', {} );

		expect( spy.notCalled ).to.be.true;
	} );

	it( 'should allow providing multiple contexts in one listener binding', () => {
		setModelData( model, '<paragraph>foo[]bar</paragraph>' );

		const spy = sinon.spy();
		const data = {};

		viewDocument.on( 'fakeEvent', spy, { context: [ '$text', 'p' ] } );
		viewDocument.fire( 'fakeEvent', data );

		expect( spy.calledTwice ).to.be.true;
		expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		expect( spy.args[ 1 ][ 1 ] ).to.equal( data );
	} );

	it( 'should reuse existing context', () => {
		setModelData( model, '<paragraph>foo[]bar</paragraph>' );

		const spy1 = sinon.spy();
		const spy2 = sinon.spy();
		const data = {};

		viewDocument.on( 'fakeEvent', spy1, { context: 'p' } );
		viewDocument.on( 'fakeEvent', spy2, { context: 'p' } );

		viewDocument.fire( 'fakeEvent', data );

		expect( spy1.calledOnce ).to.be.true;
		expect( spy1.args[ 0 ][ 1 ] ).to.equal( data );
		expect( spy2.calledOnce ).to.be.true;
		expect( spy2.args[ 0 ][ 1 ] ).to.equal( data );
	} );

	it( 'should unbind from contexts', () => {
		setModelData( model, '<paragraph>foo[]bar</paragraph>' );

		const spyContext = sinon.spy();
		const spyGlobal = sinon.spy();
		const data = {};

		viewDocument.on( 'fakeEvent', spyContext, { context: 'p' } );
		viewDocument.on( 'fakeEvent', spyGlobal );
		viewDocument.fire( 'fakeEvent', data );

		expect( spyContext.callCount ).to.equal( 1 );
		expect( spyGlobal.callCount ).to.equal( 1 );

		viewDocument.off( 'fakeEvent', spyContext );
		viewDocument.fire( 'fakeEvent', data );

		expect( spyContext.callCount ).to.equal( 1 );
		expect( spyGlobal.callCount ).to.equal( 2 );

		viewDocument.off( 'fakeEvent', spyGlobal );
		viewDocument.fire( 'fakeEvent', data );

		expect( spyContext.callCount ).to.equal( 1 );
		expect( spyGlobal.callCount ).to.equal( 2 );
	} );

	it( 'should not unbind from contexts if other event is off', () => {
		setModelData( model, '<paragraph>foo[]bar</paragraph>' );

		const spy = sinon.spy();
		const data = {};

		viewDocument.on( 'fakeEvent', spy, { context: 'p' } );
		viewDocument.fire( 'fakeEvent', data );

		expect( spy.callCount ).to.equal( 1 );

		viewDocument.off( 'otherEvent', spy );
		viewDocument.fire( 'fakeEvent', data );

		expect( spy.callCount ).to.equal( 2 );
	} );

	describe( 'event bubbling', () => {
		it( 'should not bubble events if observer is disabled', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			const spy = sinon.spy();
			const data = {};

			viewDocument.on( 'fakeEvent', spy, { context: 'p' } );

			observer.disable();
			viewDocument.fire( 'fakeEvent', data );

			expect( spy.notCalled ).to.be.true;
		} );

		describe( 'bubbling starting from non collapsed selection', () => {
			it( 'should start bubbling from the selection anchor position', () => {
				setModelData( model,
					'<blockQuote><paragraph>fo[o</paragraph></blockQuote>' +
					'<paragraph>b]ar</paragraph>'
				);

				const data = {};
				const events = setListeners();

				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'$text @ highest',
					'$text @ high',
					'$text @ normal',
					'$text @ low',
					'$text @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal',
					'p @ low',
					'p @ lowest',

					'blockquote @ highest',
					'blockquote @ high',
					'blockquote @ normal',
					'blockquote @ low',
					'blockquote @ lowest',

					'$root @ highest',
					'$root @ high',
					'$root @ normal',
					'$root @ low',
					'$root @ lowest',

					'fakeEvent @ high-10'
				] );
			} );

			it( 'should start bubbling from the selection focus position', () => {
				setModelData( model,
					'<blockQuote><paragraph>fo[o</paragraph></blockQuote>' +
					'<paragraph>b]ar</paragraph>',
					{ lastRangeBackward: true }
				);

				const data = {};
				const events = setListeners();

				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'$text @ highest',
					'$text @ high',
					'$text @ normal',
					'$text @ low',
					'$text @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal',
					'p @ low',
					'p @ lowest',

					'blockquote @ highest',
					'blockquote @ high',
					'blockquote @ normal',
					'blockquote @ low',
					'blockquote @ lowest',

					'$root @ highest',
					'$root @ high',
					'$root @ normal',
					'$root @ low',
					'$root @ lowest',

					'fakeEvent @ high-10'
				] );
			} );
		} );

		describe( 'while the selection in the text node', () => {
			it( 'should bubble events from $text to $root and to default handlers if not stopped', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'$text @ highest',
					'$text @ high',
					'$text @ normal',
					'$text @ low',
					'$text @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal',
					'p @ low',
					'p @ lowest',

					'blockquote @ highest',
					'blockquote @ high',
					'blockquote @ normal',
					'blockquote @ low',
					'blockquote @ lowest',

					'$root @ highest',
					'$root @ high',
					'$root @ normal',
					'$root @ low',
					'$root @ lowest',

					'fakeEvent @ high-10'
				] );
			} );

			it( 'should not trigger listeners on the lower priority if stopped on the $root context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: '$root' } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'$text @ highest',
					'$text @ high',
					'$text @ normal',
					'$text @ low',
					'$text @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal',
					'p @ low',
					'p @ lowest',

					'blockquote @ highest',
					'blockquote @ high',
					'blockquote @ normal',
					'blockquote @ low',
					'blockquote @ lowest',

					'$root @ highest',
					'$root @ high',
					'$root @ normal'
				] );
			} );

			it( 'should stop bubbling events if stopped on the blockquote context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: 'blockquote' } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'$text @ highest',
					'$text @ high',
					'$text @ normal',
					'$text @ low',
					'$text @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal',
					'p @ low',
					'p @ lowest',

					'blockquote @ highest',
					'blockquote @ high',
					'blockquote @ normal'
				] );
			} );

			it( 'should stop bubbling events if stopped on the p context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: 'p' } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'$text @ highest',
					'$text @ high',
					'$text @ normal',
					'$text @ low',
					'$text @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal'
				] );
			} );

			it( 'should stop bubbling events if stopped on the $text context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: '$text' } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'$text @ highest',
					'$text @ high',
					'$text @ normal'
				] );
			} );

			it( 'should not start bubbling events if stopped before entering high priority', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { priority: priorities.get( 'high' ) + 1 } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10'
				] );
			} );
		} );

		describe( 'while the selection in on some object node', () => {
			beforeEach( () => {
				model.schema.register( 'object', {
					allowWhere: '$text',
					isInline: true
				} );

				editor.conversion.elementToElement( { model: 'object', view: 'obj' } );
			} );

			it( 'should bubble events from $custom to $root (but without $text) and to default handlers if not stopped', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'isCustomObject @ highest',
					'isCustomObject @ high',
					'isCustomObject @ normal',
					'isCustomObject @ low',
					'isCustomObject @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal',
					'p @ low',
					'p @ lowest',

					'blockquote @ highest',
					'blockquote @ high',
					'blockquote @ normal',
					'blockquote @ low',
					'blockquote @ lowest',

					'$root @ highest',
					'$root @ high',
					'$root @ normal',
					'$root @ low',
					'$root @ lowest',

					'fakeEvent @ high-10'
				] );
			} );

			it( 'should not trigger listeners on the lower priority if stopped on the $root context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: '$root' } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'isCustomObject @ highest',
					'isCustomObject @ high',
					'isCustomObject @ normal',
					'isCustomObject @ low',
					'isCustomObject @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal',
					'p @ low',
					'p @ lowest',

					'blockquote @ highest',
					'blockquote @ high',
					'blockquote @ normal',
					'blockquote @ low',
					'blockquote @ lowest',

					'$root @ highest',
					'$root @ high',
					'$root @ normal'
				] );
			} );

			it( 'should stop bubbling events if stopped on the blockquote context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: 'blockquote' } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'isCustomObject @ highest',
					'isCustomObject @ high',
					'isCustomObject @ normal',
					'isCustomObject @ low',
					'isCustomObject @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal',
					'p @ low',
					'p @ lowest',

					'blockquote @ highest',
					'blockquote @ high',
					'blockquote @ normal'
				] );
			} );

			it( 'should stop bubbling events if stopped on the p context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: 'p' } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'isCustomObject @ highest',
					'isCustomObject @ high',
					'isCustomObject @ normal',
					'isCustomObject @ low',
					'isCustomObject @ lowest',

					'p @ highest',
					'p @ high',
					'p @ normal'
				] );
			} );

			it( 'should stop bubbling events if stopped on the custom context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: isCustomObject } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10',

					'isCustomObject @ highest',
					'isCustomObject @ high',
					'isCustomObject @ normal'
				] );
			} );

			it( 'should not start bubbling events if stopped before entering high priority', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { priority: priorities.get( 'high' ) + 1 } );
				viewDocument.fire( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'fakeEvent @ high+10'
				] );
			} );
		} );

		function setListeners() {
			const events = [];

			function setListenersForContext( context ) {
				for ( const priority of [ 'highest', 'high', 'normal', 'low', 'lowest' ] ) {
					viewDocument.on( 'fakeEvent', () => {
						events.push( `${ typeof context == 'string' ? context : context.name } @ ${ priority }` );
					}, { context, priority } );
				}
			}

			setListenersForContext( '$root' );
			setListenersForContext( '$text' );
			setListenersForContext( 'p' );
			setListenersForContext( 'blockquote' );
			setListenersForContext( isCustomObject );

			viewDocument.on( 'fakeEvent', () => events.push( 'fakeEvent @ high+10' ), { priority: priorities.get( 'high' ) + 10 } );
			viewDocument.on( 'fakeEvent', () => events.push( 'fakeEvent @ high-10' ), { priority: priorities.get( 'high' ) - 10 } );

			return events;
		}

		function isCustomObject( node ) {
			return node.is( 'element', 'obj' );
		}
	} );

	it( 'should implement empty #observe() method', () => {
		expect( () => {
			observer.observe();
		} ).to.not.throw();
	} );
} );
