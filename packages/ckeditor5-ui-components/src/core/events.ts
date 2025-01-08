/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui-components/core/events
 */

import type { BaseEvent } from 'ckeditor5/src/utils.js';
import type CKComponent from './ckcomponent.js';

type ConstructorType<T> = new ( ...args: Array<any> ) => T;

export type CKComponentConstructor = ConstructorType<CKComponent>;

export interface ComponentRegisterEvent<T_COMPONENT extends CKComponent> extends BaseEvent {

    /**
     * The name of the event.
     */
    name: 'componentRegister';

    /**
     * The component that has been registered.
     */
	args: [ data: { name: string; component: ConstructorType<T_COMPONENT> } ];
}

export class ComponentCreateEvent<T extends CKComponent> extends CustomEvent<{

    /**
     * The instance of the component that has been created.
     */
    instance: T;

    /**
     * The namespace of the component.
     */
    namespace: string;

    /**
     * The name of the component.
     */
    name: string;
}> {}
