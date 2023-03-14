/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine
 */

export * from './view/placeholder';

// Controller.
export { default as EditingController } from './controller/editingcontroller';
export {
	default as DataController,
	type DataControllerInitEvent,
	type DataControllerSetEvent,
	type DataControllerToModelEvent,
	type DataControllerToViewEvent
} from './controller/datacontroller';

// Conversion.
export { default as Conversion } from './conversion/conversion';
export type {
	default as DowncastDispatcher,
	DowncastAddMarkerEvent,
	DowncastAttributeEvent,
	DowncastConversionApi,
	DowncastInsertEvent,
	DowncastRemoveEvent,
	DowncastRemoveMarkerEvent,
	DowncastSelectionEvent
} from './conversion/downcastdispatcher';
export type {
	default as UpcastDispatcher,
	UpcastConversionApi,
	UpcastConversionData,
	UpcastElementEvent,
	UpcastTextEvent
} from './conversion/upcastdispatcher';
export type {
	AddHighlightCallback,
	AttributeDescriptor,
	ElementCreatorFunction,
	HighlightDescriptor,
	RemoveHighlightCallback,
	MarkerElementCreatorFunction,
	SlotFilter
} from './conversion/downcasthelpers';
export type {
	default as Mapper,
	MapperModelToViewPositionEvent,
	MapperViewToModelPositionEvent
} from './conversion/mapper';
export type { default as ModelConsumable } from './conversion/modelconsumable';
export type { Consumables, default as ViewConsumable } from './conversion/viewconsumable';

// DataProcessor.
export type { default as DataProcessor } from './dataprocessor/dataprocessor';
export { default as HtmlDataProcessor } from './dataprocessor/htmldataprocessor';

// Model / Operation.
export type { default as Operation } from './model/operation/operation';
export { default as InsertOperation } from './model/operation/insertoperation';
export { default as MoveOperation } from './model/operation/moveoperation';
export { default as MergeOperation } from './model/operation/mergeoperation';
export { default as SplitOperation } from './model/operation/splitoperation';
export { default as MarkerOperation } from './model/operation/markeroperation';
export { default as OperationFactory } from './model/operation/operationfactory';
export type { default as AttributeOperation } from './model/operation/attributeoperation';
export type { default as RenameOperation } from './model/operation/renameoperation';
export { transformSets } from './model/operation/transform';

// Model.
export { default as DocumentSelection, type DocumentSelectionChangeRangeEvent } from './model/documentselection';
export { default as Range } from './model/range';
export { default as LiveRange, type LiveRangeChangeRangeEvent } from './model/liverange';
export { default as LivePosition } from './model/liveposition';
export { default as Model } from './model/model';
export { default as TreeWalker, type TreeWalkerValue } from './model/treewalker';
export { default as Element } from './model/element';
export { default as Position, type PositionOffset } from './model/position';
export { default as DocumentFragment } from './model/documentfragment';
export { default as History } from './model/history';
export { default as Text } from './model/text';
export { default as TextProxy } from './model/textproxy';
export type { default as Document, ModelPostFixer } from './model/document';
export type { Marker } from './model/markercollection';
export type { default as Batch } from './model/batch';
export type { default as Differ, DiffItem, DiffItemAttribute, DiffItemInsert, DiffItemRemove } from './model/differ';
export type { default as Item } from './model/item';
export type { default as Node } from './model/node';
export type { default as RootElement } from './model/rootelement';
export type {
	default as Schema,
	SchemaAttributeCheckCallback,
	SchemaChildCheckCallback,
	AttributeProperties,
	SchemaItemDefinition
} from './model/schema';
export type { default as Selection, Selectable } from './model/selection';
export type { default as TypeCheckable } from './model/typecheckable';
export type { default as Writer } from './model/writer';

export { findOptimalInsertionRange } from './model/utils/findoptimalinsertionrange';

// Model Events.
export type { DocumentChangeEvent } from './model/document';
export type { DocumentSelectionChangeEvent } from './model/documentselection';
export type {
	ModelApplyOperationEvent,
	ModelDeleteContentEvent,
	ModelGetSelectedContentEvent,
	ModelInsertContentEvent,
	ModelInsertObjectEvent,
	ModelModifySelectionEvent
} from './model/model';
export type { SelectionChangeRangeEvent } from './model/selection';

// View.
export { default as DataTransfer } from './view/datatransfer';
export { default as DomConverter } from './view/domconverter';
export { default as Renderer } from './view/renderer';
export { default as View } from './view/view';
export { default as ViewDocument } from './view/document';
export { default as ViewText } from './view/text';
export { default as ViewElement, type ElementAttributes as ViewElementAttributes } from './view/element';
export { default as ViewContainerElement } from './view/containerelement';
export { default as ViewEditableElement } from './view/editableelement';
export { default as ViewAttributeElement } from './view/attributeelement';
export { default as ViewEmptyElement } from './view/emptyelement';
export { default as ViewRawElement } from './view/rawelement';
export { default as ViewUIElement } from './view/uielement';
export { default as ViewDocumentFragment } from './view/documentfragment';
export type { default as ViewElementDefinition } from './view/elementdefinition';
export type { default as ViewDocumentSelection } from './view/documentselection';
export { default as AttributeElement } from './view/attributeelement';
export type { default as ViewItem } from './view/item';
export type { default as ViewNode } from './view/node';
export type { default as ViewPosition, PositionOffset as ViewPositionOffset } from './view/position';
export type { default as ViewRange } from './view/range';
export type { default as ViewSelection, ViewSelectionChangeEvent, Selectable as ViewSelectable } from './view/selection';
export type { default as ViewTypeCheckable } from './view/typecheckable';

export { getFillerOffset } from './view/containerelement';

// View / Observer.
export { default as Observer } from './view/observer/observer';
export { default as ClickObserver } from './view/observer/clickobserver';
export { default as DomEventObserver } from './view/observer/domeventobserver';
export { default as MouseObserver } from './view/observer/mouseobserver';
export { default as TabObserver } from './view/observer/tabobserver';

export { default as DowncastWriter } from './view/downcastwriter';
export { default as UpcastWriter } from './view/upcastwriter';
export { default as Matcher, type MatcherPattern, type MatcherObjectPattern, type Match, type MatchResult } from './view/matcher';

export { default as BubblingEventInfo } from './view/observer/bubblingeventinfo';
export { default as DomEventData } from './view/observer/domeventdata';

// View / Events.
export type { BubblingEvent } from './view/observer/bubblingemittermixin';
export type { ViewDocumentArrowKeyEvent } from './view/observer/arrowkeysobserver';
export type {
	ViewDocumentCompositionStartEvent,
	ViewDocumentCompositionUpdateEvent,
	ViewDocumentCompositionEndEvent
} from './view/observer/compositionobserver';
export type { ViewDocumentInputEvent } from './view/observer/inputobserver';
export type { ViewDocumentKeyDownEvent, ViewDocumentKeyUpEvent, KeyEventData } from './view/observer/keyobserver';
export type { ViewDocumentLayoutChangedEvent } from './view/document';
export type {
	ViewDocumentMouseDownEvent,
	ViewDocumentMouseUpEvent,
	ViewDocumentMouseOverEvent,
	ViewDocumentMouseOutEvent
} from './view/observer/mouseobserver';
export type { ViewDocumentTabEvent } from './view/observer/tabobserver';
export type { ViewDocumentClickEvent } from './view/observer/clickobserver';
export type { ViewDocumentSelectionChangeEvent } from './view/observer/selectionobserver';
export type { ViewRenderEvent } from './view/view';

// View / Styles.
export { StylesProcessor, type BoxSides } from './view/stylesmap';
export * from './view/styles/background';
export * from './view/styles/border';
export * from './view/styles/margin';
export * from './view/styles/padding';
export * from './view/styles/utils';
