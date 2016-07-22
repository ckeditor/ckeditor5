@bender-ui: collapsed
@bender-tags: view
* Expected initialization: `foo{}bar`.
* Press some keys - nothing should be added to editor's contents.
* Check whether key events are logged to the console with proper data:
  * `keyCode`,
  * `altKey`,
  * `ctrlKey` (covers <kbd>Ctrl</kbd> and <kbd>Cmd</kbd>),
  * `shitKey`,
  * `domTarget` and `target`.
