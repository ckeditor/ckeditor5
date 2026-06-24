/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VirtualTestEditor } from './_utils/virtualtesteditor.js';
import { PendingActions } from '../src/pendingactions.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

let editor, pendingActions;

describe( 'PendingActions', () => {
	beforeEach( () => {
		return VirtualTestEditor.create( {
			plugins: [ PendingActions ]
		} ).then( newEditor => {
			editor = newEditor;
			pendingActions = editor.plugins.get( PendingActions );
		} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should define static pluginName property', () => {
		expect( PendingActions ).toHaveProperty( 'pluginName', 'PendingActions' );
	} );

	it( 'should be marked as a context plugin', () => {
		expect( PendingActions.isContextPlugin ).toBe( true );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( PendingActions.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( PendingActions.isPremiumPlugin ).toBe( false );
	} );

	describe( 'init()', () => {
		it( 'should have hasAny observable', () => {
			const spy = vi.fn();

			pendingActions.on( 'change:hasAny', spy );

			expect( pendingActions ).toHaveProperty( 'hasAny', false );

			pendingActions.hasAny = true;

			expect( spy ).toHaveBeenCalledOnce();
		} );
	} );

	describe( 'add()', () => {
		it( 'should register and return pending action', () => {
			const action = pendingActions.add( 'Action' );

			expect( action ).toBeTypeOf( 'object' );
			expect( action.message ).toBe( 'Action' );
		} );

		it( 'should return observable', () => {
			const spy = vi.fn();
			const action = pendingActions.add( 'Action' );

			action.on( 'change:message', spy );

			action.message = 'New message';

			expect( spy ).toHaveBeenCalledOnce();
		} );

		it( 'should update hasAny observable', () => {
			expect( pendingActions ).toHaveProperty( 'hasAny', false );

			pendingActions.add( 'Action' );

			expect( pendingActions ).toHaveProperty( 'hasAny', true );
		} );

		it( 'should throw an error when invalid message is given', () => {
			expectToThrowCKEditorError( () => {
				pendingActions.add( {} );
			}, /^pendingactions-add-invalid-message/, editor );
		} );

		it( 'should fire add event with added item', () => {
			const spy = vi.fn();

			pendingActions.on( 'add', spy );

			const action = pendingActions.add( 'Some action' );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( action );
		} );
	} );

	describe( 'remove()', () => {
		it( 'should remove given pending action and update observable', () => {
			const action1 = pendingActions.add( 'Action 1' );
			const action2 = pendingActions.add( 'Action 2' );

			expect( pendingActions ).toHaveProperty( 'hasAny', true );

			pendingActions.remove( action1 );

			expect( pendingActions ).toHaveProperty( 'hasAny', true );

			pendingActions.remove( action2 );

			expect( pendingActions ).toHaveProperty( 'hasAny', false );
		} );

		it( 'should fire remove event with removed item', () => {
			const spy = vi.fn();

			pendingActions.on( 'remove', spy );

			const action = pendingActions.add( 'Some action' );

			pendingActions.remove( action );

			expect( spy ).toHaveBeenCalledOnce();
			expect( spy.mock.calls[ 0 ][ 1 ] ).toBe( action );
		} );
	} );

	describe( 'first', () => {
		it( 'should return first pending action from the list', () => {
			expect( pendingActions.first ).toBeNull();

			const action = pendingActions.add( 'Action 1' );

			pendingActions.add( 'Action 2' );

			expect( pendingActions.first ).toBe( action );
		} );
	} );

	describe( 'iterator', () => {
		it( 'should return all panding actions', () => {
			pendingActions.add( 'Action 1' );
			pendingActions.add( 'Action 2' );

			expect( Array.from( pendingActions, action => action.message ) )
				.toEqual( expect.arrayContaining( [ 'Action 1', 'Action 2' ] ) );
		} );
	} );
} );
