/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils
 */

export { default as env } from './env';
export { default as diff, type DiffResult } from './diff';
export { default as fastDiff } from './fastdiff';
export { default as diffToChanges } from './difftochanges';

export { default as mix } from './mix';

export type { Constructor, Mixed } from './mix';

export {
	default as EmitterMixin,
	type Emitter,
	type BaseEvent,
	type CallbackOptions,
	type EmitterMixinDelegateChain,
	type GetCallback,
	type GetCallbackOptions,
	type GetEventInfo,
	type GetNameOrEventInfo
} from './emittermixin';

export { default as EventInfo } from './eventinfo';

export {
	default as ObservableMixin,
	type Observable,
	type DecoratedMethodEvent,
	type ObservableChangeEvent,
	type ObservableSetEvent
} from './observablemixin';

export { default as CKEditorError, logError, logWarning } from './ckeditorerror';

export { default as ElementReplacer } from './elementreplacer';

export { default as count } from './count';
export { default as compareArrays } from './comparearrays';
export { default as createElement } from './dom/createelement';
export { default as Config } from './config';
export { default as isIterable } from './isiterable';
export { default as DomEmitterMixin, type DomEmitter } from './dom/emittermixin';
export { default as findClosestScrollableAncestor } from './dom/findclosestscrollableancestor';
export { default as global } from './dom/global';
export { default as getAncestors } from './dom/getancestors';
export { default as getDataFromElement } from './dom/getdatafromelement';
export { default as isText } from './dom/istext';
export { default as Rect, type RectSource } from './dom/rect';
export { default as ResizeObserver } from './dom/resizeobserver';
export { default as setDataInElement } from './dom/setdatainelement';
export { default as toUnit } from './dom/tounit';
export { default as indexOf } from './dom/indexof';
export { default as insertAt } from './dom/insertat';
export { default as isComment } from './dom/iscomment';
export { default as isNode } from './dom/isnode';
export { default as isRange } from './dom/isrange';
export { default as isVisible } from './dom/isvisible';
export { getOptimalPosition, type Options as PositionOptions, type PositioningFunction } from './dom/position';
export { default as remove } from './dom/remove';
export * from './dom/scroll';

export * from './keyboard';
export * from './language';
export { default as Locale, type LocaleTranslate } from './locale';
export {
	default as Collection,
	type CollectionAddEvent,
	type CollectionChangeEvent,
	type CollectionRemoveEvent
} from './collection';
export { default as first } from './first';
export { default as FocusTracker } from './focustracker';
export { default as KeystrokeHandler } from './keystrokehandler';
export { default as toArray, type ArrayOrItem, type ReadonlyArrayOrItem } from './toarray';
export { default as toMap } from './tomap';
export { default as priorities, type PriorityString } from './priorities';
export { default as insertToPriorityArray } from './inserttopriorityarray';
export { default as spliceArray } from './splicearray';

export { default as uid } from './uid';
export * from './unicode';

export { default as version } from './version';
