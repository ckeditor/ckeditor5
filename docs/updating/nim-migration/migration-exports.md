---
# Scope:
# Support migration from CKEditor 4 to CKEditor&nbsp;5.

category: nim-migration
order: 70
modified_at: 2025-06-23
meta-title: Migrating exports | CKEditor 5 Documentation
meta-description: Learn how the migrate from CKEditor 4 to the latest CKEditor 5 version without problems.
---

# Migrating exports

As part of the transition to the New Installation Methods (NIM), we have standardized how public API elements are exposed in CKEditor&nbsp;5 and related packages. We introduced a unified export policy that ensures every public entity is exported via the package’s `index.ts` file. We also gave the exported classes, functions, and helpers more descriptive and context-appropriate names ensuring they are unambiguous and unique within the scope of CKEditor&nbsp;5. This includes renaming existing exports where needed. The changes are semantically equivalent but introduce breaking changes in naming.

## Internal exports

We have also standardized the way internal exports are handled. All internal exports are now prefixed with an underscore (`_`) to clearly distinguish them from public API elements. This helps maintain a clean separation between the public API and internal implementation details.

#### Example

Suppose you previously imported an internal utility like this:

```ts
import { getCsrfToken } from '@ckeditor/ckeditor5-adapter-ckfinder/src/utils';
```

After migration, you should use the new, unified export from the package root, with the underscore prefix:

```ts
import { _getCKFinderCsrfToken } from '@ckeditor/ckeditor5-adapter-ckfinder';
```

## Changed exports

Below, you will find all name changes in packages listed alphabetically for convenience.

<info-box info>
	The tables below list only the exports that have changed names and may introduce breaking changes. Newly exported methods that did not exist before are **not** included here.
</info-box>

### @ckeditor/ckeditor5-adapter-ckfinder

| file      | original name     | re-exported name         |
|-----------|-------------------|---------------------------|
| utils.ts  | getCsrfToken      | _getCKFinderCsrfToken     |
| utils.ts  | getCookie         | _getCKFinderCookie        |
| utils.ts  | setCookie         | _setCKFinderCookie        |

### @ckeditor/ckeditor5-ai

| file                         | original name           | re-exported name            |
|------------------------------|-------------------------|-----------------------------|
| adapters/openaitextadapter.ts | RequestMessageItem      | AIRequestMessageItem        |
| adapters/aitextadapter.ts     | RequestHeaders          | AIRequestHeaders            |
| adapters/aitextadapter.ts     | RequestParameters       | AIRequestParameters         |
| adapters/awstextadapter.ts    | AWSTextAdapterConfig    | AIAWSTextAdapterConfig      |
| adapters/awstextadapter.ts    | AWSModelFamily          | AIAWSModelFamily            |
| aiasistant.ts                 | getDefaultCommands      | getDefaultAICommands        |
| aiasistant.ts                 | GroupDefinition         | AIGroupDefinition           |
| aiasistant.ts                 | CommandDefinition       | AICommandDefinition         |
| aiconfig.ts                   | AIConfig                | AIConfig                    |
| ui/showaiassistantcommand.ts | ShowAIAssistantCommand  | ShowAIAssistantCommand      |

### @ckeditor/ckeditor5-alignment

| file            | original name              | re-exported name                |
|------------------|----------------------------|---------------------------------|
| alignmentconfig.ts | SupportedOption         | AlignmentSupportedOption        |
| utils.ts          | supportedOptions         | _ALIGNMENT_SUPPORTED_OPTIONS    |
| utils.ts          | isSupported              | _isAlignmentSupported           |
| utils.ts          | isDefault                | _isDefaultAlignment             |
| utils.ts          | normalizeAlignmentOptions | _normalizeAlignmentOptions      |

### @ckeditor/ckeditor5-autoformat

| file                     | original name   | re-exported name           |
|--------------------------|-----------------|----------------------------|
| inlineautoformatediting.ts | TestCallback   | AutoformatTestCallback     |

### @ckeditor/ckeditor5-basic-styles

| file      | original name      | re-exported name               |
|-----------|--------------------|--------------------------------|
| utils.ts  | getButtonCreator   | _getBasicStylesButtonCreator   |

### @ckeditor/ckeditor5-bookmark

| file      | original name     | re-exported name           |
|-----------|-------------------|----------------------------|
| utils.ts  | isBookmarkIdValid | _isBookmarkIdValid         |

### @ckeditor/ckeditor5-case-change

| file              | original name            | re-exported name                    |
|-------------------|--------------------------|-------------------------------------|
| casechangecommand.ts | TransformCallback     | CaseChangeTransformCallback         |
| casechange.ts        | ExcludeWordsCallback  | CaseChangeExcludeWordsCallback      |
| casechange.ts        | ExcludeWordsCallbackContext | CaseChangeExcludeWordsCallbackContext |

### @ckeditor/ckeditor5-ckbox

| file                         | original name                               | re-exported name                        |
|-----------------------------|---------------------------------------------|-----------------------------------------|
| ckboxcommand.ts             | prepareImageAssetAttributes                 | _prepareCKBoxImageAssetAttributes       |
| ckboxconfig.ts              | CKBoxAssetDefinition                        | _CKBoxAssetDefinition                   |
| ckboxconfig.ts              | CKBoxAssetImageDefinition                   | _CKBoxAssetImageDefinition              |
| ckboxconfig.ts              | CKBoxAssetLinkDefinition                    | _CKBoxAssetLinkDefinition               |
| ckboxconfig.ts              | CKBoxAssetImageAttributesDefinition         | _CKBoxAssetImageAttributesDefinition    |
| ckboxconfig.ts              | CKBoxAssetLinkAttributesDefinition          | _CKBoxAssetLinkAttributesDefinition     |
| ckboximageedit/utils.ts     | createEditabilityChecker                    | _createCKBoxEditabilityChecker          |
| utils.ts                    | getImageUrls                                | _getCKBoxImageUrls                      |
| utils.ts                    | getWorkspaceId                              | _getCKBoxWorkspaceId                    |
| utils.ts                    | blurHashToDataUrl                           | _ckboxBlurHashToDataUrl                 |
| utils.ts                    | sendHttpRequest                             | _sendCKBoxHttpRequest                   |
| utils.ts                    | convertMimeTypeToExtension                  | _ckBoxConvertMimeTypeToExtension        |
| utils.ts                    | getContentTypeOfUrl                         | _getCKBoxContentTypeOfUrl               |
| utils.ts                    | getFileExtension                            | _getCKBoxFileExtension                  |

### @ckeditor/ckeditor5-clipboard

| file                         | original name                    | re-exported name             |
|-----------------------------|----------------------------------|------------------------------|
| clipboardmarkersutils.ts    | ClipboardMarkersUtils            | _ClipboardMarkersUtils       |
| clipboardmarkersutils.ts    | ClipboardMarkerRestrictedAction  | _ClipboardMarkerRestrictedAction |
| clipboardmarkersutils.ts    | ClipboardMarkerConfiguration     | _ClipboardMarkerConfiguration |
| dragdrop.ts                 | DragDrop                         | _DragDrop                    |
| dragdropblocktoolbar.ts     | DragDropBlockToolbar             | _DragDropBlockToolbar        |
| dragdroptarget.ts           | DragDropTarget                   | _DragDropTarget              |
| lineview.ts                 | LineView                         | _ClipboardLineView           |
| utils/normalizeclipboarddata.ts | normalizeClipboardData       | _normalizeClipboardData      |

### @ckeditor/ckeditor5-cloud-services

| file                         | original name                    | re-exported name                      |
|-----------------------------|----------------------------------|---------------------------------------|
| token/token.ts              | TokenOptions                     | CloudServicesTokenOptions             |
| uploadgateway/fileuploader.ts | FileUploaderErrorEvent         | CloudServicesFileUploaderErrorEvent   |
| uploadgateway/fileuploader.ts | FileUploaderProgressErrorEvent | CloudServicesFileUploaderProgressErrorEvent |

### @ckeditor/ckeditor5-code-block

| file         | original name                          | re-exported name                                |
|--------------|----------------------------------------|-------------------------------------------------|
| converters.ts| modelToViewCodeBlockInsertion          | _modelToViewCodeBlockInsertion                  |
| converters.ts| modelToDataViewSoftBreakInsertion      | _modelToDataViewCodeBlockSoftBreakInsertion     |
| converters.ts| dataViewToModelCodeBlockInsertion      | _dataViewToModelCodeBlockInsertion              |
| converters.ts| dataViewToModelTextNewlinesInsertion   | _dataViewToModelCodeBlockTextNewlinesInsertion  |
| converters.ts| dataViewToModelOrphanNodeConsumer      | _dataViewToModelCodeBlockOrphanNodeConsumer     |
| utils.ts     | getNormalizedAndLocalizedLanguageDefinitions | _getNormalizedAndLocalizedCodeBlockLanguageDefinitions |
| utils.ts     | getPropertyAssociation                 | _getCodeBlockPropertyAssociation                |
| utils.ts     | getLeadingWhiteSpaces                  | _getCodeBlockLeadingWhiteSpaces                 |
| utils.ts     | rawSnippetTextToViewDocumentFragment   | _rawCodeBlockSnippetTextToViewDocumentFragment  |
| utils.ts     | getIndentOutdentPositions              | _getCodeBlockIndentOutdentPositions             |
| utils.ts     | isModelSelectionInCodeBlock            | _isModelSelectionInCodeBlock                    |
| utils.ts     | canBeCodeBlock                         | _canBeCodeBlock                                 |
| utils.ts     | getCodeBlockAriaAnnouncement           | _getCodeBlockAriaAnnouncement                   |
| utils.ts     | getTextNodeAtLineStart                 | _getCodeBlockTextNodeAtLineStart                |

### @ckeditor/ckeditor5-collaboration-core

| file     | original name     | re-exported name           |
|----------|-------------------|----------------------------|
| users.ts | Color             | CollaborationUserColor     |
| users.ts | UserData          | CollaborationUserData      |
| config.ts| UsersConfig       | CollaborationUsersConfig   |

### @ckeditor/ckeditor5-comments

| file                              | original name              | re-exported name               |
|-----------------------------------|----------------------------|--------------------------------|
| annotation.ts                     | Target                     | AnnotationTargetBase           |
| sidebaritemview.ts                | SidebarItemView            | AnnotationsSidebarItemView     |
| sidebarview.ts                    | SidebarView                | AnnotationsSidebarView         |
| basecommentthreadview.ts         | UISubmitCommentThreadEvent | UISubmitCommentThreadEvent     |
| basecommentthreadview.ts         | UIRemoveCommentThreadEvent | UIRemoveCommentThreadEvent     |
| basecommentthreadview.ts         | UIResolveCommentThreadEvent| UIResolveCommentThreadEvent    |
| basecommentview.ts               | UIAddCommentEvent          | UIAddCommentEvent              |
| basecommentview.ts               | UIUpdateCommentEvent       | UIUpdateCommentEvent           |
| basecommentview.ts               | UIRemoveCommentEvent       | UIRemoveCommentEvent           |
| config.ts                         | SidebarConfig              | AnnotationsSidebarConfig       |

### @ckeditor/ckeditor5-core

| file                          | original name          | re-exported name                  |
|-------------------------------|------------------------|-----------------------------------|
| accessibility.ts              | DEFAULT_GROUP_ID       | _DEFAULT_ACCESSIBILITY_GROUP_ID   |
| accessibility.ts              | KeystrokeInfos         | KeystrokeInfoDefinitions          |
| accessibility.ts              | KeystrokeInfoCategory  | KeystrokeInfoCategoryDefinition   |
| accessibility.ts              | KeystrokeInfoGroup     | KeystrokeInfoGroupDefinition      |
| editorusagedata.ts            | getEditorUsageData     | _getEditorUsageData               |
| editorusagedata.ts            | EditorUsageData        | _EditorUsageData                  |

### @ckeditor/ckeditor5-emoji

| file                 | original name   | re-exported name      |
|----------------------|-----------------|------------------------|
| emojiconfig.ts        | SkinToneId      | EmojiSkinToneId        |
| emojirepository.ts    | SkinTone        | EmojiSkinTone          |
| isemojisupported.ts   | isEmojiSupported| _isEmojiSupported      |

### @ckeditor/ckeditor5-engine

| file                     | originalName                          | reExportedName                          |
|--------------------------|-------------------------------------|---------------------------------------|
| conversion/downcastdispatcher.ts | EventMap                        | DowncastDispatcherEventMap             |
| conversion/downcastdispatcher.ts | DiffItemReinsert                | DifferItemReinsert                     |
| conversion/downcasthelpers.ts    | insertText                     | _downcastInsertText                    |
| conversion/downcasthelpers.ts    | insertAttributesAndChildren    | _downcastInsertAttributesAndChildren  |
| conversion/downcasthelpers.ts    | remove                        | _downcastRemove                        |
| conversion/downcasthelpers.ts    | createViewElementFromHighlightDescriptor | _downcastCreateViewElementFromDowncastHighlightDescriptor |
| conversion/downcasthelpers.ts    | convertRangeSelection          | _downcastConvertRangeSelection         |
| conversion/downcasthelpers.ts    | convertCollapsedSelection      | _downcastConvertCollapsedSelection     |
| conversion/downcasthelpers.ts    | cleanSelection                | _downcastCleanSelection                |
| conversion/downcasthelpers.ts    | wrap                         | _downcastWrap                         |
| conversion/downcasthelpers.ts    | insertElement                | _downcastInsertElement                |
| conversion/downcasthelpers.ts    | insertStructure              | _downcastInsertStructure              |
| conversion/downcasthelpers.ts    | insertUIElement              | _downcastInsertUIElement              |
| conversion/downcasthelpers.ts    | HighlightDescriptor          | DowncastHighlightDescriptor           |
| conversion/downcasthelpers.ts    | SlotFilter                   | DowncastSlotFilter                    |
| conversion/downcasthelpers.ts    | ElementCreatorFunction       | DowncastElementCreatorFunction        |
| conversion/downcasthelpers.ts    | StructureCreatorFunction     | DowncastStructureCreatorFunction      |
| conversion/downcasthelpers.ts    | AttributeElementCreatorFunction | DowncastAttributeElementCreatorFunction |
| conversion/downcasthelpers.ts    | AttributeCreatorFunction     | DowncastAttributeCreatorFunction       |
| conversion/downcasthelpers.ts    | AttributeDescriptor          | DowncastAttributeDescriptor           |
| conversion/downcasthelpers.ts    | MarkerElementCreatorFunction | DowncastMarkerElementCreatorFunction  |
| conversion/downcasthelpers.ts    | HighlightDescriptorCreatorFunction | DowncastHighlightDescriptorCreatorFunction |
| conversion/downcasthelpers.ts    | AddHighlightCallback         | DowncastAddHighlightCallback           |
| conversion/downcasthelpers.ts    | RemoveHighlightCallback      | DowncastRemoveHighlightCallback        |
| conversion/downcasthelpers.ts    | MarkerDataCreatorFunction    | DowncastMarkerDataCreatorFunction      |
| conversion/downcasthelpers.ts    | ConsumerFunction             | _DowncastConsumerFunction              |
| conversion/mapper.ts            | MapperCache                  | _MapperCache                         |
| conversion/upcasthelpers.ts      | convertToModelFragment        | _upcastConvertToModelFragment          |
| conversion/upcasthelpers.ts      | convertText                  | _upcastConvertText                    |
| conversion/upcasthelpers.ts      | convertSelectionChange       | _upcastConvertSelectionChange         |
| conversion/upcasthelpers.ts      | ElementCreatorFunction       | UpcastElementCreatorFunction           |
| conversion/upcasthelpers.ts      | AttributeCreatorFunction     | UpcastAttributeCreatorFunction         |
| conversion/upcasthelpers.ts      | MarkerFromElementCreatorFunction | UpcastMarkerFromElementCreatorFunction |
| conversion/upcasthelpers.ts      | MarkerFromAttributeCreatorFunction | UpcastMarkerFromAttributeCreatorFunction |
| conversion/viewconsumable.ts     | ViewElementConsumables       | _ViewElementConversionConsumables      |
| conversion/viewconsumable.ts     | normalizeConsumables         | _normalizeConversionConsumables        |
| dataprocessor/basichtmlwriter.ts| BasicHtmlWriter              | _DataProcessorBasicHtmlWriter           |
| dataprocessor/htmlwriter.ts      | HtmlWriter                  | DataProcessorHtmlWriter                |
| dev-utils/model.ts               | getData                     | _getModelData                        |
| dev-utils/model.ts               | setData                     | _setModelData                        |
| dev-utils/model.ts               | stringify                   | _stringifyModel                      |
| dev-utils/model.ts               | parse                       | _parseModel                         |
| dev-utils/operationreplayer.ts  | OperationReplayer           | _OperationReplayer                  |
| dev-utils/utils.ts              | convertMapToTags            | _convertMapToTags                   |
| dev-utils/utils.ts              | convertMapToStringifiedObject | _convertMapToStringifiedObject       |
| dev-utils/utils.ts              | dumpTrees                  | _dumpTrees                        |
| dev-utils/utils.ts              | initDocumentDumping         | _initDocumentDumping                |
| dev-utils/utils.ts              | logDocument                 | _logDocument                      |
| dev-utils/view.ts              | getData                     | _getViewData                      |
| dev-utils/view.ts              | setData                     | _setViewData                      |
| dev-utils/view.ts              | stringify                   | _stringifyView                    |
| dev-utils/view.ts              | parse                       | _parseView                       |
| model/differ.ts                | DifferSnapshot              | _DifferSnapshot                  |
| model/differ.ts                | DiffItem                    | DifferItem                      |
| model/differ.ts                | DiffItemInsert              | DifferItemInsert                |
| model/differ.ts                | DiffItemRemove              | DifferItemRemove                |
| model/differ.ts                | DiffItemAttribute           | DifferItemAttribute             |
| model/differ.ts                | DiffItemRoot                | DifferItemRoot                  |
| model/document.ts             | Document                    | ModelDocument                  |
| model/document.ts             | DocumentChangeEvent         | ModelDocumentChangeEvent       |
| model/documentfragment.ts     | DocumentFragment            | ModelDocumentFragment          |
| model/documentselection.ts    | DocumentSelection           | ModelDocumentSelection         |
| model/documentselection.ts    | DocumentSelectionChangeRangeEvent | ModelDocumentSelectionChangeRangeEvent |
| model/documentselection.ts    | DocumentSelectionChangeAttributeEvent | ModelDocumentSelectionChangeAttributeEvent |
| model/documentselection.ts    | DocumentSelectionChangeMarkerEvent | ModelDocumentSelectionChangeMarkerEvent |
| model/documentselection.ts    | DocumentSelectionChangeEvent | ModelDocumentSelectionChangeEvent  |
| model/element.ts              | Element                     | ModelElement                   |
| model/item.ts                 | Item                        | ModelItem                      |
| model/liveposition.ts         | LivePosition                | ModelLivePosition              |
| model/liveposition.ts         | LivePositionChangeEvent     | ModelLivePositionChangeEvent   |
| model/liverange.ts            | LiveRange                   | ModelLiveRange                 |
| model/liverange.ts            | LiveRangeChangeRangeEvent   | ModelLiveRangeChangeRangeEvent |
| model/liverange.ts            | LiveRangeChangeContentEvent | ModelLiveRangeChangeContentEvent |
| model/liverange.ts            | LiveRangeChangeEvent        | ModelLiveRangeChangeEvent      |
| model/model.ts                | BeforeChangesEvent          | _ModelBeforeChangesEvent       |
| model/model.ts                | AfterChangesEvent           | _ModelAfterChangesEvent        |
| model/node.ts                 | Node                        | ModelNode                     |
| model/node.ts                 | NodeAttributes              | ModelNodeAttributes           |
| model/nodelist.ts             | NodeList                    | ModelNodeList                 |
| model/operation/detachoperation.ts | DetachOperation             | _DetachOperation               |
| model/operation/transform.ts  | transform                   | _operationTransform           |
| model/operation/transform.ts  | transformSets               | transformOperationSets         |
| model/operation/transform.ts  | TransformSetsResult         | TransformOperationSetsResult   |
| model/operation/transform.ts  | TransformationContext       | _OperationTransformationContext |
| model/operation/utils.ts      | _insert                    | _insertIntoModelNodeList        |
| model/operation/utils.ts      | _remove                    | _removeFromModelNodeList        |
| model/operation/utils.ts      | _move                      | _moveInModelNodeList            |
| model/operation/utils.ts      | _setAttribute              | _setAttributeInModelNodeList    |
| model/operation/utils.ts      | _normalizeNodes            | _normalizeInModelNodeList       |
| model/operation/utils.ts      | NodeSet                    | ModelNodeSet                  |
| model/position.ts            | Position                   | ModelPosition                 |
| model/position.ts            | PositionRelation           | ModelPositionRelation         |
| model/position.ts            | PositionOffset             | ModelPositionOffset           |
| model/position.ts            | PositionStickiness         | ModelPositionStickiness       |
| model/position.ts            | getTextNodeAtPosition      | _getModelTextNodeAtPosition   |
| model/position.ts            | getNodeAfterPosition       | _getModelNodeAfterPosition    |
| model/position.ts            | getNodeBeforePosition      | _getModelNodeBeforePosition   |
| model/range.ts               | Range                      | ModelRange                   |
| model/rootelement.ts         | RootElement                | ModelRootElement             |
| model/schema.ts              | Schema                     | ModelSchema                  |
| model/schema.ts              | SchemaCheckChildEvent      | ModelSchemaCheckChildEvent    |
| model/schema.ts              | SchemaCheckAttributeEvent  | ModelSchemaCheckAttributeEvent |
| model/schema.ts              | SchemaItemDefinition       | ModelSchemaItemDefinition     |
| model/schema.ts              | SchemaCompiledItemDefinition | ModelSchemaCompiledItemDefinition |
| model/schema.ts              | SchemaContext              | ModelSchemaContext           |
| model/schema.ts              | SchemaContextDefinition    | ModelSchemaContextDefinition  |
| model/schema.ts              | SchemaContextItem          | ModelSchemaContextItem        |
| model/schema.ts              | AttributeProperties        | ModelAttributeProperties      |
| model/schema.ts              | SchemaAttributeCheckCallback | ModelSchemaAttributeCheckCallback |
| model/schema.ts              | SchemaChildCheckCallback   | ModelSchemaChildCheckCallback  |
| model/selection.ts           | Selection                  | ModelSelection               |
| model/selection.ts           | SelectionChangeEvent       | ModelSelectionChangeEvent     |
| model/selection.ts           | SelectionChangeRangeEvent  | ModelSelectionChangeRangeEvent |
| model/selection.ts           | SelectionChangeAttributeEvent | ModelSelectionChangeAttributeEvent |
| model/selection.ts           | Selectable                 | ModelSelectable              |
| model/selection.ts           | PlaceOrOffset             | ModelPlaceOrOffset           |
| model/text.ts               | Text                       | ModelText                    |
| model/textproxy.ts          | TextProxy                  | ModelTextProxy               |
| model/treewalker.ts         | TreeWalker                 | ModelTreeWalker              |
| model/treewalker.ts         | TreeWalkerValueType        | ModelTreeWalkerValueType      |
| model/treewalker.ts         | TreeWalkerValue            | ModelTreeWalkerValue          |
| model/treewalker.ts         | TreeWalkerDirection        | ModelTreeWalkerDirection      |
| model/treewalker.ts         | TreeWalkerOptions          | ModelTreeWalkerOptions        |
| model/typecheckable.ts      | TypeCheckable              | ModelTypeCheckable           |
| model/utils/autoparagraphing.ts | autoParagraphEmptyRoots   | _autoParagraphEmptyModelRoots |
| model/utils/autoparagraphing.ts | isParagraphable           | _isParagraphableModelNode     |
| model/utils/autoparagraphing.ts | wrapInParagraph           | _wrapInParagraphModelNode     |
| model/utils/deletecontent.ts | deleteContent              | _deleteModelContent          |
| model/utils/getselectedcontent.ts | getSelectedContent         | _getSelectedModelContent       |
| model/utils/insertcontent.ts  | insertContent              | _insertModelContent           |
| model/utils/insertobject.ts   | insertObject               | _insertModelObject            |
| model/utils/modifyselection.ts | modifySelection            | _modifyModelSelection         |
| model/utils/selection-post-fixer.ts | injectSelectionPostFixer | _injectModelSelectionPostFixer |
| model/utils/selection-post-fixer.ts | tryFixingRange           | _tryFixingModelRange           |
| model/utils/selection-post-fixer.ts | mergeIntersectingRanges  | _mergeIntersectingModelRanges  |
| model/writer.ts             | Writer                     | ModelWriter                  |
| view/attributeelement.ts    | AttributeElement           | ViewAttributeElement         |
| view/containerelement.ts    | ContainerElement           | ViewContainerElement         |
| view/containerelement.ts    | getFillerOffset            | getViewFillerOffset          |
| view/datatransfer.ts        | DataTransfer               | ViewDataTransfer             |
| view/datatransfer.ts        | EffectAllowed              | ViewEffectAllowed            |
| view/datatransfer.ts        | DropEffect                 | ViewDropEffect               |
| view/document.ts            | Document                   | ViewDocument                 |
| view/document.ts            | ViewDocumentPostFixer      | ViewDocumentPostFixer        |
| view/document.ts            | ChangeType                 | ViewDocumentChangeType       |
| view/documentfragment.ts    | DocumentFragment           | ViewDocumentFragment         |
| view/documentselection.ts   | DocumentSelection          | ViewDocumentSelection        |
| view/domconverter.ts        | DomConverter               | ViewDomConverter             |
| view/downcastwriter.ts      | DowncastWriter             | ViewDowncastWriter           |
| view/editableelement.ts     | EditableElement            | ViewEditableElement          |
| view/element.ts             | Element                    | ViewElement                  |
| view/element.ts             | ElementAttributeValue      | ViewElementAttributeValue    |
| view/element.ts             | ElementAttributes          | ViewElementAttributes        |
| view/element.ts             | NormalizedConsumables      | ViewNormalizedConsumables    |
| view/elementdefinition.ts   | ElementObjectDefinition    | ViewElementObjectDefinition  |
| view/elementdefinition.ts   | ElementDefinition          | ViewElementDefinition        |
| view/emptyelement.ts        | EmptyElement               | ViewEmptyElement             |
| view/filler.ts              | NBSP_FILLER                | _VIEW_NBSP_FILLER            |
| view/filler.ts              | MARKED_NBSP_FILLER         | _VIEW_MARKED_NBSP_FILLER     |
| view/filler.ts              | BR_FILLER                  | _VIEW_BR_FILLER              |
| view/filler.ts              | INLINE_FILLER_LENGTH       | _VIEW_INLINE_FILLER_LENGTH   |
| view/filler.ts              | INLINE_FILLER              | _VIEW_INLINE_FILLER          |
| view/filler.ts              | startsWithFiller           | _startsWithViewFiller        |
| view/filler.ts              | isInlineFiller             | _isInlineViewFiller          |
| view/filler.ts              | getDataWithoutFiller       | _getDataWithoutViewFiller    |
| view/filler.ts              | injectQuirksHandling       | _injectViewQuirksHandling    |
| view/item.ts               | Item                       | ViewItem                    |
| view/matcher.ts            | isPatternMatched           | _isViewPatternMatched       |
| view/matcher.ts            | PropertyPatterns           | MatchPropertyPatterns       |
| view/matcher.ts            | AttributePatterns          | MatchAttributePatterns      |
| view/matcher.ts            | StylePatterns              | MatchStylePatterns          |
| view/matcher.ts            | ClassPatterns              | MatchClassPatterns          |
| view/matcher.ts            | NormalizedPropertyPattern  | _ViewNormalizedPropertyPattern |
| view/node.ts               | Node                       | ViewNode                    |
| view/observer/arrowkeysobserver.ts | ArrowKeysObserver         | ViewDocumentArrowKeyEvent   |
| view/observer/bubblingeventinfo.ts | EventPhase               | BubblingEventPhase          |
| view/observer/compositionobserver.ts | CompositionEventData      | ViewDocumentCompositionEventData |
| view/observer/domeventdata.ts | DomEventData               | ViewDocumentDomEventData    |
| view/observer/inputobserver.ts | InputEventData             | ViewDocumentInputEventData  |
| view/observer/keyobserver.ts | KeyEventData               | ViewDocumentKeyEventData    |
| view/observer/mutationobserver.ts | MutationsEventData         | ViewDocumentMutationEventData |
| view/observer/mutationobserver.ts | MutationData               | ObserverMutationData        |
| view/placeholder.ts        | enablePlaceholder           | enableViewPlaceholder       |
| view/placeholder.ts        | disablePlaceholder          | disableViewPlaceholder      |
| view/placeholder.ts        | showPlaceholder             | showViewPlaceholder         |
| view/placeholder.ts        | hidePlaceholder             | hideViewPlaceholder         |
| view/placeholder.ts        | needsPlaceholder            | needsViewPlacegolder        |
| view/placeholder.ts        | PlaceholderableElement      | PlaceholderableViewElement  |
| view/position.ts           | Position                   | ViewPosition                |
| view/position.ts           | PositionRelation           | ViewPositionRelation        |
| view/position.ts           | PositionOffset             | ViewPositionOffset          |
| view/range.ts              | Range                      | ViewRange                   |
| view/rawelement.ts         | RawElement                 | ViewRawElement              |
| view/renderer.ts           | Renderer                   | ViewRenderer                |
| view/rooteditableelement.ts| RootEditableElement        | ViewRootEditableElement     |
| view/selection.ts          | Selection                  | ViewSelection               |
| view/selection.ts          | SelectionOptions           | ViewSelectionOptions        |
| view/selection.ts          | PlaceOrOffset              | ViewPlaceOrOffset           |
| view/selection.ts          | Selectable                 | ViewSelectable              |
| view/styles/background.ts | addBackgroundRules          | addBackgroundStylesRules    |
| view/styles/border.ts     | addBorderRules              | addBorderStylesRules        |
| view/styles/margin.ts     | addMarginRules              | addMarginStylesRules        |
| view/styles/padding.ts    | addPaddingRules             | addPaddingStylesRules       |
| view/styles/utils.ts      | isColor                    | isColorStyleValue           |
| view/styles/utils.ts      | isLineStyle                | isLineStyleValue            |
| view/styles/utils.ts      | isLength                   | isLengthStyleValue          |
| view/styles/utils.ts      | isPercentage               | isPercentageStyleValue      |
| view/styles/utils.ts      | isRepeat                   | isRepeatStyleValue          |
| view/styles/utils.ts      | isPosition                 | isPositionStyleValue        |
| view/styles/utils.ts      | isAttachment               | isAttachmentStyleValue      |
| view/styles/utils.ts      | isURL                      | isURLStyleValue             |
| view/styles/utils.ts      | getBoxSidesValues          | getBoxSidesStyleValues      |
| view/styles/utils.ts      | getBoxSidesValueReducer    | getBoxSidesStyleValueReducer|
| view/styles/utils.ts      | getBoxSidesShorthandValue  | getBoxSidesStyleShorthandValue|
| view/styles/utils.ts      | getPositionShorthandNormalizer | getPositionStyleShorthandNormalizer |
| view/styles/utils.ts      | getShorthandValues         | getShorthandStylesValues    |
| view/stylesmap.ts         | PropertyDescriptor          | StylePropertyDescriptor     |
| view/stylesmap.ts         | BoxSides                   | BoxStyleSides               |
| view/stylesmap.ts         | Normalizer                 | StylesNormalizer            |
| view/stylesmap.ts         | Extractor                  | StylesExtractor             |
| view/stylesmap.ts         | Reducer                    | StylesReducer               |
| view/text.ts              | Text                       | ViewText                    |
| view/textproxy.ts      | TextProxy                     | ViewTextProxy                    |
| view/tokenlist.ts      | TokenList                     | ViewTokenList                    |
| view/treewalker.ts     | TreeWalker                    | ViewTreeWalker                   |
| view/treewalker.ts     | TreeWalkerValueType           | ViewTreeWalkerValueType          |
| view/treewalker.ts     | TreeWalkerValue               | ViewTreeWalkerValue              |
| view/treewalker.ts     | TreeWalkerDirection           | ViewTreeWalkerDirection          |
| view/treewalker.ts     | TreeWalkerOptions             | ViewTreeWalkerOptions            |
| view/typecheckable.ts  | TypeCheckable                 | ViewTypeCheckable                |
| view/uielement.ts      | UIElement                    | ViewUIElement                   |
| view/uielement.ts      | injectUiElementHandling       | _injectViewUIElementHandling     |
| view/upcastwriter.ts   | UpcastWriter                 | ViewUpcastWriter                 |
| view/view.ts           | View                         | EditingView                     |
| view/view.ts           | AlwaysRegisteredObservers     | AlwaysRegisteredViewObservers    |

### @ckeditor/ckeditor5-enter

| file           | original_method_name           | re_exported_method_name           |
|----------------|-------------------------------|----------------------------------|
| enterobserver.ts      | EnterObserver                | EnterObserver                   |
| enterobserver.ts      | EnterEventData               | ViewDocumentEnterEventData       |
| utils.ts             | getCopyOnEnterAttributes     | _getCopyOnEnterAttributes         |

### @ckeditor/ckeditor5-export-word

| file           | original_method_name                         | re_exported_method_name                      |
|----------------|---------------------------------------------|---------------------------------------------|
| exportword.ts  | ExportWordConverterInternalOptions           | _ExportWordConverterInternalOptions          |
| exportword.ts  | ExportWordConverterInternalOptionsV2         | _ExportWordConverterInternalOptionsV2        |
| exportword.ts  | ExportWordConverterCollaborationFeaturesOptionsV2 | _ExportWordConverterCollaborationFeaturesOptionsV2 |
| exportword.ts  | ExportWordConverterCommentsThreadOptionsV2   | _ExportWordConverterCommentsThreadOptionsV2  |
| exportword.ts  | ExportWordConverterCommentsV2                  | _ExportWordConverterCommentsV2                |
| exportword.ts  | ExportWordConverterSuggestionsOptionsV2       | _ExportWordConverterSuggestionsOptionsV2     |
| exportword.ts  | ExportWordConverterMergeFieldsOptionsV2       | _ExportWordConverterMergeFieldsOptionsV2     |

### @ckeditor/ckeditor5-find-and-replace

| File                | Original Method Name           | New Re-exported Method Name          |
|---------------------|-------------------------------|-------------------------------------|
| findandreplace.ts    | ResultType                    | FindResultType                      |
| findandreplacestate.ts | sortSearchResultsByMarkerPositions | _sortFindResultsByMarkerPositions  |
| findandreplaceui.ts  | SearchResetedEvent            | FindResetedEvent                    |
| replacecommandbase.ts| ReplaceCommandBase            | FindReplaceCommandBase              |

### @ckeditor/ckeditor5-font

| File                | Original Method Name           | New Re-exported Method Name          |
|---------------------|-------------------------------|-------------------------------------|
| fontfamily/utils.ts  | normalizeOptions              | _normalizeFontFamilyOptions          |
| fontsize/utils.ts    | normalizeOptions              | _normalizeFontSizeOptions            |
| ui/colorui.ts       | ColorUI                      | FontColorUIBase                     |
| utils.ts            | buildDefinition              | _buildFontDefinition                |
| utils.ts            | renderUpcastAttribute        | _renderUpcastFontColorAttribute    |
| utils.ts            | renderDowncastElement        | _renderDowncastFontElement          |
| utils.ts            | addColorSelectorToDropdown   | _addFontColorSelectorToDropdown     |
| utils.ts            | ColorSelectorDropdownView    | FontColorSelectorDropdownView       |

### @ckeditor/ckeditor5-fullscreen

| File                            | Original Method Name         | New Re-exported Method Name          |
|--------------------------------|-----------------------------|-------------------------------------|
| handlers/abstracteditorhandler.ts | AbstractEditorHandler       | FullscreenAbstractEditorHandler     |
| handlers/classiceditorhandler.ts   | ClassicEditorHandler        | FullscreenClassicEditorHandler      |
| handlers/decouplededitorhandler.ts | DecoupledEditorHandler      | FullscreenDecoupledEditorHandler    |

### @ckeditor/ckeditor5-heading

| File        | Original Method Name     | New Re-exported Method Name      |
|-------------|-------------------------|---------------------------------|
| title.ts    | TitleConfig             | HeadingTitleConfig              |
| utils.ts    | getLocalizedOptions     | _getLocalizedHeadingOptions     |

### @ckeditor/ckeditor5-html-embed

| File                | Original Method Name     | New Re-exported Method Name    |
|---------------------|-------------------------|-------------------------------|
| htmlembedediting.ts  | RawHtmlApi              | _RawHtmlEmbedApi              |

### @ckeditor/ckeditor5-html-support

| file                | original_method                      | reexported_method                          |
|---------------------|------------------------------------|-------------------------------------------|
| converters.ts       | viewToModelObjectConverter          | _viewToModelObjectContentHtmlSupportConverter |
| converters.ts       | toObjectWidgetConverter             | _toObjectWidgetHtmlSupportConverter        |
| converters.ts       | createObjectView                   | _createObjectHtmlSupportView                |
| converters.ts       | viewToAttributeInlineConverter      | _viewToAttributeInlineHtmlSupportConverter |
| converters.ts       | emptyInlineModelElementToViewConverter | _emptyInlineModelElementToViewHtmlSupportConverter |
| converters.ts       | attributeToViewInlineConverter      | _attributeToInlineHtmlSupportConverter      |
| converters.ts       | viewToModelBlockAttributeConverter  | _viewToModelBlockAttributeHtmlSupportConverter |
| converters.ts       | modelToViewBlockAttributeConverter  | _modelToViewBlockAttributeHtmlSupportConverter |
| datafilter.ts       | DataFilterRegisterEvent             | HtmlSupportDataFilterRegisterEvent          |
| dataschema.ts       | DataSchemaDefinition                | HtmlSupportDataSchemaDefinition              |
| dataschema.ts       | DataSchemaBlockElementDefinition    | HtmlSupportDataSchemaBlockElementDefinition  |
| dataschema.ts       | DataSchemaInlineElementDefinition   | HtmlSupportDataSchemaInlineElementDefinition |
| generalhtmlsupportconfig.ts | FullPageConfig               | GHSFullPageConfig                            |
| generalhtmlsupportconfig.ts | CssSanitizeOutput            | GHSCssSanitizeOutput                         |
| integrations/integrationutils.ts | getDescendantElement     | _getHtmlSupportDescendantElement              |
| schemadefinitions.ts | <default>                         | _HTML_SUPPORT_SCHEMA_DEFINITIONS             |
| utils.ts            | updateViewAttributes               | _updateHtmlSupportViewAttributes              |
| utils.ts            | setViewAttributes                  | _setHtmlSupportViewAttributes                  |
| utils.ts            | removeViewAttributes               | _removeHtmlSupportViewAttributes               |
| utils.ts            | mergeViewElementAttributes        | _mergeHtmlSupportViewElementAttributes         |
| utils.ts            | modifyGhsAttribute                 | _modifyHtmlSupportGhsAttribute                  |
| utils.ts            | toPascalCase                      | _toHtmlSupportPascalCase                        |
| utils.ts            | getHtmlAttributeName              | _getHtmlSupportAttributeName                    |

### @ckeditor/ckeditor5-image

| file                       | original_method                      | reexported_method                         |
|----------------------------|------------------------------------|------------------------------------------|
| image/converters.ts        | upcastImageFigure                   | _upcastImageFigure                        |
| image/converters.ts        | upcastPicture                      | _upcastImagePicture                       |
| image/converters.ts        | downcastSrcsetAttribute             | _downcastImageSrcsetAttribute             |
| image/converters.ts        | downcastSourcesAttribute            | _downcastImageSourcesAttribute            |
| image/converters.ts        | downcastImageAttribute              | _downcastImageAttribute                    |
| image/imageloadobserver.ts | ImageLoadObserver                   | ImageLoadObserver                          |
| image/ui/utils.ts          | repositionContextualBalloon         | _repositionImageContextualBalloon          |
| image/ui/utils.ts          | getBalloonPositionData              | _getImageBalloonPositionData                |
| image/utils.ts             | createInlineImageViewElement        | _createInlineImageViewElement               |
| image/utils.ts             | createBlockImageViewElement         | _createBlockImageViewElement                |
| image/utils.ts             | getImgViewElementMatcher            | _getImageViewElementMatcher                  |
| image/utils.ts             | determineImageTypeForInsertionAtSelection | _determineImageTypeForInsertionAtSelection |
| image/utils.ts             | getSizeValueIfInPx                  | _getImageSizeValueIfInPx                      |
| image/utils.ts             | widthAndHeightStylesAreBothSet      | _checkIfImageWidthAndHeightStylesAreBothSet  |
| imageinsert/ui/imageinsertformview.ts | ImageInsertFormView         | _ImageInsertFormView                          |
| imageinsert/ui/imageinserturlview.ts  | ImageInsertUrlView          | _ImageInsertUrlView                           |
| imageresize/ui/imagecustomresizeformview.ts | ImageCustomResizeFormView | _ImageCustomResizeFormView                   |
| imageresize/ui/imagecustomresizeformview.ts | ImageCustomResizeFormValidatorCallback | _ImageCustomResizeFormValidatorCallback   |
| imageresize/utils/getselectedimageeditornodes.ts | getSelectedImageEditorNodes | _getSelectedImageEditorNodes                 |
| imageresize/utils/getselectedimagepossibleresizerange.ts | getSelectedImagePossibleResizeRange | _getSelectedImagePossibleResizeRange      |
| imageresize/utils/getselectedimagepossibleresizerange.ts | PossibleResizeImageRange | _PossibleResizeImageRange                     |
| imageresize/utils/getselectedimagewidthinunits.ts | getSelectedImageWidthInUnits | _getSelectedImageWidthInUnits               |
| imageresize/utils/tryparsedimensionwithunit.ts | tryParseDimensionWithUnit | _tryParseImageDimensionWithUnit               |
| imageresize/utils/tryparsedimensionwithunit.ts | tryCastDimensionsToUnit | _tryCastImageDimensionsToUnit                   |
| imageresize/utils/tryparsedimensionwithunit.ts | DimensionWithUnit          | _ImageDimensionWithUnit                      |
| imagestyle/converters.ts    | modelToViewStyleAttribute          | _modelToViewImageStyleAttribute              |
| imagestyle/converters.ts    | viewToModelStyleAttribute          | _viewToModelImageStyleAttribute               |
| imagestyle/utils.ts         | DEFAULT_OPTIONS                   | _IMAGE_DEFAULT_OPTIONS                        |
| imagestyle/utils.ts         | DEFAULT_ICONS                     | _IMAGE_DEFAULT_ICONS                          |
| imagestyle/utils.ts         | DEFAULT_DROPDOWN_DEFINITIONS      | _IMAGE_DEFAULT_DROPDOWN_DEFINITIONS            |
| imagestyle/utils.ts         | <default>                        | _ImageStyleUtils                              |
| imagetextalternative/ui/textalternativeformview.ts | TextAlternativeFormView | _ImageTextAlternativeFormView                  |
| imagetextalternative/ui/textalternativeformview.ts | TextAlternativeFormViewSubmitEvent | _ImageTextAlternativeFormViewSubmitEvent |
| imagetextalternative/ui/textalternativeformview.ts | TextAlternativeFormViewCancelEvent | _ImageTextAlternativeFormViewCancelEvent |
| imageupload/imageuploadediting.ts | isHtmlIncluded               | isHtmlInDataTransfer                          |
| imageupload/utils.ts        | fetchLocalImage                   | _fetchLocalImage                              |
| imageupload/utils.ts        | isLocalImage                     | _isLocalImage                                 |

### @ckeditor/ckeditor5-import-word

| file                    | original_method          | reexported_method              |
|-------------------------|-------------------------|-------------------------------|
| importwordcommand.ts    | DataInsertEventData      | ImportWordDataInsertEventData  |
| importword.ts           | FormattingOptions        | ImportWordFormattingOptions    |
| importwordcommand.ts    | DataInsertEvent          | ImportWordDataInsertEvent      |
### @ckeditor/ckeditor5-indent

| file                      | original method name   | re-exported method name  |
|---------------------------|-----------------------|--------------------------|
| indentcommandbehavior/indentusingclasses.ts | IndentUsingClasses      | _IndentUsingClasses       |
| indentcommandbehavior/indentusingoffset.ts  | IndentUsingOffset       | _IndentUsingOffset        |

### @ckeditor/ckeditor5-language

| file           | original method name        | re-exported method name       |
|----------------|-----------------------------|-------------------------------|
| utils.ts       | stringifyLanguageAttribute   | _stringifyLanguageAttribute    |
| utils.ts       | parseLanguageAttribute       | _parseLanguageAttribute        |

### @ckeditor/ckeditor5-link

| file                      | original method name       | re-exported method name          |
|---------------------------|----------------------------|---------------------------------|
| ui/linkbuttonview.ts       | LinkButtonView             | _LinkButtonView                 |
| ui/linkformview.ts         | SubmitEvent                | LinkFormSubmitEvent             |
| ui/linkformview.ts         | CancelEvent                | LinkFormCancelEvent             |
| ui/linkpreviewbuttonview.ts| LinkPreviewButtonView      | _LinkPreviewButtonView          |
| ui/linkpropertiesview.ts   | BackEvent                  | LinkPropertiesBackEvent         |
| ui/linkprovideritemsview.ts| CancelEvent                | LinkProvidersCancelEvent        |
| utils.ts                  | LINK_KEYSTROKE             | _LINK_KEYSTROKE                 |
| utils.ts                  | createLinkElement          | _createLinkElement              |
| utils.ts                  | ensureSafeUrl              | _ensureSafeLinkUrl              |
| utils.ts                  | getLocalizedDecorators     | _getLocalizedLinkDecorators     |
| utils.ts                  | normalizeDecorators        | _normalizeLinkDecorators        |
| utils.ts                  | isEmail                   | _isEmailLink                   |
| utils.ts                  | linkHasProtocol            | _hasLinkProtocol                |
| utils.ts                  | openLink                   | _openLink                      |
| utils.ts                  | extractTextFromLinkRange   | _extractTextFromLinkRange       |
| utils/manualdecorator.ts  | ManualDecorator            | LinkManualDecorator             |

### @ckeditor/ckeditor5-list

| file                                   | original method name               | re-exported method name              |
|----------------------------------------|----------------------------------|------------------------------------|
| list/converters.ts                      | listItemUpcastConverter           | _listItemUpcastConverter            |
| list/converters.ts                      | reconvertItemsOnDataChange        | _reconvertListItemsOnDataChange     |
| list/converters.ts                      | listItemDowncastConverter         | _listItemDowncastConverter           |
| list/converters.ts                      | listItemDowncastRemoveConverter   | _listItemDowncastRemoveConverter     |
| list/converters.ts                      | bogusParagraphCreator             | _listItemBogusParagraphCreator       |
| list/converters.ts                      | findMappedViewElement             | _findMappedListItemViewElement       |
| list/converters.ts                      | createModelToViewPositionMapper  | _createModelToViewListPositionMapper |
| list/listcommand.ts                     | ListCommandAfterExecuteEvent      | _ListCommandAfterExecuteEvent        |
| list/listediting.ts                     | ListItemAttributesMap             | _ListItemAttributesMap               |
| list/listediting.ts                     | ListEditingCheckAttributesEvent   | _ListEditingCheckAttributesEvent     |
| list/listediting.ts                     | ListEditingCheckElementEvent      | _ListEditingCheckElementEvent        |
| list/listindentcommand.ts               | ListIndentCommandAfterExecuteEvent| _ListIndentCommandAfterExecuteEvent  |
| list/listmergecommand.ts                | ListMergeCommandAfterExecuteEvent | _ListMergeCommandAfterExecuteEvent   |
| list/listsplitcommand.ts                | ListSplitCommandAfterExecuteEvent | _ListSplitCommandAfterExecuteEvent   |
| list/utils.ts                          | createUIComponents               | _createListUIComponents              |
| list/utils/listwalker.ts                | ListWalker                      | _ListWalker                        |
| list/utils/listwalker.ts                | SiblingListBlocksIterator       | _SiblingListBlocksIterator           |
| list/utils/listwalker.ts                | ListBlocksIterable              | _ListBlocksIterable                  |
| list/utils/listwalker.ts                | ListIteratorValue               | _ListIteratorValue                   |
| list/utils/listwalker.ts                | ListWalkerOptions               | _ListWalkerOptions                   |
| list/utils/model.ts                     | ListItemUid                    | _ListItemUid                      |
| list/utils/model.ts                     | ListElement                    | _ListElement                      |
| list/utils/model.ts                     | isListItemBlock                | _isListItemBlock                  |
| list/utils/model.ts                     | getAllListItemBlocks           | _getAllListItemBlocks             |
| list/utils/model.ts                     | getListItemBlocks              | _getListItemBlocks                |
| list/utils/model.ts                     | getNestedListBlocks            | _getNestedListBlocks              |
| list/utils/model.ts                     | getListItems                   | _getListItems                    |
| list/utils/model.ts                     | isFirstBlockOfListItem         | _isFirstBlockOfListItem           |
| list/utils/model.ts                     | isLastBlockOfListItem          | _isLastBlockOfListItem            |
| list/utils/model.ts                     | expandListBlocksToCompleteItems | _expandListBlocksToCompleteItems  |
| list/utils/model.ts                     | expandListBlocksToCompleteList  | _expandListBlocksToCompleteList    |
| list/utils/model.ts                     | splitListItemBefore            | _splitListItemBefore              |
| list/utils/model.ts                     | mergeListItemBefore            | _mergeListItemBefore              |
| list/utils/model.ts                     | indentBlocks                  | _indentListBlocks                |
| list/utils/model.ts                     | outdentBlocksWithMerge         | _outdentListBlocksWithMerge        |
| list/utils/model.ts                     | removeListAttributes           | _removeListAttributes             |
| list/utils/model.ts                     | isSingleListItem              | _isSingleListItem                |
| list/utils/model.ts                     | outdentFollowingItems          | _outdentFollowingListItems         |
| list/utils/model.ts                     | sortBlocks                   | _sortListBlocks                 |
| list/utils/model.ts                     | getSelectedBlockObject         | _getSelectedBlockObject           |
| list/utils/model.ts                     | canBecomeSimpleListItem        | _canBecomeSimpleListItem          |
| list/utils/model.ts                     | isNumberedListType             | _isNumberedListType               |
| list/utils/postfixers.ts                | findAndAddListHeadToMap         | _findAndAddListHeadToMap           |
| list/utils/postfixers.ts                | fixListIndents                | _fixListIndents                  |
| list/utils/postfixers.ts                | fixListItemIds                | _fixListItemIds                  |
| list/utils/view.ts                      | isListView                   | _isListView                    |
| list/utils/view.ts                      | isListItemView               | _isListItemView                  |
| list/utils/view.ts                      | getIndent                    | _getListIndent                 |
| list/utils/view.ts                      | createListElement             | _createListElement               |
| list/utils/view.ts                      | createListItemElement          | _createListItemElement            |
| list/utils/view.ts                      | getViewElementNameForListType  | _getViewElementNameForListType    |
| list/utils/view.ts                      | getViewElementIdForListType    | _getViewElementIdForListType      |
| listproperties/converters.ts            | listPropertiesUpcastConverter   | _listPropertiesUpcastConverter    |
| listproperties/listpropertiesediting.ts| AttributeStrategy              | _ListAttributeConversionStrategy  |
| listproperties/ui/listpropertiesview.ts| ListPropertiesView             | _ListPropertiesView               |
| listproperties/ui/listpropertiesview.ts| StylesView                    | _ListPropertiesStylesView         |
| listproperties/utils/config.ts          | getNormalizedConfig            | _getNormalizedListConfig          |
| listproperties/utils/config.ts          | NormalizedListPropertiesConfig  | _NormalizedListPropertiesConfig   |
| listproperties/utils/style.ts           | getAllSupportedStyleTypes      | _getAllSupportedListStyleTypes    |
| listproperties/utils/style.ts           | getListTypeFromListStyleType   | _getListTypeFromListStyleType     |
| listproperties/utils/style.ts           | getListStyleTypeFromTypeAttribute | _getListStyleTypeFromTypeAttribute |
| listproperties/utils/style.ts           | getTypeAttributeFromListStyleType | _getTypeAttributeFromListStyleType |
| listproperties/utils/style.ts           | normalizeListStyle             | _normalizeListStyle               |
| todolist/todocheckboxchangeobserver.ts | TodoCheckboxChangeObserver     | _TodoCheckboxChangeObserver       |

### @ckeditor/ckeditor5-list-multi-level
| file                 | original method name              | new re-exported method name          |
|----------------------|---------------------------------|------------------------------------|
| multilevellist.ts    | MultiLevelListConfig             | _MultiLevelListConfig               |
| multilevellist.ts    | MultiLevelListDefinition         | _MultiLevelListDefinition           |
| multilevellist.ts    | MultiLevelListMarkerDefinition   | _MultiLevelListMarkerDefinition     |
| multilevellist.ts    | MultiLevelListMarkerPattern      | _MultiLevelListMarkerPattern        |

### @ckeditor/ckeditor5-markdown-gfm
| file                     | original method name       | new re-exported method name      |
|--------------------------|----------------------------|---------------------------------|
| gfmdataprocessor.ts       | GFMDataProcessor            | MarkdownGfmDataProcessor         |
| html2markdown.ts          | HtmlToMarkdown              | MarkdownGfmHtmlToMd              |
| markdown2html.ts          | MarkdownToHtml              | MarkdownGfmMdToHtml              |

### @ckeditor/ckeditor5-media-embed
| file                    | original method name              | new re-exported method name                 |
|-------------------------|---------------------------------|--------------------------------------------|
| converters.ts           | modelToViewUrlAttributeConverter | _modelToViewUrlAttributeMediaConverter      |
| ui/mediaformview.ts     | MediaFormView                    | _MediaFormView                              |
| utils.ts                | toMediaWidget                   | _toMediaWidget                              |
| utils.ts                | getSelectedMediaViewWidget      | _getSelectedMediaViewWidget                  |
| utils.ts                | isMediaWidget                   | _isMediaWidget                              |
| utils.ts                | createMediaFigureElement        | _createMediaFigureElement                    |
| utils.ts                | getSelectedMediaModelWidget     | _getSelectedMediaModelWidget                 |
| utils.ts                | insertMedia                     | _insertMedia                                |

### @ckeditor/ckeditor5-mention
| file                    | original method name      | new re-exported method name         |
|-------------------------|--------------------------|------------------------------------|
| mentionconfig.ts        | FeedCallback             | MentionFeedbackCallback             |
| mentionconfig.ts        | ItemRenderer             | MentionItemRenderer                 |
| mentionediting.ts       | _addMentionAttributes    | _addMentionAttributes               |
| mentionediting.ts       | _toMentionAttribute      | _toMentionAttribute                 |
| mentionui.ts            | createRegExp             | _createMentionMarkerRegExp          |
| ui/domwrapperview.ts    | DomWrapperView           | MentionDomWrapperView               |

### @ckeditor/ckeditor5-merge-fields
| file                    | original method name  | new re-exported method name          |
|-------------------------|----------------------|-------------------------------------|
| mergefieldsconfig.ts    | GroupDefinition       | MergeFieldsGroupDefinition           |
| mergefieldsconfig.ts    | DataSetDefinition     | MergeFieldsDataSetDefinition          |

### @ckeditor/ckeditor5-minimap
| file                       | original method name           | new re-exported method name            |
|----------------------------|-------------------------------|---------------------------------------|
| minimapiframeview.ts        | MinimapIframeView              | _MinimapIframeView                    |
| minimappositiontrackerview.ts | MinimapPositionTrackerView  | _MinimapPositionTrackerView           |
| minimapview.ts              | MinimapViewOptions             | _MinimapViewOptions                   |
| minimapview.ts              | MinimapView                    | _MinimapView                         |
| utils.ts                   | cloneEditingViewDomRoot        | _cloneMinimapEditingViewDomRoot       |
| utils.ts                   | getPageStyles                  | _getMinimapPageStyles                 |
| utils.ts                   | getDomElementRect              | _getMinimapDomElementRect             |
| utils.ts                   | getClientHeight                | _getMinimapClientHeight               |
| utils.ts                   | getScrollable                  | _getMinimapScrollable                 |

### @ckeditor/ckeditor5-paste-from-office
| file                           | original method name                    | new re-exported method name                    |
|--------------------------------|---------------------------------------|------------------------------------------------|
| filters/bookmark.ts            | transformBookmarks                     | _transformPasteOfficeBookmarks                  |
| filters/br.ts                 | transformBlockBrsToParagraphs          | _transformPasteOfficeBlockBrsToParagraphs       |
| filters/image.ts              | replaceImagesSourceWithBase64           | _replacePasteOfficeImagesSourceWithBase64        |
| filters/image.ts              | _convertHexToBase64                    | _convertHexToBase64                              |
| filters/list.ts               | transformListItemLikeElementsIntoLists | _transformPasteOfficeListItemLikeElementsIntoLists|
| filters/list.ts               | unwrapParagraphInListItem               | _unwrapPasteOfficeParagraphInListItem            |
| filters/parse.ts              | parseHtml                             | parsePasteOfficeHtml                             |
| filters/parse.ts              | ParseHtmlResult                       | PasteOfficeHtmlParseResult                        |
| filters/removeboldwrapper.ts | removeBoldWrapper                     | _removePasteOfficeBoldWrapper                      |
| filters/removegooglesheetstag.ts | removeGoogleSheetsTag              | _removePasteGoogleOfficeSheetsTag                  |
| filters/removeinvalidtablewidth.ts | removeInvalidTableWidth           | _removePasteOfficeInvalidTableWidths               |
| filters/removemsattributes.ts | removeMSAttributes                   | _removePasteMSOfficeAttributes                      |
| filters/removestyleblock.ts   | removeStyleBlock                     | _removePasteOfficeStyleBlock                         |
| filters/removexmlns.ts        | removeXmlns                         | _removePasteOfficeXmlnsAttributes                   |
| filters/space.ts              | normalizeSpacing                    | _normalizePasteOfficeSpacing                         |
| filters/space.ts              | normalizeSpacerunSpans              | _normalizePasteOfficeSpaceRunSpans                   |
| filters/table.ts              | transformTables                    | _transformPasteOfficeTables                          |
| filters/utils.ts              | convertCssLengthToPx               | _convertPasteOfficeCssLengthToPx                      |
| filters/utils.ts              | isPx                              | _isPasteOfficePxValue                                |
| filters/utils.ts              | toPx                              | _toPasteOfficePxValue                                |
| normalizer.ts                | Normalizer                        | PasteFromOfficeNormalizer                            |
| normalizer.ts                | NormalizerData                    | PasteFromOfficeNormalizerData                        |
| normalizers/googledocsnormalizer.ts | GoogleDocsNormalizer         | PasteFromOfficeGoogleDocsNormalizer                  |
| normalizers/googlesheetsnormalizer.ts | GoogleSheetsNormalizer      | PasteFromOfficeGoogleSheetsNormalizer                |
| normalizers/mswordnormalizer.ts | MSWordNormalizer                | PasteFromOfficeMSWordNormalizer                       |

### @ckeditor/ckeditor5-real-time-collaboration
| file                               | original method name        | new re-exported method name         |
|------------------------------------|-----------------------------|------------------------------------|
| realtimecollaborativeediting/websocketgateway.ts | Reconnect                 | RtcReconnect                      |
| config.ts                         | PresenceListConfig          | RtcPresenceListConfig              |
| presencelist/view/presencedropdownlistview.ts | PresenceDropdownListView   | _RtcPresenceDropdownListView       |
| presencelist/view/presencedropdownlistview.ts | PresenceDropdownListWrapperView | _RtcPresenceDropdownListWrapperView |
| presencelist/view/presencelistview.ts | PresenceListView          | _RtcPresenceListView               |
| realtimecollaborativeediting/sessions.ts | ServerUser                 | RtcServerUser                     |
| realtimecollaborativeediting/sessions.ts | SessionAddEvent            | RtcSessionAddEvent                |
| realtimecollaborativeediting/websocketgateway.ts | WebSocketGateway           | RtcWebSocketGateway               |
| realtimecollaborativeediting/websocketgateway.ts | ReconnectPlugin            | RtcReconnectPlugin                |
| realtimecollaborativeediting/websocketgateway.ts | ReconnectContextPlugin     | RtcReconnectContextPlugin         |

### @ckeditor/ckeditor5-restricted-editing
| file                             | original method name                   | new re-exported method name                   |
|----------------------------------|-------------------------------------|-----------------------------------------------|
| restrictededitingmode/converters.ts | setupExceptionHighlighting          | _setupRestrictedEditingExceptionHighlighting  |
| restrictededitingmode/converters.ts | resurrectCollapsedMarkerPostFixer   | _resurrectRestrictedEditingCollapsedMarkerPostFixer |
| restrictededitingmode/converters.ts | extendMarkerOnTypingPostFixer        | _extendRestrictedEditingMarkerOnTypingPostFixer   |
| restrictededitingmode/converters.ts | upcastHighlightToMarker              | _upcastRestrictedEditingHighlightToMarker         |
| restrictededitingmode/utils.ts    | getMarkerAtPosition                  | _getRestrictedEditingMarkerAtPosition              |
| restrictededitingmode/utils.ts    | isPositionInRangeBoundaries          | _isRestrictedEditingPositionInRangeBoundaries        |
| restrictededitingmode/utils.ts    | isSelectionInMarker                  | _isRestrictedEditingSelectionInMarker                  |

### @ckeditor/ckeditor5-revision-history
| file                   | original method name  | new re-exported method name        |
|------------------------|----------------------|-----------------------------------|
| revisionhistory.ts     | TapeValue             | _RevisionHistoryTapeValue          |
| revisionhistory.ts     | TapeItem              | _RevisionHistoryTapeItem           |
| revisiontracker.ts     | RevisionSource        | _RevisionHistorySource             |

### @ckeditor/ckeditor5-special-characters
| file                      | original method name          | new re-exported method name           |
|---------------------------|------------------------------|--------------------------------------|
| ui/charactergridview.ts    | CharacterGridView             | _SpecialCharactersGridView           |
| ui/charactergridview.ts    | CharacterGridViewExecuteEvent | SpecialCharactersGridViewExecuteEvent |
| ui/charactergridview.ts    | CharacterGridViewTileHoverEvent | SpecialCharactersGridViewTileHoverEvent |
| ui/charactergridview.ts    | CharacterGridViewTileFocusEvent | SpecialCharactersGridViewTileFocusEvent |
| ui/charactergridview.ts    | CharacterGridViewEventData   | SpecialCharactersGridViewEventData   |
| ui/characterinfoview.ts    | CharacterInfoView            | _SpecialCharacterInfoView            |
| ui/specialcharacterscategoriesview.ts | SpecialCharactersCategoriesView | _SpecialCharactersCategoriesView     |
| ui/specialcharactersview.ts | SpecialCharactersView        | _SpecialCharactersView               |

### @ckeditor/ckeditor5-style
| file                           | original method name                           | new re-exported method name             |
|--------------------------------|----------------------------------------------|----------------------------------------|
| styleutils.ts                  | StyleUtilsIsEnabledForBlockEvent              | StyleUtilsIsEnabledForBlockEvent        |
| styleutils.ts                  | StyleUtilsIsActiveForBlockEvent               | StyleUtilsIsActiveForBlockEvent         |
| styleutils.ts                  | StyleUtilsGetAffectedBlocksEvent               | StyleUtilsGetAffectedBlocksEvent         |
| styleutils.ts                  | StyleUtilsIsStyleEnabledForInlineSelectionEvent | StyleUtilsIsStyleEnabledForInlineSelectionEvent |
| styleutils.ts                  | StyleUtilsIsStyleActiveForInlineSelectionEvent | StyleUtilsIsStyleActiveForInlineSelectionEvent |
| styleutils.ts                  | StyleUtilsGetAffectedInlineSelectableEvent     | StyleUtilsGetAffectedInlineSelectableEvent   |
| styleutils.ts                  | StyleUtilsGetStylePreviewEvent                  | StyleUtilsGetStylePreviewEvent          |
| styleutils.ts                  | StyleUtilsConfigureGHSDataFilterEvent           | StyleUtilsConfigureGHSDataFilterEvent   |
| ui/stylegridbuttonview.ts      | StyleGridButtonView                             | _StyleGridButtonView                    |
| ui/stylegridview.ts            | StyleGridView                                   | _StyleGridView                          |
| ui/stylegroupview.ts           | StyleGroupView                                  | _StyleGroupView                         |
| ui/stylepanelview.ts           | StylePanelView                                  | _StylePanelView                         |

### @ckeditor/ckeditor5-table

| file                      | original method name                 | re-exported method name                  |
|---------------------------|------------------------------------|-----------------------------------------|
| tableutils.ts             | IndexesObject                      | TableIndexesObject                       |
| converters/downcast.ts    | downcastTable                     | _downcastTable                          |
| converters/downcast.ts    | downcastRow                       | _downcastTableRow                       |
| converters/downcast.ts    | downcastCell                      | _downcastTableCell                      |
| converters/downcast.ts    | convertParagraphInTableCell       | _convertParagraphInTableCell            |
| converters/downcast.ts    | isSingleParagraphWithoutAttributes| _isSingleTableParagraphWithoutAttributes|
| converters/downcast.ts    | DowncastTableOptions              | _DowncastTableOptions                   |
| converters/table-caption-post-fixer.ts | injectTableCaptionPostFixer | _injectTableCaptionPostFixer          |
| converters/table-cell-paragraph-post-fixer.ts | injectTableCellParagraphPostFixer | _injectTableCellParagraphPostFixer |
| converters/table-cell-refresh-handler.ts | tableCellRefreshHandler | _tableCellRefreshHandler               |
| converters/table-headings-refresh-handler.ts | tableHeadingsRefreshHandler | _tableHeadingsRefreshHandler         |
| converters/table-layout-post-fixer.ts | injectTableLayoutPostFixer | _injectTableLayoutPostFixer             |
| converters/tableproperties.ts | upcastStyleToAttribute        | _upcastNormalizedTableStyleToAttribute |
| converters/tableproperties.ts | StyleValues                  | _TableStyleValues                       |
| converters/tableproperties.ts | upcastBorderStyles           | _upcastTableBorderStyles                |
| converters/tableproperties.ts | downcastAttributeToStyle    | _downcastTableAttributeToStyle          |
| converters/tableproperties.ts | downcastTableAttribute      | _downcastTableAttribute                  |
| converters/tableproperties.ts | getDefaultValueAdjusted     | _getDefaultTableValueAdjusted            |
| converters/upcasttable.ts  | upcastTableFigure             | _upcastTableFigure                      |
| converters/upcasttable.ts  | upcastTable                   | _upcastTable                            |
| converters/upcasttable.ts  | skipEmptyTableRow             | _skipEmptyTableRow                      |
| converters/upcasttable.ts  | ensureParagraphInTableCell   | _ensureParagraphInTableCell             |
| tablecaption/utils.ts      | isTable                      | _isTableModelElement                    |
| tablecaption/utils.ts      | getCaptionFromTableModelElement | _getTableCaptionFromModelElement       |
| tablecaption/utils.ts      | getCaptionFromModelSelection | _getTableCaptionFromModelSelection     |
| tablecaption/utils.ts      | matchTableCaptionViewElement | _matchTableCaptionViewElement           |
| tablecolumnresize/constants.ts | COLUMN_MIN_WIDTH_AS_PERCENTAGE | _TABLE_COLUMN_MIN_WIDTH_AS_PERCENTAGE  |
| tablecolumnresize/constants.ts | COLUMN_MIN_WIDTH_IN_PIXELS   | _TABLE_COLUMN_MIN_WIDTH_IN_PIXELS        |
| tablecolumnresize/constants.ts | COLUMN_WIDTH_PRECISION       | _TABLE_COLUMN_WIDTH_PRECISION            |
| tablecolumnresize/constants.ts | COLUMN_RESIZE_DISTANCE_THRESHOLD | _TABLE_COLUMN_RESIZE_DISTANCE_THRESHOLD |
| tablecolumnresize/converters.ts | upcastColgroupElement      | _upcastTableColgroupElement              |
| tablecolumnresize/converters.ts | downcastTableResizedClass  | _downcastTableResizedClass                |
| tablecolumnresize/utils.ts | getColumnMinWidthAsPercentage  | _getTableColumnMinWidthAsPercentage       |
| tablecolumnresize/utils.ts | getTableWidthInPixels           | _getTableWidthInPixels                     |
| tablecolumnresize/utils.ts | getElementWidthInPixels         | _getElementWidthInPixels                   |
| tablecolumnresize/utils.ts | getColumnEdgesIndexes           | _getTableColumnEdgesIndexes                |
| tablecolumnresize/utils.ts | toPrecision                    | _toPrecision                               |
| tablecolumnresize/utils.ts | clamp                         | _clamp                                     |
| tablecolumnresize/utils.ts | createFilledArray              | _createFilledArray                         |
| tablecolumnresize/utils.ts | sumArray                      | _sumArray                                 |
| tablecolumnresize/utils.ts | normalizeColumnWidths          | _normalizeTableColumnWidths                |
| tablecolumnresize/utils.ts | getDomCellOuterWidth           | _getDomTableCellOuterWidth                  |
| tablecolumnresize/utils.ts | updateColumnElements           | _updateTableColumnElements                  |
| tablecolumnresize/utils.ts | getColumnGroupElement          | _getTableColumnGroupElement                  |
| tablecolumnresize/utils.ts | getTableColumnElements         | _getTableColumnElements                     |
| tablecolumnresize/utils.ts | getTableColumnsWidths          | _getTableColumnsWidths                      |
| tablecolumnresize/utils.ts | translateColSpanAttribute      | _translateTableColspanAttribute             |
| tableediting.ts           | AdditionalSlot                 | TableConversionAdditionalSlot              |
| tablemouse/mouseeventsobserver.ts | MouseEventsObserver      | _TableMouseEventsObserver                   |
| tablemouse/mouseeventsobserver.ts | ViewDocumentMouseMoveEvent | ViewDocumentTableMouseMoveEvent           |
| tablemouse/mouseeventsobserver.ts | ViewDocumentMouseLeaveEvent | ViewDocumentTableMouseLeaveEvent         |
| ui/colorinputview.ts       | ColorInputViewOptions          | _TableColorInputViewOptions                  |
| ui/colorinputview.ts       | ColorInputView                 | _TableColorInputView                         |
| ui/inserttableview.ts      | InsertTableView                | _InsertTableView                            |
| utils/common.ts            | updateNumericAttribute         | _updateTableNumericAttribute                 |
| utils/common.ts            | createEmptyTableCell           | _createEmptyTableCell                        |
| utils/common.ts            | isHeadingColumnCell            | _isHeadingColumnCell                         |
| utils/common.ts            | enableProperty                 | _enableTableCellProperty                      |
| utils/common.ts            | getSelectionAffectedTable      | _getSelectionAffectedTable                    |
| utils/structure.ts         | cropTableToDimensions          | _cropTableToDimensions                        |
| utils/structure.ts         | getVerticallyOverlappingCells  | _getVerticallyOverlappingTableCells           |
| utils/structure.ts         | splitHorizontally              | _splitTableCellHorizontally                   |
| utils/structure.ts         | getHorizontallyOverlappingCells | _getHorizontallyOverlappingTableCells          |
| utils/structure.ts         | splitVertically                | _splitTableCellVertically                     |
| utils/structure.ts         | trimTableCellIfNeeded          | _trimTableCellIfNeeded                        |
| utils/structure.ts         | removeEmptyColumns             | _removeEmptyTableColumns                      |
| utils/structure.ts         | removeEmptyRows                | _removeEmptyTableRows                         |
| utils/structure.ts         | removeEmptyRowsColumns         | _removeEmptyTableRowsColumns                   |
| utils/structure.ts         | adjustLastRowIndex             | _adjustLastTableRowIndex                      |
| utils/structure.ts         | adjustLastColumnIndex          | _adjustLastTableColumnIndex                   |
| utils/table-properties.ts  | getSingleValue                 | _getTableBorderBoxSingleValue                 |
| utils/table-properties.ts  | addDefaultUnitToNumericValue  | _addDefaultUnitToNumericValue                  |
| utils/table-properties.ts  | NormalizedDefaultProperties    | _NormalizedTableDefaultProperties              |
| utils/table-properties.ts  | NormalizeTableDefaultPropertiesOptions | _NormalizeTableDefaultPropertiesOptions  |
| utils/table-properties.ts  | getNormalizedDefaultProperties | _getNormalizedDefaultTableBaseProperties       |
| utils/table-properties.ts  | getNormalizedDefaultTableProperties | _getNormalizedDefaultTableProperties        |
| utils/table-properties.ts  | getNormalizedDefaultCellProperties | _getNormalizedDefaultTableCellProperties      |
| utils/ui/contextualballoon.ts | repositionContextualBalloon | _repositionTableContextualBalloon               |
| utils/ui/contextualballoon.ts | getBalloonTablePositionData | _getBalloonTablePositionData                    |
| utils/ui/contextualballoon.ts | getBalloonCellPositionData  | _getBalloonTableCellPositionData                 |
| utils/ui/table-properties.ts | getBorderStyleLabels        | _getBorderTableStyleLabels                       |
| utils/ui/table-properties.ts | getLocalizedColorErrorText | _getLocalizedTableColorErrorText                  |
| utils/ui/table-properties.ts | getLocalizedLengthErrorText| _getLocalizedTableLengthErrorText                 |
| utils/ui/table-properties.ts | colorFieldValidator         | _colorTableFieldValidator                          |
| utils/ui/table-properties.ts | lengthFieldValidator        | _lengthTableFieldValidator                         |
| utils/ui/table-properties.ts | lineWidthFieldValidator     | _lineWidthTableFieldValidator                      |
| utils/ui/table-properties.ts | getBorderStyleDefinitions  | _getTableOrCellBorderStyleDefinitions              |
| utils/ui/table-properties.ts | fillToolbar                | _fillTableOrCellToolbar                             |
| utils/ui/table-properties.ts | defaultColors              | _TABLE_DEFAULT_COLORS                               |
| utils/ui/table-properties.ts | getLabeledColorInputCreator | _getLabeledTableColorInputCreator                   |
| utils/ui/widget.ts          | getSelectionAffectedTableWidget | _getSelectionAffectedTableWidget                 |
| utils/ui/widget.ts          | getSelectedTableWidget      | _getSelectedTableWidget                            |
| utils/ui/widget.ts          | getTableWidgetAncestor      | _getTableWidgetAncestor                            |

---

### @ckeditor/ckeditor5-track-changes

| file                        | original method name       | re-exported method name           |
|-----------------------------|----------------------------|----------------------------------|
| suggestiondescriptionfactory.ts | DescriptionItem           | SuggestionDescriptionItem         |
| suggestiondescriptionfactory.ts | Description               | SuggestionDescription             |
| suggestiondescriptionfactory.ts | DescriptionCallback       | SuggestionDescriptionCallback     |
| suggestiondescriptionfactory.ts | LabelCallback             | SuggestionLabelCallback            |
| suggestiondescriptionfactory.ts | LabelCallbackObject       | _SuggestionLabelCallbackObject    |
| trackchangesediting.ts       | renameAttributeKey        | _TRACK_CHANGES_RENAME_ATTRIBUTE_KEY|
| trackchangesediting.ts       | FormatData                | SuggestionFormatData              |
| trackchangesediting.ts       | AttributeData             | SuggestionAttributeData           |
| ui/view/trackchangespreviewview.ts | TrackChangesPreviewView | _SuggestionsPreviewView           |

---

### @ckeditor/ckeditor5-typing

| file                    | original method name           | re-exported method name                |
|-------------------------|-------------------------------|---------------------------------------|
| deleteobserver.ts       | DeleteObserver                | _DeleteObserver                       |
| inserttextobserver.ts   | InsertTextObserver            | InsertTextObserver                    |
| textwatcher.ts          | TextWatcherMatchedDataEventData | TextWatcherMatchedTypingDataEventData |
| textwatcher.ts          | TextWatcherMatchedSelectionEvent | TextWatcherMatchedTypingSelectionEvent |
| textwatcher.ts          | TextWatcherMatchedSelectionEventData | TextWatcherMatchedTypingSelectionEventData |
| textwatcher.ts          | TextWatcherUnmatchedEvent     | TextWatcherUnmatchedTypingEvent       |
| typingconfig.ts         | TextTransformationDescription | TextTypingTransformationDescription   |
| utils/changebuffer.ts   | ChangeBuffer                  | TypingChangeBuffer                    |

---

### @ckeditor/ckeditor5-ui

| file                             | original method name                  | re-exported method name                 |
|----------------------------------|-------------------------------------|----------------------------------------|
| bindings/preventdefault.ts       | preventDefault                      | _preventUiViewDefault                  |
| colorpicker/colorpickerview.ts  | tryParseHexColor                   | _tryNormalizeHexColor                   |
| colorpicker/utils.ts             | convertColor                      | _convertColor                          |
| colorpicker/utils.ts             | convertToHex                      | _convertColorToHex                     |
| colorpicker/utils.ts             | registerCustomElement              | _registerCustomElement                 |
| dropdown/menu/dropdownmenubehaviors.ts | DropdownRootMenuBehaviors      | _DropdownRootMenuBehaviors              |
| dropdown/menu/dropdownmenubehaviors.ts | DropdownMenuBehaviors           | _DropdownMenuBehaviors                  |
| menubar/utils.ts                | MenuBarBehaviors                   | _MenuBarBehaviors                      |
| menubar/utils.ts                | MenuBarMenuBehaviors               | _MenuBarMenuBehaviors                  |
| menubar/utils.ts                | MenuBarMenuViewPanelPositioningFunctions | _MenuBarMenuViewPanelPositioningFunctions |
| menubar/utils.ts                | processMenuBarConfig               | _processMenuBarConfig                  |
| model.ts                       | Model                            | UIModel                               |
| panel/balloon/contextualballoon.ts | RotatorView                    | _ContextualBalloonRotatorView          |
| search/searchinfoview.ts       | SearchInfoView                   | _SearchInfoView                       |
| search/text/searchtextqueryview.ts | SearchTextQueryView             | _SearchTextQueryView                   |
| template.ts                   | RenderData                      | _TemplateRenderData                   |
| toolbar/toolbarview.ts        | NESTED_TOOLBAR_ICONS             | NESTED_TOOLBAR_ICONS                   |
| toolbar/toolbarview.ts        | ToolbarBehavior                  | _ToolbarBehavior                      |

### @ckeditor/ckeditor5-undo

| file             | original name    | re-exported name         |
|------------------|------------------|---------------------------|
| basecommand.ts   | BaseCommand      | UndoRedoBaseCommand      |

### @ckeditor/ckeditor5-upload

| file             | original name    | re-exported name         |
|------------------|------------------|---------------------------|
| filereader.ts    | FileReader       | FileReader                |

### @ckeditor/ckeditor5-uploadcare

| file                                   | original name          | re-exported name               |
|----------------------------------------|-------------------------|--------------------------------|
| uploadcareconfig.ts                    | ExcludedKeys           | UploadcareExcludedKeys        |
| uploadcareimageedit/uploadcareimageeditui.ts | ImageCache           | UploadcareImageCache          |

### @ckeditor/ckeditor5-utils

| file                            | original name                     | re-exported name                      |
|----------------------------------|------------------------------------|----------------------------------------|
| observablemixin.ts              | SingleBindChain                   | ObservableSingleBindChain              |
| observablemixin.ts              | DualBindChain                     | ObservableDualBindChain                |
| observablemixin.ts              | MultiBindChain                    | ObservableMultiBindChain               |
| areconnectedthroughproperties.ts| areConnectedThroughProperties     | areConnectedThroughProperties          |
| ckeditorerror.ts                | DOCUMENTATION_URL                 | DOCUMENTATION_URL                      |
| dom/getcommonancestor.ts       | getCommonAncestor                 | getCommonAncestor                      |
| dom/getpositionedancestor.ts   | getPositionedAncestor             | getPositionedAncestor                  |
| dom/global.ts                  | GlobalType                        | GlobalType                             |
| dom/global.ts                  | globalVar                         | global                                 |
| dom/iswindow.ts                | isWindow                          | isWindow                               |
| dom/position.ts                | Options                           | DomOptimalPositionOptions              |
| dom/position.ts                | PositioningFunctionResult         | DomPositioningFunctionResult           |
| dom/rect.ts                    | RectLike                          | DomRectLike                            |
| env.ts                         | getUserAgent                      | _getUserAgent                          |
| env.ts                         | isMac                             | _isMac                                 |
| env.ts                         | isWindows                         | _isWindows                             |
| env.ts                         | isGecko                           | _isGecko                               |
| env.ts                         | isSafari                          | _isSafari                              |
| env.ts                         | isiOS                             | _isiOS                                 |
| env.ts                         | isAndroid                         | _isAndroid                             |
| env.ts                         | isBlink                           | _isBlink                               |
| env.ts                         | isRegExpUnicodePropertySupported  | _isRegExpUnicodePropertySupported      |
| env.ts                         | isMediaForcedColors               | _isMediaForcedColors                   |
| env.ts                         | isMotionReduced                   | _isMotionReduced                       |
| mapsequal.ts                   | mapsEqual                         | mapsEqual                              |
| nth.ts                         | nth                               | nth                                    |
| objecttomap.ts                 | objectToMap                       | objectToMap                            |
| spy.ts                         | spy                               | spy                                    |
| translation-service.ts         | _clear                            | _clearTranslations                     |

### @ckeditor/ckeditor5-watchdog

| file               | original name             | re-exported name                   |
|--------------------|----------------------------|------------------------------------|
| contextwatchdog.ts | WatchdogItemConfiguration | ContextWatchdogItemConfiguration   |

### @ckeditor/ckeditor5-widget

| file                                | original name                       | re-exported name                        |
|-------------------------------------|--------------------------------------|------------------------------------------|
| highlightstack.ts                   | HighlightStack                      | WidgetHighlightStack                     |
| highlightstack.ts                   | HighlightStackChangeEvent           | WidgetHighlightStackChangeEvent          |
| highlightstack.ts                   | HighlightStackChangeEventData       | WidgetHighlightStackChangeEventData      |
| verticalnavigation.ts               | verticalNavigationHandler           | verticalWidgetNavigationHandler          |
| widgetresize.ts                     | ResizerOptions                      | WidgetResizerOptions                     |
| widgetresize/resizer.ts            | Resizer                             | WidgetResizer                            |
| widgetresize/resizer.ts            | ResizerBeginEvent                   | WidgetResizerBeginEvent                  |
| widgetresize/resizer.ts            | ResizerCancelEvent                  | WidgetResizerCancelEvent                 |
| widgetresize/resizer.ts            | ResizerCommitEvent                  | WidgetResizerCommitEvent                 |
| widgetresize/resizer.ts            | ResizerUpdateSizeEvent              | WidgetResizerUpdateSizeEvent             |
| widgetresize/resizerstate.ts       | ResizeState                         | WidgetResizeState                        |
| widgetresize/sizeview.ts           | SizeView                            | _WidgetSizeView                          |
| widgettypearound/utils.ts          | TYPE_AROUND_SELECTION_ATTRIBUTE     | _WIDGET_TYPE_AROUND_SELECTION_ATTRIBUTE  |
| widgettypearound/utils.ts          | isTypeAroundWidget                  | isTypeAroundWidget                       |
| widgettypearound/utils.ts          | getClosestTypeAroundDomButton       | _getClosestWidgetTypeAroundDomButton     |
| widgettypearound/utils.ts          | getTypeAroundButtonPosition         | _getWidgetTypeAroundButtonPosition       |
| widgettypearound/utils.ts          | getClosestWidgetViewElement         | _getClosestWidgetViewElement             |
| widgettypearound/utils.ts          | getTypeAroundFakeCaretPosition      | _getWidgetTypeAroundFakeCaretPosition    |

### @ckeditor/ckeditor5-word-count

| file     | original name           | re-exported name            |
|----------|--------------------------|------------------------------|
| utils.ts | modelElementToPlainText  | _modelElementToPlainText     |
