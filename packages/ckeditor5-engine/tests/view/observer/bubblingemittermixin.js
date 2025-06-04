/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BubblingEventInfo from '../../../src/view/observer/bubblingeventinfo.js';
import { setData as setModelData } from '../../../src/dev-utils/model.js';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo.js';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'BubblingEmitterMixin', () => {
	let editor, model, view, viewDocument;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, BlockQuoteEditing ] } );

		model = editor.model;
		view = editor.editing.view;
		viewDocument = view.document;
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should allow providing multiple contexts in one listener binding', () => {
		setModelData( model, '<paragraph>foo[]bar</paragraph>' );

		const spy = sinon.spy();
		const data = {};

		viewDocument.on( 'fakeEvent', spy, { context: [ '$text', 'p' ] } );
		fireBubblingEvent( 'fakeEvent', data );

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

		fireBubblingEvent( 'fakeEvent', data );

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
		fireBubblingEvent( 'fakeEvent', data );

		expect( spyContext.callCount ).to.equal( 1 );
		expect( spyGlobal.callCount ).to.equal( 1 );

		viewDocument.off( 'fakeEvent', spyContext );
		fireBubblingEvent( 'fakeEvent', data );

		expect( spyContext.callCount ).to.equal( 1 );
		expect( spyGlobal.callCount ).to.equal( 2 );

		viewDocument.off( 'fakeEvent', spyGlobal );
		fireBubblingEvent( 'fakeEvent', data );

		expect( spyContext.callCount ).to.equal( 1 );
		expect( spyGlobal.callCount ).to.equal( 2 );
	} );

	it( 'should not unbind from contexts if other event is off', () => {
		setModelData( model, '<paragraph>foo[]bar</paragraph>' );

		const spy = sinon.spy();
		const data = {};

		viewDocument.on( 'fakeEvent', spy, { context: 'p' } );
		fireBubblingEvent( 'fakeEvent', data );

		expect( spy.callCount ).to.equal( 1 );

		viewDocument.off( 'otherEvent', spy );
		fireBubblingEvent( 'fakeEvent', data );

		expect( spy.callCount ).to.equal( 2 );
	} );

	describe( '#fire()', () => {
		it( 'should fire bubbling event with the same data as original event', () => {
			const spy = sinon.spy();
			const data = {};

			viewDocument.on( 'fakeEvent', spy, { context: '$root' } );
			fireBubblingEvent( 'fakeEvent', data );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should not fire fakeEvent event on other event fired', () => {
			const spy = sinon.spy();

			viewDocument.on( 'fakeEvent', spy, { context: '$root' } );
			fireBubblingEvent( 'otherEvent', {} );

			expect( spy.notCalled ).to.be.true;
		} );

		it( 'should accept EventInfo instance as an argument', () => {
			const spy = sinon.spy();

			viewDocument.on( 'fakeEvent', spy );
			viewDocument.fire( new EventInfo( viewDocument, 'fakeEvent' ) );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should execute callbacks in the right order without priority', () => {
			const spy1 = sinon.spy().named( 1 );
			const spy2 = sinon.spy().named( 2 );
			const spy3 = sinon.spy().named( 3 );

			viewDocument.on( 'test', spy1 );
			viewDocument.on( 'test', spy2 );
			viewDocument.on( 'test', spy3 );

			fireBubblingEvent( 'test' );

			sinon.assert.callOrder( spy1, spy2, spy3 );
		} );

		it( 'should execute callbacks in the right order with priority defined', () => {
			const spy1 = sinon.spy().named( 1 );
			const spy2 = sinon.spy().named( 2 );
			const spy3 = sinon.spy().named( 3 );
			const spy4 = sinon.spy().named( 4 );
			const spy5 = sinon.spy().named( 5 );

			viewDocument.on( 'test', spy2, { priority: 'high' } );
			viewDocument.on( 'test', spy3 ); // Defaults to 'normal'.
			viewDocument.on( 'test', spy4, { priority: 'low' } );
			viewDocument.on( 'test', spy1, { priority: 'highest' } );
			viewDocument.on( 'test', spy5, { priority: 'lowest' } );

			fireBubblingEvent( 'test' );

			sinon.assert.callOrder( spy1, spy2, spy3, spy4, spy5 );
		} );

		it( 'should pass arguments to callbacks', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			viewDocument.on( 'test', spy1 );
			viewDocument.on( 'test', spy2 );

			fireBubblingEvent( 'test', 1, 'b', true );

			sinon.assert.calledWithExactly( spy1, sinon.match.instanceOf( BubblingEventInfo ), 1, 'b', true );
			sinon.assert.calledWithExactly( spy2, sinon.match.instanceOf( BubblingEventInfo ), 1, 'b', true );
		} );

		it( 'should fire the right event', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			viewDocument.on( '1', spy1 );
			viewDocument.on( '2', spy2 );

			fireBubblingEvent( '2' );

			sinon.assert.notCalled( spy1 );
			sinon.assert.called( spy2 );
		} );

		it( 'should execute callbacks many times', () => {
			const spy = sinon.spy();

			viewDocument.on( 'test', spy );

			fireBubblingEvent( 'test' );
			fireBubblingEvent( 'test' );
			fireBubblingEvent( 'test' );

			sinon.assert.calledThrice( spy );
		} );

		it( 'should do nothing for a non listened event', () => {
			fireBubblingEvent( 'test' );
		} );

		it( 'should accept the same callback many times', () => {
			const spy = sinon.spy();

			viewDocument.on( 'test', spy );
			viewDocument.on( 'test', spy );
			viewDocument.on( 'test', spy );

			fireBubblingEvent( 'test' );

			sinon.assert.calledThrice( spy );
		} );

		it( 'should not fire callbacks for an event that were added while firing that event', () => {
			const spy = sinon.spy();

			viewDocument.on( 'test', () => {
				viewDocument.on( 'test', spy );
			} );

			fireBubblingEvent( 'test' );

			sinon.assert.notCalled( spy );
		} );

		it( 'should correctly fire callbacks for namespaced events', () => {
			const spyFoo = sinon.spy();
			const spyBar = sinon.spy();
			const spyAbc = sinon.spy();
			const spyFoo2 = sinon.spy();

			// Mess up with callbacks order to check whether they are called in adding order.
			viewDocument.on( 'foo', spyFoo );
			viewDocument.on( 'foo:bar:abc', spyAbc );
			viewDocument.on( 'foo:bar', spyBar );

			// This tests whether generic callbacks are also added to specific callbacks lists.
			viewDocument.on( 'foo', spyFoo2 );

			// All four callbacks should be fired.
			fireBubblingEvent( 'foo:bar:abc' );

			sinon.assert.callOrder( spyFoo, spyAbc, spyBar, spyFoo2 );
			sinon.assert.calledOnce( spyFoo );
			sinon.assert.calledOnce( spyAbc );
			sinon.assert.calledOnce( spyBar );
			sinon.assert.calledOnce( spyFoo2 );

			// Only callbacks for foo and foo:bar event should be called.
			fireBubblingEvent( 'foo:bar' );

			sinon.assert.calledOnce( spyAbc );
			sinon.assert.calledTwice( spyFoo );
			sinon.assert.calledTwice( spyBar );
			sinon.assert.calledTwice( spyFoo2 );

			// Only callback for foo should be called as foo:abc has not been registered.
			// Still, foo is a valid, existing namespace.
			fireBubblingEvent( 'foo:abc' );

			sinon.assert.calledOnce( spyAbc );
			sinon.assert.calledTwice( spyBar );
			sinon.assert.calledThrice( spyFoo );
			sinon.assert.calledThrice( spyFoo2 );
		} );

		it( 'should rethrow the CKEditorError error', () => {
			viewDocument.on( 'test', () => {
				throw new CKEditorError( 'foo', null );
			} );

			expectToThrowCKEditorError( () => {
				fireBubblingEvent( 'test' );
			}, /foo/, null );
		} );

		it.skip( 'should rethrow the native errors as they are in the dubug=true mode', () => {
			const error = new TypeError( 'foo' );

			viewDocument.on( 'test', () => {
				throw error;
			} );

			expect( () => {
				fireBubblingEvent( 'test' );
			} ).to.throw( TypeError, /foo/ );
		} );

		describe( 'return value', () => {
			it( 'is undefined by default', () => {
				expect( fireBubblingEvent( 'foo' ) ).to.be.undefined;
			} );

			it( 'is undefined if none of the listeners modified EventInfo#return', () => {
				viewDocument.on( 'foo', () => {} );

				expect( fireBubblingEvent( 'foo' ) ).to.be.undefined;
			} );

			it( 'equals EventInfo#return\'s value', () => {
				viewDocument.on( 'foo', evt => {
					evt.return = 1;
				} );

				expect( fireBubblingEvent( 'foo' ) ).to.equal( 1 );
			} );

			it( 'equals EventInfo#return\'s value even if the event was stopped', () => {
				viewDocument.on( 'foo', evt => {
					evt.return = 1;
				} );
				viewDocument.on( 'foo', evt => {
					evt.stop();
				} );

				expect( fireBubblingEvent( 'foo' ) ).to.equal( 1 );
			} );

			it( 'equals EventInfo#return\'s value when it was set in a namespaced event', () => {
				viewDocument.on( 'foo', evt => {
					evt.return = 1;
				} );

				expect( fireBubblingEvent( 'foo:bar' ) ).to.equal( 1 );
			} );

			it( 'equals the value set by the last callback', () => {
				viewDocument.on( 'foo', evt => {
					evt.return = 1;
				} );
				viewDocument.on( 'foo', evt => {
					evt.return = 2;
				}, { priority: 'high' } );

				expect( fireBubblingEvent( 'foo' ) ).to.equal( 1 );
			} );
		} );
	} );

	describe( 'event bubbling', () => {
		describe( 'bubbling starting from non collapsed selection', () => {
			it( 'should start bubbling from the selection anchor position', () => {
				setModelData( model,
					'<blockQuote><paragraph>fo[o</paragraph></blockQuote>' +
					'<paragraph>b]ar</paragraph>'
				);

				const data = {};
				const events = setListeners();

				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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

					'$document @ highest',
					'$document @ high',
					'$document @ normal',
					'$document @ low',
					'$document @ lowest'
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

				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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

					'$document @ highest',
					'$document @ high',
					'$document @ normal',
					'$document @ low',
					'$document @ lowest'
				] );
			} );
		} );

		describe( 'while the selection in the text node', () => {
			it( 'should bubble events from $text to $root and to default handlers if not stopped', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners( true );

				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest (capturing @ $document)',
					'$capture @ high (capturing @ $document)',
					'$capture @ normal (capturing @ $document)',
					'$capture @ low (capturing @ $document)',
					'$capture @ lowest (capturing @ $document)',

					'$text @ highest (atTarget @ $text)',
					'$text @ high (atTarget @ $text)',
					'$text @ normal (atTarget @ $text)',
					'$text @ low (atTarget @ $text)',
					'$text @ lowest (atTarget @ $text)',

					'p @ highest (bubbling @ p)',
					'p @ high (bubbling @ p)',
					'p @ normal (bubbling @ p)',
					'p @ low (bubbling @ p)',
					'p @ lowest (bubbling @ p)',

					'blockquote @ highest (bubbling @ blockquote)',
					'blockquote @ high (bubbling @ blockquote)',
					'blockquote @ normal (bubbling @ blockquote)',
					'blockquote @ low (bubbling @ blockquote)',
					'blockquote @ lowest (bubbling @ blockquote)',

					'$root @ highest (bubbling @ $root)',
					'$root @ high (bubbling @ $root)',
					'$root @ normal (bubbling @ $root)',
					'$root @ low (bubbling @ $root)',
					'$root @ lowest (bubbling @ $root)',

					'$document @ highest (bubbling @ $document)',
					'$document @ high (bubbling @ $document)',
					'$document @ normal (bubbling @ $document)',
					'$document @ low (bubbling @ $document)',
					'$document @ lowest (bubbling @ $document)'
				] );
			} );

			it( 'should not trigger listeners on the lower priority if stopped on the $document (default) context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop() );
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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

					'$document @ highest',
					'$document @ high',
					'$document @ normal'
				] );
			} );

			it( 'should not trigger listeners on the lower priority if stopped on the $root context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: '$root' } );
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

					'$text @ highest',
					'$text @ high',
					'$text @ normal'
				] );
			} );

			it( 'should not start bubbling events if stopped on the $capture context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: '$capture' } );
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal'
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
				const events = setListeners( true );

				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest (capturing @ $document)',
					'$capture @ high (capturing @ $document)',
					'$capture @ normal (capturing @ $document)',
					'$capture @ low (capturing @ $document)',
					'$capture @ lowest (capturing @ $document)',

					'isCustomObject @ highest (atTarget @ obj)',
					'isCustomObject @ high (atTarget @ obj)',
					'isCustomObject @ normal (atTarget @ obj)',
					'isCustomObject @ low (atTarget @ obj)',
					'isCustomObject @ lowest (atTarget @ obj)',

					'p @ highest (bubbling @ p)',
					'p @ high (bubbling @ p)',
					'p @ normal (bubbling @ p)',
					'p @ low (bubbling @ p)',
					'p @ lowest (bubbling @ p)',

					'blockquote @ highest (bubbling @ blockquote)',
					'blockquote @ high (bubbling @ blockquote)',
					'blockquote @ normal (bubbling @ blockquote)',
					'blockquote @ low (bubbling @ blockquote)',
					'blockquote @ lowest (bubbling @ blockquote)',

					'$root @ highest (bubbling @ $root)',
					'$root @ high (bubbling @ $root)',
					'$root @ normal (bubbling @ $root)',
					'$root @ low (bubbling @ $root)',
					'$root @ lowest (bubbling @ $root)',

					'$document @ highest (bubbling @ $document)',
					'$document @ high (bubbling @ $document)',
					'$document @ normal (bubbling @ $document)',
					'$document @ low (bubbling @ $document)',
					'$document @ lowest (bubbling @ $document)'
				] );
			} );

			it( 'should not trigger listeners on the lower priority if stopped on the $document (default) context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop() );
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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

					'$document @ highest',
					'$document @ high',
					'$document @ normal'
				] );
			} );

			it( 'should not trigger listeners on the lower priority if stopped on the $root context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: '$root' } );
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

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
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal',
					'$capture @ low',
					'$capture @ lowest',

					'isCustomObject @ highest',
					'isCustomObject @ high',
					'isCustomObject @ normal'
				] );
			} );

			it( 'should not start bubbling events if stopped on the $capture context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = {};
				const events = setListeners();

				viewDocument.on( 'fakeEvent', event => event.stop(), { context: '$capture' } );
				fireBubblingEvent( 'fakeEvent', data );

				expect( events ).to.deep.equal( [
					'$capture @ highest',
					'$capture @ high',
					'$capture @ normal'
				] );
			} );
		} );

		it( 'should bubble non bubbling event (but without event info bubbling data)', () => {
			setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

			const data = {};
			const events = setListeners( true );

			viewDocument.fire( 'fakeEvent', data );

			expect( events ).to.deep.equal( [
				'$capture @ highest (undefined @ undefined)',
				'$capture @ high (undefined @ undefined)',
				'$capture @ normal (undefined @ undefined)',
				'$capture @ low (undefined @ undefined)',
				'$capture @ lowest (undefined @ undefined)',

				'$text @ highest (undefined @ undefined)',
				'$text @ high (undefined @ undefined)',
				'$text @ normal (undefined @ undefined)',
				'$text @ low (undefined @ undefined)',
				'$text @ lowest (undefined @ undefined)',

				'p @ highest (undefined @ undefined)',
				'p @ high (undefined @ undefined)',
				'p @ normal (undefined @ undefined)',
				'p @ low (undefined @ undefined)',
				'p @ lowest (undefined @ undefined)',

				'blockquote @ highest (undefined @ undefined)',
				'blockquote @ high (undefined @ undefined)',
				'blockquote @ normal (undefined @ undefined)',
				'blockquote @ low (undefined @ undefined)',
				'blockquote @ lowest (undefined @ undefined)',

				'$root @ highest (undefined @ undefined)',
				'$root @ high (undefined @ undefined)',
				'$root @ normal (undefined @ undefined)',
				'$root @ low (undefined @ undefined)',
				'$root @ lowest (undefined @ undefined)',

				'$document @ highest (undefined @ undefined)',
				'$document @ high (undefined @ undefined)',
				'$document @ normal (undefined @ undefined)',
				'$document @ low (undefined @ undefined)',
				'$document @ lowest (undefined @ undefined)'
			] );
		} );

		it( 'should bubble from the provided view range', () => {
			setModelData( model, '<paragraph>a[]bc</paragraph><blockQuote><paragraph>foobar</paragraph></blockQuote>' );

			const data = {};
			const events = setListeners( true );

			const range = view.createRangeIn( viewDocument.getRoot().getChild( 1 ).getChild( 0 ) );

			viewDocument.fire( new BubblingEventInfo( viewDocument, 'fakeEvent', range ), data );

			expect( events ).to.deep.equal( [
				'$capture @ highest (capturing @ $document)',
				'$capture @ high (capturing @ $document)',
				'$capture @ normal (capturing @ $document)',
				'$capture @ low (capturing @ $document)',
				'$capture @ lowest (capturing @ $document)',

				'$text @ highest (atTarget @ p)',
				'$text @ high (atTarget @ p)',
				'$text @ normal (atTarget @ p)',
				'$text @ low (atTarget @ p)',
				'$text @ lowest (atTarget @ p)',

				'p @ highest (bubbling @ p)',
				'p @ high (bubbling @ p)',
				'p @ normal (bubbling @ p)',
				'p @ low (bubbling @ p)',
				'p @ lowest (bubbling @ p)',

				'blockquote @ highest (bubbling @ blockquote)',
				'blockquote @ high (bubbling @ blockquote)',
				'blockquote @ normal (bubbling @ blockquote)',
				'blockquote @ low (bubbling @ blockquote)',
				'blockquote @ lowest (bubbling @ blockquote)',

				'$root @ highest (bubbling @ $root)',
				'$root @ high (bubbling @ $root)',
				'$root @ normal (bubbling @ $root)',
				'$root @ low (bubbling @ $root)',
				'$root @ lowest (bubbling @ $root)',

				'$document @ highest (bubbling @ $document)',
				'$document @ high (bubbling @ $document)',
				'$document @ normal (bubbling @ $document)',
				'$document @ low (bubbling @ $document)',
				'$document @ lowest (bubbling @ $document)'
			] );
		} );

		function setListeners( useDetails ) {
			const events = [];

			function setListenersForContext( context ) {
				for ( const priority of [ 'highest', 'high', 'normal', 'low', 'lowest' ] ) {
					viewDocument.on( 'fakeEvent', evt => {
						const contextName = typeof context == 'string' ? context : context.name;

						if ( useDetails ) {
							let currentTarget = '';

							if ( !evt.currentTarget ) {
								currentTarget = 'undefined';
							} else if ( evt.currentTarget == viewDocument ) {
								currentTarget = '$document';
							} else if ( evt.currentTarget.is( '$text' ) ) {
								currentTarget = '$text';
							} else if ( evt.currentTarget.is( 'node' ) ) {
								currentTarget = evt.currentTarget.name;
							}

							events.push( `${ contextName } @ ${ priority } (${ evt.eventPhase } @ ${ currentTarget })` );
						} else {
							events.push( `${ contextName } @ ${ priority }` );
						}
					}, { context, priority } );
				}
			}

			setListenersForContext( '$capture' );
			setListenersForContext( '$root' );
			setListenersForContext( '$document' );
			setListenersForContext( '$text' );
			setListenersForContext( 'p' );
			setListenersForContext( 'blockquote' );
			setListenersForContext( isCustomObject );

			return events;
		}

		function isCustomObject( node ) {
			return node.is( 'element', 'obj' );
		}
	} );

	function fireBubblingEvent( name, ...args ) {
		const selection = viewDocument.selection;
		const eventInfo = new BubblingEventInfo( viewDocument, name, selection.getFirstRange() );

		return viewDocument.fire( eventInfo, ...args );
	}
} );
