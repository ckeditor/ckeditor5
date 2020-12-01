# DLL sample

The sample requires building:

1. Base DLL using `yarn run build:dll`.
2. The DLL consumer plugin `yarn run build:dll-sample`.
3. *External* classic editor DLL build from `packages/ckeditor5-dll-classic`.

Notes:

* The order of steps 2 & 3 is not important.
* If the interface of DLL is not changed (only the version update) the steps 2 & 3 _should be_ optional. In other words if the exports stays the same the DLL consumers do not need to be rebuilt.
* Steps 1 & 2 can be run together as `yarn run build`.
