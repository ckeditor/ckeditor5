/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WidgetHighlightStack } from '../src/highlightstack.js';

describe( 'HighlightStack', () => {
	let stack;

	beforeEach( () => {
		stack = new WidgetHighlightStack();
	} );

	it( 'should fire event when new descriptor is provided to an empty stack', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor-id' };

		stack.on( 'change:top', spy );
		stack.add( descriptor );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ].newDescriptor ).toBe( descriptor );
		expect( spy.mock.calls[ 0 ][ 1 ].oldDescriptor ).toBeUndefined();
	} );

	it( 'should fire event when new top element has changed', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor-1' };
		const secondDescriptor = { priority: 11, classes: 'css-class', id: 'descriptor-2' };

		stack.on( 'change:top', spy );
		stack.add( descriptor );
		stack.add( secondDescriptor );

		expect( spy ).toHaveBeenCalledTimes( 2 );
		expect( spy.mock.calls[ 1 ][ 1 ].newDescriptor ).toBe( secondDescriptor );
		expect( spy.mock.calls[ 1 ][ 1 ].oldDescriptor ).toBe( descriptor );
	} );

	it( 'should fire event when top element has updated', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor-1' };
		const secondDescriptor = { priority: 11, classes: 'css-class', id: 'descriptor-1' };

		stack.on( 'change:top', spy );
		stack.add( descriptor );
		stack.add( secondDescriptor );

		expect( spy ).toHaveBeenCalledTimes( 2 );
		expect( spy.mock.calls[ 0 ][ 1 ].newDescriptor ).toBe( descriptor );
		expect( spy.mock.calls[ 0 ][ 1 ].oldDescriptor ).toBeUndefined();

		expect( spy.mock.calls[ 1 ][ 1 ].newDescriptor ).toBe( secondDescriptor );
		expect( spy.mock.calls[ 1 ][ 1 ].oldDescriptor ).toBe( descriptor );
	} );

	it( 'should not fire event when element with lower priority was added', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor-1' };
		const secondDescriptor = { priority: 9, classes: 'css-class', id: 'descriptor-2' };

		stack.on( 'change:top', spy );
		stack.add( descriptor );
		stack.add( secondDescriptor );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ].newDescriptor ).toBe( descriptor );
		expect( spy.mock.calls[ 0 ][ 1 ].oldDescriptor ).toBeUndefined();
	} );

	it( 'should fire event when top element was removed', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor-1' };
		const secondDescriptor = { priority: 11, classes: 'css-class', id: 'descriptor-2' };

		stack.add( descriptor );
		stack.add( secondDescriptor );

		stack.on( 'change:top', spy );

		stack.remove( secondDescriptor.id );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ].oldDescriptor ).toBe( secondDescriptor );
		expect( spy.mock.calls[ 0 ][ 1 ].newDescriptor ).toBe( descriptor );
	} );

	it( 'should not fire event when other than top element is removed', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor-1' };
		const secondDescriptor = { priority: 11, classes: 'css-class', id: 'descriptor-2' };

		stack.add( descriptor );
		stack.add( secondDescriptor );

		stack.on( 'change:top', spy );

		stack.remove( descriptor );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire event when same descriptor is added', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor-1' };
		const secondDescriptor = { priority: 10, classes: 'css-class', id: 'descriptor-1' };

		stack.on( 'change:top', spy );
		stack.add( descriptor );
		stack.add( secondDescriptor );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ].newDescriptor ).toBe( descriptor );
		expect( spy.mock.calls[ 0 ][ 1 ].oldDescriptor ).toBeUndefined();
	} );

	it( 'should not fire when trying to remove from empty stack', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class' };

		stack.on( 'change:top', spy );
		stack.remove( descriptor );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should not fire when trying to remove descriptor which is not present', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor-1' };
		const secondDescriptor = { priority: 12, classes: 'css-class', id: 'descriptor-2' };

		stack.add( descriptor );
		stack.on( 'change:top', spy );
		stack.remove( secondDescriptor );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should fire event when last element from stack was removed', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor' };

		stack.add( descriptor );
		stack.on( 'change:top', spy );
		stack.remove( descriptor.id );

		expect( spy ).toHaveBeenCalledOnce();
		expect( spy.mock.calls[ 0 ][ 1 ].newDescriptor ).toBeUndefined();
		expect( spy.mock.calls[ 0 ][ 1 ].oldDescriptor ).toBe( descriptor );
	} );

	it( 'should not fire event when new top descriptor is same as previous', () => {
		const spy = vi.fn();
		const descriptor = { priority: 10, classes: 'css-class', id: 'descriptor-1' };
		const secondDescriptor = { priority: 10, classes: 'css-class', id: 'descriptor-2' };

		stack.add( descriptor );
		stack.add( secondDescriptor );
		stack.on( 'change:top', spy );
		stack.remove( secondDescriptor.id );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should sort by class when priorities are the same', () => {
		const spy = vi.fn();
		const descriptorA = { priority: 10, classes: 'css-a', id: 'descriptor-1' };
		const descriptorB = { priority: 10, classes: 'css-b', id: 'descriptor-2' };
		const descriptorC = { priority: 10, classes: 'css-c', id: 'descriptor-3' };

		stack.on( 'change:top', spy );
		stack.add( descriptorB );
		stack.add( descriptorA );
		stack.add( descriptorC );

		expect( spy ).toHaveBeenCalledTimes( 2 );
		expect( spy.mock.calls[ 0 ][ 1 ].newDescriptor ).toBe( descriptorB );
		expect( spy.mock.calls[ 0 ][ 1 ].oldDescriptor ).toBeUndefined();

		expect( spy.mock.calls[ 1 ][ 1 ].newDescriptor ).toBe( descriptorC );
		expect( spy.mock.calls[ 1 ][ 1 ].oldDescriptor ).toBe( descriptorB );
	} );

	it( 'should sort by class when priorities are the same - array of CSS classes', () => {
		const spy = vi.fn();
		const descriptorA = { priority: 10, classes: [ 'css-a', 'css-z' ], id: 'descriptor-1' };
		const descriptorB = { priority: 10, classes: [ 'css-a', 'css-y' ], id: 'descriptor-2' };
		const descriptorC = { priority: 10, classes: 'css-c', id: 'descriptor-3' };

		stack.on( 'change:top', spy );
		stack.add( descriptorB );
		stack.add( descriptorA );
		stack.add( descriptorC );

		expect( spy ).toHaveBeenCalledTimes( 3 );
		expect( spy.mock.calls[ 0 ][ 1 ].newDescriptor ).toBe( descriptorB );
		expect( spy.mock.calls[ 0 ][ 1 ].oldDescriptor ).toBeUndefined();

		expect( spy.mock.calls[ 1 ][ 1 ].newDescriptor ).toBe( descriptorA );
		expect( spy.mock.calls[ 1 ][ 1 ].oldDescriptor ).toBe( descriptorB );

		expect( spy.mock.calls[ 2 ][ 1 ].newDescriptor ).toBe( descriptorC );
		expect( spy.mock.calls[ 2 ][ 1 ].oldDescriptor ).toBe( descriptorA );
	} );
} );
