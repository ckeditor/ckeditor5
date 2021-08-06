# Slot conversion

The editor should be loaded with a "box" element that contains multiple "slots" in which user can edit content.

An additional converter adds `"data-insert-count"` attribute to view elements to show when it was rendered. It is displayed with a CSS at the top-right corner of rendered element. If a view element was not re-rendered this attribute should not change. *Note*: it only acts on "insert" changes so it can omit attribute-to-element changes or insertions not passed through dispatcher.

Observe which view elements are re-rendered when using UI-buttons:

* `Box title` - updates title attribute which triggers re-rendering of a "box".
* `Box author` - updates author attribute which triggers re-rendering of a "box".
* `+` - adds "slot" to box"  which triggers re-rendering of a "box".
* `-` - removes "slot" from box" which triggers re-rendering of a "box".
