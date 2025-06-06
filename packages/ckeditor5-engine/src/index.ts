/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine
 */

export {
	type PlaceholderableElement,
	disablePlaceholder,
	enablePlaceholder,
	hidePlaceholder,
	needsPlaceholder,
	showPlaceholder
} from './view/placeholder.js';

// Controller.
export { EditingController } from './controller/editingcontroller.js';
export {
	DataController,
	type DataControllerInitEvent,
	type DataControllerSetEvent,
	type DataControllerToModelEvent,
	type DataControllerToViewEvent
} from './controller/datacontroller.js';

// Conversion.
export { Conversion } from './conversion/conversion.js';
export type {
	DowncastDispatcher,
	DowncastAddMarkerEvent,
	DowncastAttributeEvent,
	DowncastConversionApi,
	DowncastInsertEvent,
	DowncastRemoveEvent,
	DowncastRemoveMarkerEvent,
	DowncastSelectionEvent
} from './conversion/downcastdispatcher.js';
export type {
	UpcastDispatcher,
	UpcastConversionApi,
	UpcastConversionData,
	UpcastElementEvent,
	UpcastTextEvent
} from './conversion/upcastdispatcher.js';
export type {
	AddHighlightCallback,
	AttributeDescriptor,
	ElementCreatorFunction,
	HighlightDescriptor,
	RemoveHighlightCallback,
	MarkerElementCreatorFunction,
	SlotFilter
} from './conversion/downcasthelpers.js';

export type {
	ElementCreatorFunction as UpcastElementCreatorFunction,
	AttributeCreatorFunction as UpcastAttributeCreatorFunction,
	MarkerFromElementCreatorFunction as UpcastMarkerFromElementCreatorFunction,
	MarkerFromAttributeCreatorFunction as UpcastMarkerFromAttributeCreatorFunction
} from './conversion/upcasthelpers.js';

export type {
	Mapper,
	MapperModelToViewPositionEvent,
	MapperViewToModelPositionEvent
} from './conversion/mapper.js';
export type { ModelConsumable } from './conversion/modelconsumable.js';
export type { Consumables, ViewConsumable } from './conversion/viewconsumable.js';

// DataProcessor.
export type { DataProcessor } from './dataprocessor/dataprocessor.js';
export { HtmlDataProcessor } from './dataprocessor/htmldataprocessor.js';
export { XmlDataProcessor } from './dataprocessor/xmldataprocessor.js';

// Model / Operation.
export type { Operation } from './model/operation/operation.js';
export { InsertOperation } from './model/operation/insertoperation.js';
export { MoveOperation } from './model/operation/moveoperation.js';
export { MergeOperation } from './model/operation/mergeoperation.js';
export { SplitOperation } from './model/operation/splitoperation.js';
export { MarkerOperation } from './model/operation/markeroperation.js';
export { OperationFactory } from './model/operation/operationfactory.js';
export { AttributeOperation } from './model/operation/attributeoperation.js';
export { RenameOperation } from './model/operation/renameoperation.js';
export { RootAttributeOperation } from './model/operation/rootattributeoperation.js';
export { RootOperation } from './model/operation/rootoperation.js';
export { NoOperation } from './model/operation/nooperation.js';
export { transformSets } from './model/operation/transform.js';

// Model.
export {
	DocumentSelection,
	type DocumentSelectionChangeRangeEvent,
	type DocumentSelectionChangeMarkerEvent,
	type DocumentSelectionChangeAttributeEvent
} from './model/documentselection.js';
export { Range } from './model/range.js';
export { LiveRange, type LiveRangeChangeRangeEvent } from './model/liverange.js';
export { LivePosition } from './model/liveposition.js';
export { Model } from './model/model.js';
export { TreeWalker, type TreeWalkerValue } from './model/treewalker.js';
export { Element } from './model/element.js';
export { Position, type PositionOffset } from './model/position.js';
export { DocumentFragment } from './model/documentfragment.js';
export { History } from './model/history.js';
export { Text } from './model/text.js';
export { TextProxy } from './model/textproxy.js';
export { Document, ModelPostFixer } from './model/document.js';
export { Marker } from './model/markercollection.js';
export { Batch } from './model/batch.js';
export { Differ, type DiffItem, type DiffItemAttribute, type DiffItemInsert, type DiffItemRemove } from './model/differ.js';
export type { Item } from './model/item.js';
export { Node, type NodeAttributes } from './model/node.js';
export { RootElement } from './model/rootelement.js';
export {
	SchemaContext,
	type Schema,
	type SchemaAttributeCheckCallback,
	type SchemaChildCheckCallback,
	type AttributeProperties,
	type SchemaItemDefinition,
	type SchemaCompiledItemDefinition,
	type SchemaContextDefinition
} from './model/schema.js';
export { Selection, type Selectable } from './model/selection.js';
export { TypeCheckable } from './model/typecheckable.js';
export { Writer } from './model/writer.js';

// Model utils.
export {
	autoParagraphEmptyRoots,
	isParagraphable,
	wrapInParagraph
} from './model/utils/autoparagraphing.js';

// Model Events.
export type { DocumentChangeEvent } from './model/document.js';
export type { DocumentSelectionChangeEvent } from './model/documentselection.js';
export type {
	ModelApplyOperationEvent,
	ModelDeleteContentEvent,
	ModelGetSelectedContentEvent,
	ModelInsertContentEvent,
	ModelInsertObjectEvent,
	ModelModifySelectionEvent,
	ModelCanEditAtEvent
} from './model/model.js';
export type { SelectionChangeRangeEvent } from './model/selection.js';

// View.
export { DataTransfer } from './view/datatransfer.js';
export { DomConverter } from './view/domconverter.js';
export { Renderer } from './view/renderer.js';
export { EditingView } from './view/view.js';
export { ViewDocument } from './view/document.js';
export { ViewText } from './view/text.js';
export { ViewElement, type ElementAttributes as ViewElementAttributes } from './view/element.js';
export { ViewContainerElement } from './view/containerelement.js';
export { ViewEditableElement } from './view/editableelement.js';
export { ViewRootEditableElement } from './view/rooteditableelement.js';
export { ViewAttributeElement } from './view/attributeelement.js';
export { ViewEmptyElement } from './view/emptyelement.js';
export { ViewRawElement } from './view/rawelement.js';
export { ViewUIElement } from './view/uielement.js';
export { ViewDocumentFragment } from './view/documentfragment.js';
export { ViewTreeWalker, type TreeWalkerValue as ViewTreeWalkerValue } from './view/treewalker.js';
export type { ViewElementDefinition, ElementObjectDefinition } from './view/elementdefinition.js';
export { ViewDocumentSelection } from './view/documentselection.js';
export { AttributeElement } from './view/attributeelement.js';
export type { ViewItem } from './view/item.js';
export { ViewNode } from './view/node.js';
export { ViewPosition, type PositionOffset as ViewPositionOffset } from './view/position.js';
export { ViewRange } from './view/range.js';
export { ViewSelection, type ViewSelectionChangeEvent, type Selectable as ViewSelectable } from './view/selection.js';
export type { ViewTypeCheckable } from './view/typecheckable.js';

export { getFillerOffset } from './view/containerelement.js';

// View / Observer.
export { Observer } from './view/observer/observer.js';
export { ClickObserver } from './view/observer/clickobserver.js';
export { DomEventObserver } from './view/observer/domeventobserver.js';
export { MouseObserver } from './view/observer/mouseobserver.js';
export { TabObserver } from './view/observer/tabobserver.js';
export { TouchObserver } from './view/observer/touchobserver.js';

export {
	FocusObserver,
	type ViewDocumentBlurEvent,
	type ViewDocumentFocusEvent
} from './view/observer/focusobserver.js';

export { DowncastWriter } from './view/downcastwriter.js';
export { UpcastWriter } from './view/upcastwriter.js';
export { Matcher, type MatcherPattern, type MatcherObjectPattern, type Match, type MatchResult } from './view/matcher.js';

export { BubblingEventInfo } from './view/observer/bubblingeventinfo.js';
export { DomEventData } from './view/observer/domeventdata.js';

// View / Events.
export type { BubblingEvent } from './view/observer/bubblingemittermixin.js';
export type { ViewDocumentArrowKeyEvent } from './view/observer/arrowkeysobserver.js';
export type {
	ViewDocumentCompositionStartEvent,
	ViewDocumentCompositionUpdateEvent,
	ViewDocumentCompositionEndEvent
} from './view/observer/compositionobserver.js';
export type { ViewDocumentInputEvent } from './view/observer/inputobserver.js';
export type { ViewDocumentMutationsEvent, MutationData } from './view/observer/mutationobserver.js';
export type { ViewDocumentKeyDownEvent, ViewDocumentKeyUpEvent, KeyEventData } from './view/observer/keyobserver.js';
export type { ViewDocumentLayoutChangedEvent } from './view/document.js';
export type {
	ViewDocumentMouseDownEvent,
	ViewDocumentMouseUpEvent,
	ViewDocumentMouseOverEvent,
	ViewDocumentMouseOutEvent
} from './view/observer/mouseobserver.js';
export type {
	ViewDocumentTouchEndEvent,
	ViewDocumentTouchMoveEvent,
	ViewDocumentTouchStartEvent
} from './view/observer/touchobserver.js';
export type { ViewDocumentTabEvent } from './view/observer/tabobserver.js';
export type { ViewDocumentClickEvent } from './view/observer/clickobserver.js';
export type { ViewDocumentSelectionChangeEvent } from './view/observer/selectionobserver.js';
export type { ViewRenderEvent, ViewScrollToTheSelectionEvent } from './view/view.js';

// View / Styles.
export { StylesMap, StylesProcessor, type BoxSides } from './view/stylesmap.js';
export { addBackgroundRules } from './view/styles/background.js';
export { addBorderRules } from './view/styles/border.js';
export { addMarginRules } from './view/styles/margin.js';
export { addPaddingRules } from './view/styles/padding.js';
export {
	isColor,
	isLineStyle,
	isLength,
	isPercentage,
	isRepeat,
	isPosition,
	isAttachment,
	isURL,
	getBoxSidesValues,
	getBoxSidesValueReducer,
	getBoxSidesShorthandValue,
	getPositionShorthandNormalizer,
	getShorthandValues
} from './view/styles/utils.js';

// Development / testing utils.
export {
	getData as _getModelData,
	setData as _setModelData,
	parse as _parseModel,
	stringify as _stringifyModel
} from './dev-utils/model.js';

export {
	getData as _getViewData,
	setData as _setViewData,
	parse as _parseView,
	stringify as _stringifyView
} from './dev-utils/view.js';

export {
	insertText as _downcastInsertText,
	insertAttributesAndChildren as _downcastInsertAttributesAndChildren,
	remove as _downcastRemove,
	createViewElementFromHighlightDescriptor as _downcastCreateViewElementFromHighlightDescriptor,
	convertRangeSelection as _downcastConvertRangeSelection,
	convertCollapsedSelection as _downcastConvertCollapsedSelection,
	cleanSelection as _downcastCleanSelection,
	wrap as _downcastWrap,
	insertElement as _downcastInsertElement,
	insertStructure as _downcastInsertStructure,
	insertUIElement as _downcastInsertUIElement,
	ConsumerFunction as _DowncastConsumerFunction
} from './conversion/downcasthelpers.js';

// Internals
export { MapperCache as _MapperCache } from './conversion/mapper.js';
export {
	convertToModelFragment as _upcastConvertToModelFragment,
	convertText as _upcastConvertText,
	convertSelectionChange as _upcastConvertSelectionChange
} from './conversion/upcasthelpers.js';

export {
	ViewElementConsumables as _ViewElementConversionConsumables,
	normalizeConsumables as _normalizeConversionConsumables
} from './conversion/viewconsumable.js';

export { BasicHtmlWriter as _DataProcessorBasicHtmlWriter } from './dataprocessor/basichtmlwriter.js';
export { OperationReplayer as _OperationReplayer } from './dev-utils/operationreplayer.js';
export {
	convertMapToTags as _convertMapToTags,
	convertMapToStringifiedObject as _convertMapToStringifiedObject,
	dumpTrees as _dumpTrees,
	initDocumentDumping as _initDocumentDumping,
	logDocument as _logDocument
} from './dev-utils/utils.js';

export type { DifferSnapshot as _DifferSnapshot } from './model/differ.js';
export type {
	BeforeChangesEvent as _ModelBeforeChangesEvent,
	AfterChangesEvent as _ModelAfterChangesEvent
} from './model/model.js';

export { DetachOperation as _DetachOperation } from './model/operation/detachoperation.js';
export {
	transform as _operationTransform,
	type TransformationContext as _OperationTransformationContext
} from './model/operation/transform.js';

export {
	_insert as _operationInsert,
	_remove as _operationRemove,
	_move as _operationMove,
	_setAttribute as _operationSetAttribute,
	_normalizeNodes as _operationNormalizeNodes
} from './model/operation/utils.js';

export {
	getTextNodeAtPosition as _getModelTextNodeAtPosition,
	getNodeAfterPosition as _getModelNodeAfterPosition,
	getNodeBeforePosition as _getModelNodeBeforePosition
} from './model/position.js';

export {
	autoParagraphEmptyRoots as _autoParagraphEmptyModelRoots,
	isParagraphable as _isParagraphableModelNode,
	wrapInParagraph as _wrapInParagraphModelNode
} from './model/utils/autoparagraphing.js';

export { deleteContent as _deleteModelContent } from './model/utils/deletecontent.js';
export { getSelectedContent as _getSelectedModelContent } from './model/utils/getselectedcontent.js';
export { insertContent as _insertModelContent } from './model/utils/insertcontent.js';
export { insertObject as _insertModelObject } from './model/utils/insertobject.js';
export { modifySelection as _modifyModelSelection } from './model/utils/modifyselection.js';

export {
	injectSelectionPostFixer as _injectModelSelectionPostFixer,
	tryFixingRange as _tryFixingModelRange,
	mergeIntersectingRanges as _mergeIntersectingModelRanges
} from './model/utils/selection-post-fixer.js';

export {
	NBSP_FILLER as _VIEW_NBSP_FILLER,
	MARKED_NBSP_FILLER as _VIEW_MARKED_NBSP_FILLER,
	BR_FILLER as _VIEW_BR_FILLER,
	INLINE_FILLER_LENGTH as _VIEW_INLINE_FILLER_LENGTH,
	INLINE_FILLER as _VIEW_INLINE_FILLER,
	startsWithFiller as _startsWithViewFiller,
	isInlineFiller as _isInlineViewFiller,
	getDataWithoutFiller as _getDataWithoutViewFiller,
	injectQuirksHandling as _injectViewQuirksHandling
} from './view/filler.js';

export {
	isPatternMatched as _isViewPatternMatched,
	type NormalizedPropertyPattern as _ViewNormalizedPropertyPattern
} from './view/matcher.js';

export { injectUiElementHandling as _injectUiViewElementHandling } from './view/uielement.js';
