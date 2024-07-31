/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils
 */

export { default as env } from './env.js';
export { default as diff, type DiffResult } from './diff.js';
export { default as fastDiff } from './fastdiff.js';
export { default as diffToChanges } from './difftochanges.js';

export { default as mix } from './mix.js';

export type { Constructor, Mixed } from './mix.js';

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
} from './emittermixin.js';

export { default as EventInfo } from './eventinfo.js';

export {
	default as ObservableMixin,
	type Observable,
	type DecoratedMethodEvent,
	type ObservableChangeEvent,
	type ObservableSetEvent
} from './observablemixin.js';

export { default as CKEditorError, logError, logWarning } from './ckeditorerror.js';

export { default as ElementReplacer } from './elementreplacer.js';

export { default as abortableDebounce, type AbortableFunc } from './abortabledebounce.js';
export { default as count } from './count.js';
export { default as compareArrays } from './comparearrays.js';
export { default as createElement } from './dom/createelement.js';
export { default as Config } from './config.js';
export { default as isIterable } from './isiterable.js';
export { default as DomEmitterMixin, type DomEmitter } from './dom/emittermixin.js';
export { default as findClosestScrollableAncestor } from './dom/findclosestscrollableancestor.js';
export { default as global } from './dom/global.js';
export { default as getAncestors } from './dom/getancestors.js';
export { default as getDataFromElement } from './dom/getdatafromelement.js';
export { default as getBorderWidths } from './dom/getborderwidths.js';
export { default as isText } from './dom/istext.js';
export { default as Rect, type RectSource } from './dom/rect.js';
export { default as ResizeObserver } from './dom/resizeobserver.js';
export { default as setDataInElement } from './dom/setdatainelement.js';
export { default as toUnit } from './dom/tounit.js';
export { default as indexOf } from './dom/indexof.js';
export { default as insertAt } from './dom/insertat.js';
export { default as isComment } from './dom/iscomment.js';
export { default as isNode } from './dom/isnode.js';
export { default as isRange } from './dom/isrange.js';
export { default as isValidAttributeName } from './dom/isvalidattributename.js';
export { default as isVisible } from './dom/isvisible.js';
export { getOptimalPosition, type Options as PositionOptions, type PositioningFunction, type DomPoint } from './dom/position.js';
export { default as remove } from './dom/remove.js';
export * from './dom/scroll.js';

export * from './keyboard.js';
export * from './language.js';
export { default as Locale, type LocaleTranslate, type Translations } from './locale.js';
export {
	default as Collection,
	type CollectionAddEvent,
	type CollectionChangeEvent,
	type CollectionRemoveEvent
} from './collection.js';
export { default as first } from './first.js';
export { default as FocusTracker } from './focustracker.js';
export { default as KeystrokeHandler, type KeystrokeHandlerOptions } from './keystrokehandler.js';
export { default as toArray, type ArrayOrItem, type ReadonlyArrayOrItem } from './toarray.js';
export { default as toMap } from './tomap.js';
export { default as priorities, type PriorityString } from './priorities.js';
export { default as retry, exponentialDelay } from './retry.js';
export { default as insertToPriorityArray } from './inserttopriorityarray.js';
export { default as spliceArray } from './splicearray.js';

export { default as uid } from './uid.js';
export { default as delay, type DelayedFunc } from './delay.js';
export { default as verifyLicense } from './verifylicense.js';
export { default as wait } from './wait.js';

export * from './unicode.js';

export { default as version, releaseDate } from './version.js';
