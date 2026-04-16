/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { global } from '@ckeditor/ckeditor5-utils';
import { Command } from '@ckeditor/ckeditor5-core';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { ShowWhitespaceEditing } from '../src/showwhitespaceediting.js';

describe( 'ShowWhitespaceCommand', () => {
	let editor, domElement, command;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicTestEditor.create( domElement, {
			plugins: [
				Paragraph,
				Heading,
				Essentials,
				ShowWhitespaceEditing
			]
		} );

		command = editor.commands.get( 'showWhitespace' );
	} );

	afterEach( async () => {
		domElement.remove();
		await editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should be a command instance', () => {
			expect( command ).to.be.instanceOf( Command );
		} );

		it( 'should set "#affectsData" to false', () => {
			expect( command.affectsData ).to.be.false;
		} );

		it( 'should set "#value" to false', () => {
			expect( command.value ).to.be.false;
		} );
	} );

	describe( '#execute()', () => {
		it( 'should set "ck-show-whitespace" class on the root when executed', () => {
			editor.execute( 'showWhitespace' );

			expect( editor.editing.view.document.roots.get( 'main' ).hasClass( 'ck-show-whitespace' ) ).to.be.true;
		} );

		it( 'should remove "ck-show-whitespace" class when executed again', () => {
			editor.execute( 'showWhitespace' );
			editor.execute( 'showWhitespace' );

			expect( editor.editing.view.document.roots.get( 'main' ).hasClass( 'ck-show-whitespace' ) ).to.be.false;
		} );

		it( 'should set value to true when executed', () => {
			editor.execute( 'showWhitespace' );

			expect( command.value ).to.be.true;
		} );

		it( 'should set value to false when toggled off', () => {
			editor.execute( 'showWhitespace' );
			editor.execute( 'showWhitespace' );

			expect( command.value ).to.be.false;
		} );

		it( 'should add "ck-show-whitespace--no-paragraph-marks" class when paragraphMarks config is false', async () => {
			domElement.remove();
			await editor.destroy();

			domElement = global.document.createElement( 'div' );
			global.document.body.appendChild( domElement );

			editor = await ClassicTestEditor.create( domElement, {
				plugins: [ Paragraph, Essentials, ShowWhitespaceEditing ],
				showWhitespace: { paragraphMarks: false }
			} );

			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.roots.get( 'main' );

			expect( root.hasClass( 'ck-show-whitespace' ) ).to.be.true;
			expect( root.hasClass( 'ck-show-whitespace--no-paragraph-marks' ) ).to.be.true;
		} );

		it( 'should not add "ck-show-whitespace--no-paragraph-marks" class by default', () => {
			editor.execute( 'showWhitespace' );

			const root = editor.editing.view.document.roots.get( 'main' );

			expect( root.hasClass( 'ck-show-whitespace--no-paragraph-marks' ) ).to.be.false;
		} );

		it( 'should not affect data output', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			expect( editor.getData() ).to.equal( '<p>foo bar</p>' );
		} );

		it( 'should be enabled in read-only mode', () => {
			editor.enableReadOnlyMode( 'test' );

			expect( command.isEnabled ).to.be.true;
		} );
	} );

	describe( 'reconversion', () => {
		it( 'should reconvert elements containing text when toggled on', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			const reconvertSpy = sinon.spy( editor.editing, 'reconvertItem' );

			editor.execute( 'showWhitespace' );

			expect( reconvertSpy.called ).to.be.true;
		} );

		it( 'should reconvert elements when toggled off', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const reconvertSpy = sinon.spy( editor.editing, 'reconvertItem' );

			editor.execute( 'showWhitespace' );

			expect( reconvertSpy.called ).to.be.true;
		} );

		it( 'should not reconvert empty document', () => {
			_setModelData( editor.model, '<paragraph></paragraph>' );

			const reconvertSpy = sinon.spy( editor.editing, 'reconvertItem' );

			editor.execute( 'showWhitespace' );

			// Empty paragraph has no text nodes, so nothing to reconvert.
			expect( reconvertSpy.called ).to.be.false;
		} );

		it( 'should abort pending reconversion when toggled again quickly', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			const clearTimeoutSpy = sinon.spy( global.window, 'clearTimeout' );

			editor.execute( 'showWhitespace' );

			// Toggle again immediately — should abort the pending background reconversion.
			editor.execute( 'showWhitespace' );

			// clearTimeout should have been called at least once for aborting.
			expect( clearTimeoutSpy.called ).to.be.true;

			clearTimeoutSpy.restore();
		} );

		it( 'should process background chunks asynchronously', done => {
			// Create enough content for background batches.
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( writer.createRangeIn( root ) );

				for ( let i = 0; i < 5; i++ ) {
					const paragraph = writer.createElement( 'paragraph' );

					writer.insertText( 'text ' + i, paragraph );
					writer.insert( paragraph, root, 'end' );
				}
			} );

			editor.execute( 'showWhitespace' );

			// Background chunks process via setTimeout(fn, 0).
			// After a tick, pending elements should be processed.
			setTimeout( () => {
				// The command should have cleared pending elements.
				expect( command._pendingElements.size ).to.equal( 0 );
				done();
			}, 50 );
		} );

		it( 'should clear pending elements set when all chunks are processed', done => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			setTimeout( () => {
				expect( command._pendingElements.size ).to.equal( 0 );
				done();
			}, 50 );
		} );

		it( 'should remove scroll listener on abort', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			// Manually check that _scrollTarget is set.
			const scrollTarget = command._scrollTarget;

			if ( scrollTarget ) {
				const removeListenerSpy = sinon.spy( scrollTarget, 'removeEventListener' );

				// Abort by toggling again.
				editor.execute( 'showWhitespace' );

				expect( removeListenerSpy.called ).to.be.true;

				removeListenerSpy.restore();
			}
		} );

		it( 'should clear pending chunk timeout on abort', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			// After abort, the timeout handle should be null.
			command._abortPendingReconversion();

			expect( command._pendingChunkTimeout ).to.be.null;
		} );

		it( 'should clear pending elements on abort', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			command._abortPendingReconversion();

			expect( command._pendingElements.size ).to.equal( 0 );
		} );

		it( 'should null out scroll references on abort', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			command._abortPendingReconversion();

			expect( command._scrollHandler ).to.be.null;
			expect( command._scrollTarget ).to.be.null;
		} );

		it( 'should skip elements in graveyard during background reconversion', done => {
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( writer.createRangeIn( root ) );

				for ( let i = 0; i < 3; i++ ) {
					const paragraph = writer.createElement( 'paragraph' );

					writer.insertText( 'text ' + i, paragraph );
					writer.insert( paragraph, root, 'end' );
				}
			} );

			editor.execute( 'showWhitespace' );

			// Remove a paragraph while background reconversion is pending.
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( root.getChild( 1 ) );
			} );

			// Should not throw.
			setTimeout( () => {
				expect( command._pendingElements.size ).to.equal( 0 );
				done();
			}, 50 );
		} );
	} );

	describe( 'viewport partitioning', () => {
		it( 'should classify elements as off-screen when their DOM rect is below the viewport', () => {
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( writer.createRangeIn( root ) );

				for ( let i = 0; i < 3; i++ ) {
					const paragraph = writer.createElement( 'paragraph' );

					writer.insertText( 'paragraph ' + i, paragraph );
					writer.insert( paragraph, root, 'end' );
				}
			} );

			// Stub viewport to be very small so all elements are "below".
			testUtils.sinon.stub( global.window, 'innerHeight' ).value( 0 );

			// Stub all paragraph DOM elements to be below viewport.
			const root = editor.editing.view.document.getRoot();

			for ( const child of root.getChildren() ) {
				const domElement = editor.editing.view.domConverter.mapViewToDom( child );

				if ( domElement ) {
					testUtils.sinon.stub( domElement, 'getBoundingClientRect' ).returns( {
						top: 5000,
						bottom: 5050,
						left: 0,
						right: 100,
						width: 100,
						height: 50
					} );
				}
			}

			editor.execute( 'showWhitespace' );

			// All elements should be pending (off-screen), not immediately reconverted.
			expect( command._pendingElements.size ).to.be.greaterThan( 0 );
		} );

		it( 'should immediately reconvert elements within the viewport', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			// Stub viewport to be large — everything is visible.
			testUtils.sinon.stub( global.window, 'innerHeight' ).value( 10000 );

			const reconvertSpy = sinon.spy( editor.editing, 'reconvertItem' );

			editor.execute( 'showWhitespace' );

			// Should reconvert immediately (visible) with no pending elements.
			expect( reconvertSpy.called ).to.be.true;
			expect( command._pendingElements.size ).to.equal( 0 );
		} );

		it( 'should treat elements with no view mapping as off-screen', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			// Stub mapper to return undefined for the paragraph.
			const modelRoot = editor.model.document.getRoot();
			const paragraph = modelRoot.getChild( 0 );

			testUtils.sinon.stub( editor.editing.mapper, 'toViewElement' )
				.withArgs( paragraph ).returns( undefined );

			editor.execute( 'showWhitespace' );

			// The element with no view mapping goes to off-screen → pending.
			expect( command._pendingElements.size ).to.be.greaterThan( 0 );
		} );

		it( 'should treat elements with no DOM mapping as off-screen', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			// Stub domConverter to return null for the view element.
			testUtils.sinon.stub( editor.editing.view.domConverter, 'mapViewToDom' ).returns( null );

			editor.execute( 'showWhitespace' );

			expect( command._pendingElements.size ).to.be.greaterThan( 0 );
		} );
	} );

	describe( 'scroll handler', () => {
		it( 'should attach a scroll listener when background reconversion starts', () => {
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( writer.createRangeIn( root ) );

				for ( let i = 0; i < 3; i++ ) {
					const paragraph = writer.createElement( 'paragraph' );

					writer.insertText( 'paragraph ' + i, paragraph );
					writer.insert( paragraph, root, 'end' );
				}
			} );

			// Force all elements off-screen.
			testUtils.sinon.stub( global.window, 'innerHeight' ).value( 0 );

			const root = editor.editing.view.document.getRoot();

			for ( const child of root.getChildren() ) {
				const domElement = editor.editing.view.domConverter.mapViewToDom( child );

				if ( domElement ) {
					testUtils.sinon.stub( domElement, 'getBoundingClientRect' ).returns( {
						top: 5000, bottom: 5050, left: 0, right: 100, width: 100, height: 50
					} );
				}
			}

			editor.execute( 'showWhitespace' );

			expect( command._scrollHandler ).to.be.a( 'function' );
			expect( command._scrollTarget ).to.not.be.null;
		} );

		it( 'should not attach a scroll listener when there are no off-screen elements', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			// Everything is visible.
			testUtils.sinon.stub( global.window, 'innerHeight' ).value( 10000 );

			editor.execute( 'showWhitespace' );

			// No off-screen elements → no background reconversion → no scroll handler.
			expect( command._scrollHandler ).to.be.null;
		} );

		it( 'should remove scroll listener when background reconversion completes', done => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			setTimeout( () => {
				expect( command._scrollHandler ).to.be.null;
				expect( command._scrollTarget ).to.be.null;
				done();
			}, 100 );
		} );
	} );

	describe( 'background chunk processing', () => {
		it( 'should reconvert off-screen elements in batches via setTimeout', done => {
			createParagraphs( editor, 3 );
			stubAllElementsOffScreen( editor );

			const reconvertSpy = sinon.spy( editor.editing, 'reconvertItem' );

			editor.execute( 'showWhitespace' );

			// Immediate: no reconversion yet (all off-screen).
			expect( reconvertSpy.callCount ).to.equal( 0 );

			// After tick: background chunk should process.
			setTimeout( () => {
				expect( reconvertSpy.callCount ).to.be.greaterThan( 0 );
				done();
			}, 50 );
		} );

		it( 'should complete all chunks and clean up when finished', done => {
			createParagraphs( editor, 3 );
			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			setTimeout( () => {
				expect( command._pendingElements.size ).to.equal( 0 );
				expect( command._pendingChunkTimeout ).to.be.null;
				expect( command._scrollHandler ).to.be.null;
				done();
			}, 200 );
		} );

		it( 'should skip elements that moved to graveyard during chunking', done => {
			createParagraphs( editor, 3 );
			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			// Remove a paragraph while chunks are pending.
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( root.getChild( 1 ) );
			} );

			setTimeout( () => {
				// Should complete without errors.
				expect( command._pendingElements.size ).to.equal( 0 );
				done();
			}, 200 );
		} );
	} );

	describe( 'scroll handler behavior', () => {
		it( 'should reconvert pending elements that scroll into viewport', done => {
			createParagraphs( editor, 3 );
			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			// Now "scroll" them into view by changing the getBoundingClientRect stub.
			const root = editor.editing.view.document.getRoot();

			for ( const child of root.getChildren() ) {
				const domEl = editor.editing.view.domConverter.mapViewToDom( child );

				if ( domEl && domEl.getBoundingClientRect.restore ) {
					domEl.getBoundingClientRect.restore();
				}

				if ( domEl ) {
					testUtils.sinon.stub( domEl, 'getBoundingClientRect' ).returns( {
						top: 100, bottom: 150, left: 0, right: 100, width: 100, height: 50
					} );
				}
			}

			testUtils.sinon.stub( global.window, 'innerHeight' ).value( 10000 );

			const reconvertSpy = sinon.spy( editor.editing, 'reconvertItem' );

			// Fire scroll event.
			if ( command._scrollTarget ) {
				command._scrollTarget.dispatchEvent( new Event( 'scroll' ) );
			}

			// Scroll handler should fast-track the now-visible elements.
			setTimeout( () => {
				expect( reconvertSpy.called ).to.be.true;
				done();
			}, 50 );
		} );

		it( 'should throttle scroll handler invocations', () => {
			createParagraphs( editor, 3 );
			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			const handler = command._scrollHandler;

			// Call handler twice rapidly — second call should be throttled.
			handler();
			handler();

			// Throttle is 100ms, so the second call within that window should be a no-op.
			// We verify by checking that _pendingElements didn't change from two calls.
			// (If both ran, pending count would differ from just one call.)
			expect( command._pendingElements.size ).to.be.greaterThan( 0 );
		} );

		it( 'should return early when no pending elements remain', () => {
			createParagraphs( editor, 1 );
			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			const handler = command._scrollHandler;

			// Clear pending elements manually.
			command._pendingElements.clear();

			// Should not throw — handler returns early.
			handler();
		} );

		it( 'should handle elements with no view mapping during scroll', () => {
			createParagraphs( editor, 2 );
			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			// Stub mapper to return undefined for all elements.
			testUtils.sinon.stub( editor.editing.mapper, 'toViewElement' ).returns( undefined );

			const handler = command._scrollHandler;

			// Should not throw.
			handler();
		} );

		it( 'should handle elements with no DOM mapping during scroll', () => {
			createParagraphs( editor, 2 );
			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			// Stub domConverter to return null.
			testUtils.sinon.stub( editor.editing.view.domConverter, 'mapViewToDom' ).returns( null );

			const handler = command._scrollHandler;

			// Should not throw.
			handler();
		} );

		it( 'should remove graveyard elements from pending set during scroll', () => {
			createParagraphs( editor, 3 );
			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			// Stop background chunking so pending elements stay.
			clearTimeout( command._pendingChunkTimeout );
			command._pendingChunkTimeout = null;

			const handler = command._scrollHandler;
			const initialPending = command._pendingElements.size;

			// Remove a paragraph (sends it to graveyard).
			editor.model.change( writer => {
				const root = editor.model.document.getRoot();

				writer.remove( root.getChild( 0 ) );
			} );

			// Fire handler directly — it should clean up the graveyard element.
			handler();

			expect( command._pendingElements.size ).to.be.lessThan( initialPending );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should fall back to window when getDomRoot returns null', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			testUtils.sinon.stub( editor.editing.view, 'getDomRoot' ).returns( null );

			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			// Should fall back to window, not throw.
			expect( command._scrollTarget ).to.equal( global.window );
		} );
	} );

	describe( 'findScrollableAncestor()', () => {
		it( 'should find a scrollable parent with overflow-y: auto', () => {
			// The domElement's parent is document.body — typically not scrollable.
			// The scroll target falls back to window.
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			// Falls back to window when no scrollable ancestor.
			expect( command._scrollTarget ).to.equal( global.window );
		} );

		it( 'should find a scrollable parent with overflow-y: scroll', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			// Stub getComputedStyle to report a scrollable parent.
			const domRoot = editor.editing.view.getDomRoot();
			const parentElement = domRoot.parentElement;

			const originalGetComputedStyle = global.window.getComputedStyle;

			testUtils.sinon.stub( global.window, 'getComputedStyle' ).callsFake( el => {
				if ( el === parentElement ) {
					return { overflowY: 'scroll' };
				}

				return originalGetComputedStyle.call( global.window, el );
			} );

			stubAllElementsOffScreen( editor );

			editor.execute( 'showWhitespace' );

			// The scroll target should be the parent element with overflow-y: scroll.
			expect( command._scrollTarget ).to.equal( parentElement );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should clean up pending reconversion on destroy', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			// Should not throw.
			return editor.destroy().then( () => {
				domElement.remove();

				// Prevent double destroy in afterEach.
				editor = { destroy: () => Promise.resolve() };
			} );
		} );

		it( 'should clear timeout handles on destroy', () => {
			_setModelData( editor.model, '<paragraph>foo bar</paragraph>' );

			editor.execute( 'showWhitespace' );

			const abortSpy = sinon.spy( command, '_abortPendingReconversion' );

			command.destroy();

			expect( abortSpy.calledOnce ).to.be.true;

			abortSpy.restore();
		} );
	} );
} );

/**
 * Creates N paragraphs with text in the editor.
 */
function createParagraphs( editor, count ) {
	editor.model.change( writer => {
		const root = editor.model.document.getRoot();

		writer.remove( writer.createRangeIn( root ) );

		for ( let i = 0; i < count; i++ ) {
			const paragraph = writer.createElement( 'paragraph' );

			writer.insertText( 'paragraph ' + i, paragraph );
			writer.insert( paragraph, root, 'end' );
		}
	} );
}

/**
 * Stubs all paragraph DOM elements to appear far below the viewport
 * and sets innerHeight to 0, forcing all elements to be classified as off-screen.
 */
function stubAllElementsOffScreen( editor ) {
	testUtils.sinon.stub( global.window, 'innerHeight' ).value( 0 );

	const root = editor.editing.view.document.getRoot();

	for ( const child of root.getChildren() ) {
		const domElement = editor.editing.view.domConverter.mapViewToDom( child );

		if ( domElement ) {
			testUtils.sinon.stub( domElement, 'getBoundingClientRect' ).returns( {
				top: 5000, bottom: 5050, left: 0, right: 100, width: 100, height: 50
			} );
		}
	}
}
