"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/karyawan/riwayat/route";
exports.ids = ["app/api/karyawan/riwayat/route"];
exports.modules = {

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "./action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "./request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "./static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fkaryawan%2Friwayat%2Froute&page=%2Fapi%2Fkaryawan%2Friwayat%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fkaryawan%2Friwayat%2Froute.js&appDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fkaryawan%2Friwayat%2Froute&page=%2Fapi%2Fkaryawan%2Friwayat%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fkaryawan%2Friwayat%2Froute.js&appDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_GA_HRGA_APPS_hrga_apps_app_api_karyawan_riwayat_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/karyawan/riwayat/route.js */ \"(rsc)/./app/api/karyawan/riwayat/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/karyawan/riwayat/route\",\n        pathname: \"/api/karyawan/riwayat\",\n        filename: \"route\",\n        bundlePath: \"app/api/karyawan/riwayat/route\"\n    },\n    resolvedPagePath: \"D:\\\\GA\\\\HRGA APPS\\\\hrga_apps\\\\app\\\\api\\\\karyawan\\\\riwayat\\\\route.js\",\n    nextConfigOutput,\n    userland: D_GA_HRGA_APPS_hrga_apps_app_api_karyawan_riwayat_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/karyawan/riwayat/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZrYXJ5YXdhbiUyRnJpd2F5YXQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmthcnlhd2FuJTJGcml3YXlhdCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmthcnlhd2FuJTJGcml3YXlhdCUyRnJvdXRlLmpzJmFwcERpcj1EJTNBJTVDR0ElNUNIUkdBJTIwQVBQUyU1Q2hyZ2FfYXBwcyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9RCUzQSU1Q0dBJTVDSFJHQSUyMEFQUFMlNUNocmdhX2FwcHMmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ21CO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaHJnYS1hcHBzLz9iNGJiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXEdBXFxcXEhSR0EgQVBQU1xcXFxocmdhX2FwcHNcXFxcYXBwXFxcXGFwaVxcXFxrYXJ5YXdhblxcXFxyaXdheWF0XFxcXHJvdXRlLmpzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9rYXJ5YXdhbi9yaXdheWF0L3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkva2FyeWF3YW4vcml3YXlhdFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkva2FyeWF3YW4vcml3YXlhdC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXEdBXFxcXEhSR0EgQVBQU1xcXFxocmdhX2FwcHNcXFxcYXBwXFxcXGFwaVxcXFxrYXJ5YXdhblxcXFxyaXdheWF0XFxcXHJvdXRlLmpzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9rYXJ5YXdhbi9yaXdheWF0L3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fkaryawan%2Friwayat%2Froute&page=%2Fapi%2Fkaryawan%2Friwayat%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fkaryawan%2Friwayat%2Froute.js&appDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/karyawan/riwayat/route.js":
/*!*******************************************!*\
  !*** ./app/api/karyawan/riwayat/route.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./lib/db.js\");\n/* harmony import */ var _models_RiwayatJabatan__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/models/RiwayatJabatan */ \"(rsc)/./models/RiwayatJabatan.js\");\n\n\n\n\n\nasync function GET() {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    await (0,_lib_db__WEBPACK_IMPORTED_MODULE_3__[\"default\"])();\n    const data = await _models_RiwayatJabatan__WEBPACK_IMPORTED_MODULE_4__[\"default\"].find().sort({\n        tanggalMulai: -1\n    }).populate(\"karyawanId\", \"nama nik\");\n    const result = data.map((r)=>{\n        const item = r.toJSON();\n        item.karyawan = item.karyawanId;\n        delete item.karyawanId;\n        return item;\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(result);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2thcnlhd2FuL3Jpd2F5YXQvcm91dGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUEwQztBQUNFO0FBQ0o7QUFDUjtBQUNvQjtBQUU3QyxlQUFlSztJQUNwQixNQUFNQyxVQUFVLE1BQU1MLDJEQUFnQkEsQ0FBQ0Msa0RBQVdBO0lBQ2xELElBQUksQ0FBQ0ksU0FBUyxPQUFPTixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1FBQUVDLE9BQU87SUFBZSxHQUFHO1FBQUVDLFFBQVE7SUFBSTtJQUVoRixNQUFNTixtREFBU0E7SUFFZixNQUFNTyxPQUFPLE1BQU1OLDhEQUFjQSxDQUFDTyxJQUFJLEdBQ25DQyxJQUFJLENBQUM7UUFBRUMsY0FBYyxDQUFDO0lBQUUsR0FDeEJDLFFBQVEsQ0FBQyxjQUFjO0lBRTFCLE1BQU1DLFNBQVNMLEtBQUtNLEdBQUcsQ0FBQyxDQUFDQztRQUN2QixNQUFNQyxPQUFPRCxFQUFFRSxNQUFNO1FBQ3JCRCxLQUFLRSxRQUFRLEdBQUdGLEtBQUtHLFVBQVU7UUFDL0IsT0FBT0gsS0FBS0csVUFBVTtRQUN0QixPQUFPSDtJQUNUO0lBRUEsT0FBT2xCLHFEQUFZQSxDQUFDTyxJQUFJLENBQUNRO0FBQzNCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaHJnYS1hcHBzLy4vYXBwL2FwaS9rYXJ5YXdhbi9yaXdheWF0L3JvdXRlLmpzP2ZhYTUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5pbXBvcnQgeyBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSAnbmV4dC1hdXRoJ1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICdAL2xpYi9hdXRoJ1xuaW1wb3J0IGRiQ29ubmVjdCBmcm9tICdAL2xpYi9kYidcbmltcG9ydCBSaXdheWF0SmFiYXRhbiBmcm9tICdAL21vZGVscy9SaXdheWF0SmFiYXRhbidcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVCgpIHtcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXG4gIGlmICghc2Vzc2lvbikgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH0sIHsgc3RhdHVzOiA0MDEgfSlcblxuICBhd2FpdCBkYkNvbm5lY3QoKVxuXG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBSaXdheWF0SmFiYXRhbi5maW5kKClcbiAgICAuc29ydCh7IHRhbmdnYWxNdWxhaTogLTEgfSlcbiAgICAucG9wdWxhdGUoJ2thcnlhd2FuSWQnLCAnbmFtYSBuaWsnKVxuXG4gIGNvbnN0IHJlc3VsdCA9IGRhdGEubWFwKChyKSA9PiB7XG4gICAgY29uc3QgaXRlbSA9IHIudG9KU09OKClcbiAgICBpdGVtLmthcnlhd2FuID0gaXRlbS5rYXJ5YXdhbklkXG4gICAgZGVsZXRlIGl0ZW0ua2FyeWF3YW5JZFxuICAgIHJldHVybiBpdGVtXG4gIH0pXG5cbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHJlc3VsdClcbn0iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2VydmVyU2Vzc2lvbiIsImF1dGhPcHRpb25zIiwiZGJDb25uZWN0IiwiUml3YXlhdEphYmF0YW4iLCJHRVQiLCJzZXNzaW9uIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwiZGF0YSIsImZpbmQiLCJzb3J0IiwidGFuZ2dhbE11bGFpIiwicG9wdWxhdGUiLCJyZXN1bHQiLCJtYXAiLCJyIiwiaXRlbSIsInRvSlNPTiIsImthcnlhd2FuIiwia2FyeWF3YW5JZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/karyawan/riwayat/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/auth.js":
/*!*********************!*\
  !*** ./lib/auth.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _db__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./db */ \"(rsc)/./lib/db.js\");\n/* harmony import */ var _models_User__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/models/User */ \"(rsc)/./models/User.js\");\n\n\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Email dan password harus diisi\");\n                }\n                await (0,_db__WEBPACK_IMPORTED_MODULE_3__[\"default\"])();\n                const user = await _models_User__WEBPACK_IMPORTED_MODULE_4__[\"default\"].findOne({\n                    email: credentials.email\n                });\n                if (!user || !user.isActive) {\n                    throw new Error(\"Email atau password salah\");\n                }\n                const isPasswordValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_2___default().compare(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Email atau password salah\");\n                }\n                return {\n                    id: user._id.toString(),\n                    name: user.name,\n                    email: user.email,\n                    role: user.role\n                };\n            }\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role;\n                token.id = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token) {\n                session.user.role = token.role;\n                session.user.id = token.id;\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    session: {\n        strategy: \"jwt\"\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBZ0M7QUFDaUM7QUFDcEM7QUFDRDtBQUNJO0FBRXpCLE1BQU1LLGNBQWM7SUFDekJDLFdBQVc7UUFDVEwsMkVBQW1CQSxDQUFDO1lBQ2xCTSxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVU7b0JBQ2pELE1BQU0sSUFBSUUsTUFBTTtnQkFDbEI7Z0JBRUEsTUFBTVgsK0NBQVNBO2dCQUNmLE1BQU1ZLE9BQU8sTUFBTVgsb0RBQUlBLENBQUNZLE9BQU8sQ0FBQztvQkFBRVAsT0FBT0QsWUFBWUMsS0FBSztnQkFBQztnQkFFM0QsSUFBSSxDQUFDTSxRQUFRLENBQUNBLEtBQUtFLFFBQVEsRUFBRTtvQkFDM0IsTUFBTSxJQUFJSCxNQUFNO2dCQUNsQjtnQkFFQSxNQUFNSSxrQkFBa0IsTUFBTWhCLHVEQUFjLENBQUNNLFlBQVlJLFFBQVEsRUFBRUcsS0FBS0gsUUFBUTtnQkFFaEYsSUFBSSxDQUFDTSxpQkFBaUI7b0JBQ3BCLE1BQU0sSUFBSUosTUFBTTtnQkFDbEI7Z0JBRUEsT0FBTztvQkFDTE0sSUFBSUwsS0FBS00sR0FBRyxDQUFDQyxRQUFRO29CQUNyQmYsTUFBTVEsS0FBS1IsSUFBSTtvQkFDZkUsT0FBT00sS0FBS04sS0FBSztvQkFDakJjLE1BQU1SLEtBQUtRLElBQUk7Z0JBQ2pCO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRVgsSUFBSSxFQUFFO1lBQ3ZCLElBQUlBLE1BQU07Z0JBQ1JXLE1BQU1ILElBQUksR0FBR1IsS0FBS1EsSUFBSTtnQkFDdEJHLE1BQU1OLEVBQUUsR0FBR0wsS0FBS0ssRUFBRTtZQUNwQjtZQUNBLE9BQU9NO1FBQ1Q7UUFDQSxNQUFNQyxTQUFRLEVBQUVBLE9BQU8sRUFBRUQsS0FBSyxFQUFFO1lBQzlCLElBQUlBLE9BQU87Z0JBQ1RDLFFBQVFaLElBQUksQ0FBQ1EsSUFBSSxHQUFHRyxNQUFNSCxJQUFJO2dCQUM5QkksUUFBUVosSUFBSSxDQUFDSyxFQUFFLEdBQUdNLE1BQU1OLEVBQUU7WUFDNUI7WUFDQSxPQUFPTztRQUNUO0lBQ0Y7SUFDQUMsT0FBTztRQUNMQyxRQUFRO1FBQ1JDLE9BQU87SUFDVDtJQUNBSCxTQUFTO1FBQ1BJLFVBQVU7SUFDWjtJQUNBQyxRQUFRQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7QUFDckMsRUFBQztBQUVELGlFQUFlbkMsZ0RBQVFBLENBQUNLLFlBQVlBLEVBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ocmdhLWFwcHMvLi9saWIvYXV0aC5qcz8yODdiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tICduZXh0LWF1dGgnXG5pbXBvcnQgQ3JlZGVudGlhbHNQcm92aWRlciBmcm9tICduZXh0LWF1dGgvcHJvdmlkZXJzL2NyZWRlbnRpYWxzJ1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcydcbmltcG9ydCBkYkNvbm5lY3QgZnJvbSAnLi9kYidcbmltcG9ydCBVc2VyIGZyb20gJ0AvbW9kZWxzL1VzZXInXG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9ucyA9IHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICBuYW1lOiAnY3JlZGVudGlhbHMnLFxuICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6ICdFbWFpbCcsIHR5cGU6ICdlbWFpbCcgfSxcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6ICdQYXNzd29yZCcsIHR5cGU6ICdwYXNzd29yZCcgfSxcbiAgICAgIH0sXG4gICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5wYXNzd29yZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW1haWwgZGFuIHBhc3N3b3JkIGhhcnVzIGRpaXNpJylcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGRiQ29ubmVjdCgpXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwgfSlcblxuICAgICAgICBpZiAoIXVzZXIgfHwgIXVzZXIuaXNBY3RpdmUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VtYWlsIGF0YXUgcGFzc3dvcmQgc2FsYWgnKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNQYXNzd29yZFZhbGlkID0gYXdhaXQgYmNyeXB0LmNvbXBhcmUoY3JlZGVudGlhbHMucGFzc3dvcmQsIHVzZXIucGFzc3dvcmQpXG5cbiAgICAgICAgaWYgKCFpc1Bhc3N3b3JkVmFsaWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VtYWlsIGF0YXUgcGFzc3dvcmQgc2FsYWgnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5faWQudG9TdHJpbmcoKSxcbiAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgcm9sZTogdXNlci5yb2xlLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICBpZiAodXNlcikge1xuICAgICAgICB0b2tlbi5yb2xlID0gdXNlci5yb2xlXG4gICAgICAgIHRva2VuLmlkID0gdXNlci5pZFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuXG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIHNlc3Npb24udXNlci5yb2xlID0gdG9rZW4ucm9sZVxuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZFxuICAgICAgfVxuICAgICAgcmV0dXJuIHNlc3Npb25cbiAgICB9LFxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogJy9sb2dpbicsXG4gICAgZXJyb3I6ICcvbG9naW4nLFxuICB9LFxuICBzZXNzaW9uOiB7XG4gICAgc3RyYXRlZ3k6ICdqd3QnLFxuICB9LFxuICBzZWNyZXQ6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCxcbn1cblxuZXhwb3J0IGRlZmF1bHQgTmV4dEF1dGgoYXV0aE9wdGlvbnMpXG4iXSwibmFtZXMiOlsiTmV4dEF1dGgiLCJDcmVkZW50aWFsc1Byb3ZpZGVyIiwiYmNyeXB0IiwiZGJDb25uZWN0IiwiVXNlciIsImF1dGhPcHRpb25zIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsIkVycm9yIiwidXNlciIsImZpbmRPbmUiLCJpc0FjdGl2ZSIsImlzUGFzc3dvcmRWYWxpZCIsImNvbXBhcmUiLCJpZCIsIl9pZCIsInRvU3RyaW5nIiwicm9sZSIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic2Vzc2lvbiIsInBhZ2VzIiwic2lnbkluIiwiZXJyb3IiLCJzdHJhdGVneSIsInNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.js\n");

/***/ }),

/***/ "(rsc)/./lib/db.js":
/*!*******************!*\
  !*** ./lib/db.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst MONGODB_URI = process.env.MONGODB_URI;\nif (!MONGODB_URI) {\n    throw new Error(\"Please define the MONGODB_URI environment variable\");\n}\nlet cached = global.mongoose;\nif (!cached) {\n    cached = global.mongoose = {\n        conn: null,\n        promise: null\n    };\n}\nasync function dbConnect() {\n    if (cached.conn) return cached.conn;\n    if (!cached.promise) {\n        cached.promise = mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(MONGODB_URI, {\n            bufferCommands: false\n        }).then((m)=>m);\n    }\n    try {\n        cached.conn = await cached.promise;\n    } catch (e) {\n        cached.promise = null;\n        throw e;\n    }\n    return cached.conn;\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (dbConnect);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQStCO0FBRS9CLE1BQU1DLGNBQWNDLFFBQVFDLEdBQUcsQ0FBQ0YsV0FBVztBQUUzQyxJQUFJLENBQUNBLGFBQWE7SUFDaEIsTUFBTSxJQUFJRyxNQUFNO0FBQ2xCO0FBRUEsSUFBSUMsU0FBU0MsT0FBT04sUUFBUTtBQUU1QixJQUFJLENBQUNLLFFBQVE7SUFDWEEsU0FBU0MsT0FBT04sUUFBUSxHQUFHO1FBQUVPLE1BQU07UUFBTUMsU0FBUztJQUFLO0FBQ3pEO0FBRUEsZUFBZUM7SUFDYixJQUFJSixPQUFPRSxJQUFJLEVBQUUsT0FBT0YsT0FBT0UsSUFBSTtJQUVuQyxJQUFJLENBQUNGLE9BQU9HLE9BQU8sRUFBRTtRQUNuQkgsT0FBT0csT0FBTyxHQUFHUix1REFDUCxDQUFDQyxhQUFhO1lBQUVVLGdCQUFnQjtRQUFNLEdBQzdDQyxJQUFJLENBQUMsQ0FBQ0MsSUFBTUE7SUFDakI7SUFFQSxJQUFJO1FBQ0ZSLE9BQU9FLElBQUksR0FBRyxNQUFNRixPQUFPRyxPQUFPO0lBQ3BDLEVBQUUsT0FBT00sR0FBRztRQUNWVCxPQUFPRyxPQUFPLEdBQUc7UUFDakIsTUFBTU07SUFDUjtJQUVBLE9BQU9ULE9BQU9FLElBQUk7QUFDcEI7QUFFQSxpRUFBZUUsU0FBU0EsRUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL2hyZ2EtYXBwcy8uL2xpYi9kYi5qcz8zZGM5Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSdcblxuY29uc3QgTU9OR09EQl9VUkkgPSBwcm9jZXNzLmVudi5NT05HT0RCX1VSSVxuXG5pZiAoIU1PTkdPREJfVVJJKSB7XG4gIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGRlZmluZSB0aGUgTU9OR09EQl9VUkkgZW52aXJvbm1lbnQgdmFyaWFibGUnKVxufVxuXG5sZXQgY2FjaGVkID0gZ2xvYmFsLm1vbmdvb3NlXG5cbmlmICghY2FjaGVkKSB7XG4gIGNhY2hlZCA9IGdsb2JhbC5tb25nb29zZSA9IHsgY29ubjogbnVsbCwgcHJvbWlzZTogbnVsbCB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRiQ29ubmVjdCgpIHtcbiAgaWYgKGNhY2hlZC5jb25uKSByZXR1cm4gY2FjaGVkLmNvbm5cblxuICBpZiAoIWNhY2hlZC5wcm9taXNlKSB7XG4gICAgY2FjaGVkLnByb21pc2UgPSBtb25nb29zZVxuICAgICAgLmNvbm5lY3QoTU9OR09EQl9VUkksIHsgYnVmZmVyQ29tbWFuZHM6IGZhbHNlIH0pXG4gICAgICAudGhlbigobSkgPT4gbSlcbiAgfVxuXG4gIHRyeSB7XG4gICAgY2FjaGVkLmNvbm4gPSBhd2FpdCBjYWNoZWQucHJvbWlzZVxuICB9IGNhdGNoIChlKSB7XG4gICAgY2FjaGVkLnByb21pc2UgPSBudWxsXG4gICAgdGhyb3cgZVxuICB9XG5cbiAgcmV0dXJuIGNhY2hlZC5jb25uXG59XG5cbmV4cG9ydCBkZWZhdWx0IGRiQ29ubmVjdFxuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwiTU9OR09EQl9VUkkiLCJwcm9jZXNzIiwiZW52IiwiRXJyb3IiLCJjYWNoZWQiLCJnbG9iYWwiLCJjb25uIiwicHJvbWlzZSIsImRiQ29ubmVjdCIsImNvbm5lY3QiLCJidWZmZXJDb21tYW5kcyIsInRoZW4iLCJtIiwiZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.js\n");

/***/ }),

/***/ "(rsc)/./models/RiwayatJabatan.js":
/*!**********************************!*\
  !*** ./models/RiwayatJabatan.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst riwayatJabatanSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    karyawanId: {\n        type: (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema).Types.ObjectId,\n        ref: \"Karyawan\",\n        required: true\n    },\n    jabatan: {\n        type: String,\n        required: true\n    },\n    departemen: {\n        type: String,\n        default: null\n    },\n    tanggalMulai: {\n        type: Date,\n        required: true\n    },\n    tanggalSelesai: {\n        type: Date,\n        default: null\n    },\n    keterangan: {\n        type: String,\n        default: null\n    }\n}, {\n    timestamps: true,\n    toJSON: {\n        virtuals: true,\n        transform: (_, ret)=>{\n            delete ret._id;\n            delete ret.__v;\n            return ret;\n        }\n    }\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).RiwayatJabatan || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"RiwayatJabatan\", riwayatJabatanSchema));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9tb2RlbHMvUml3YXlhdEphYmF0YW4uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQStCO0FBRS9CLE1BQU1DLHVCQUF1QixJQUFJRCx3REFBZSxDQUM5QztJQUNFRyxZQUFZO1FBQUVDLE1BQU1KLHdEQUFlLENBQUNLLEtBQUssQ0FBQ0MsUUFBUTtRQUFFQyxLQUFLO1FBQVlDLFVBQVU7SUFBSztJQUNwRkMsU0FBUztRQUFFTCxNQUFNTTtRQUFRRixVQUFVO0lBQUs7SUFDeENHLFlBQVk7UUFBRVAsTUFBTU07UUFBUUUsU0FBUztJQUFLO0lBQzFDQyxjQUFjO1FBQUVULE1BQU1VO1FBQU1OLFVBQVU7SUFBSztJQUMzQ08sZ0JBQWdCO1FBQUVYLE1BQU1VO1FBQU1GLFNBQVM7SUFBSztJQUM1Q0ksWUFBWTtRQUFFWixNQUFNTTtRQUFRRSxTQUFTO0lBQUs7QUFDNUMsR0FDQTtJQUNFSyxZQUFZO0lBQ1pDLFFBQVE7UUFDTkMsVUFBVTtRQUNWQyxXQUFXLENBQUNDLEdBQUdDO1lBQ2IsT0FBT0EsSUFBSUMsR0FBRztZQUNkLE9BQU9ELElBQUlFLEdBQUc7WUFDZCxPQUFPRjtRQUNUO0lBQ0Y7QUFDRjtBQUdGLGlFQUFldEIsd0RBQWUsQ0FBQzBCLGNBQWMsSUFBSTFCLHFEQUFjLENBQUMsa0JBQWtCQyxxQkFBcUJBLEVBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ocmdhLWFwcHMvLi9tb2RlbHMvUml3YXlhdEphYmF0YW4uanM/M2E0YyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9uZ29vc2UgZnJvbSAnbW9uZ29vc2UnXG5cbmNvbnN0IHJpd2F5YXRKYWJhdGFuU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYShcbiAge1xuICAgIGthcnlhd2FuSWQ6IHsgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk9iamVjdElkLCByZWY6ICdLYXJ5YXdhbicsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgamFiYXRhbjogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgZGVwYXJ0ZW1lbjogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwgfSxcbiAgICB0YW5nZ2FsTXVsYWk6IHsgdHlwZTogRGF0ZSwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICB0YW5nZ2FsU2VsZXNhaTogeyB0eXBlOiBEYXRlLCBkZWZhdWx0OiBudWxsIH0sXG4gICAga2V0ZXJhbmdhbjogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwgfSxcbiAgfSxcbiAge1xuICAgIHRpbWVzdGFtcHM6IHRydWUsXG4gICAgdG9KU09OOiB7XG4gICAgICB2aXJ0dWFsczogdHJ1ZSxcbiAgICAgIHRyYW5zZm9ybTogKF8sIHJldCkgPT4ge1xuICAgICAgICBkZWxldGUgcmV0Ll9pZFxuICAgICAgICBkZWxldGUgcmV0Ll9fdlxuICAgICAgICByZXR1cm4gcmV0XG4gICAgICB9LFxuICAgIH0sXG4gIH1cbilcblxuZXhwb3J0IGRlZmF1bHQgbW9uZ29vc2UubW9kZWxzLlJpd2F5YXRKYWJhdGFuIHx8IG1vbmdvb3NlLm1vZGVsKCdSaXdheWF0SmFiYXRhbicsIHJpd2F5YXRKYWJhdGFuU2NoZW1hKVxuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwicml3YXlhdEphYmF0YW5TY2hlbWEiLCJTY2hlbWEiLCJrYXJ5YXdhbklkIiwidHlwZSIsIlR5cGVzIiwiT2JqZWN0SWQiLCJyZWYiLCJyZXF1aXJlZCIsImphYmF0YW4iLCJTdHJpbmciLCJkZXBhcnRlbWVuIiwiZGVmYXVsdCIsInRhbmdnYWxNdWxhaSIsIkRhdGUiLCJ0YW5nZ2FsU2VsZXNhaSIsImtldGVyYW5nYW4iLCJ0aW1lc3RhbXBzIiwidG9KU09OIiwidmlydHVhbHMiLCJ0cmFuc2Zvcm0iLCJfIiwicmV0IiwiX2lkIiwiX192IiwibW9kZWxzIiwiUml3YXlhdEphYmF0YW4iLCJtb2RlbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./models/RiwayatJabatan.js\n");

/***/ }),

/***/ "(rsc)/./models/User.js":
/*!************************!*\
  !*** ./models/User.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst userSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    name: {\n        type: String,\n        required: true\n    },\n    email: {\n        type: String,\n        required: true,\n        unique: true\n    },\n    password: {\n        type: String,\n        required: true\n    },\n    role: {\n        type: String,\n        enum: [\n            \"ADMIN\",\n            \"STAFF\"\n        ],\n        default: \"STAFF\"\n    },\n    isActive: {\n        type: Boolean,\n        default: true\n    }\n}, {\n    timestamps: true,\n    toJSON: {\n        virtuals: true,\n        transform: (_, ret)=>{\n            delete ret._id;\n            delete ret.__v;\n            return ret;\n        }\n    }\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).User || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"User\", userSchema));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9tb2RlbHMvVXNlci5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBK0I7QUFFL0IsTUFBTUMsYUFBYSxJQUFJRCx3REFBZSxDQUNwQztJQUNFRyxNQUFNO1FBQUVDLE1BQU1DO1FBQVFDLFVBQVU7SUFBSztJQUNyQ0MsT0FBTztRQUFFSCxNQUFNQztRQUFRQyxVQUFVO1FBQU1FLFFBQVE7SUFBSztJQUNwREMsVUFBVTtRQUFFTCxNQUFNQztRQUFRQyxVQUFVO0lBQUs7SUFDekNJLE1BQU07UUFBRU4sTUFBTUM7UUFBUU0sTUFBTTtZQUFDO1lBQVM7U0FBUTtRQUFFQyxTQUFTO0lBQVE7SUFDakVDLFVBQVU7UUFBRVQsTUFBTVU7UUFBU0YsU0FBUztJQUFLO0FBQzNDLEdBQ0E7SUFDRUcsWUFBWTtJQUNaQyxRQUFRO1FBQ05DLFVBQVU7UUFDVkMsV0FBVyxDQUFDQyxHQUFHQztZQUNiLE9BQU9BLElBQUlDLEdBQUc7WUFDZCxPQUFPRCxJQUFJRSxHQUFHO1lBQ2QsT0FBT0Y7UUFDVDtJQUNGO0FBQ0Y7QUFHRixpRUFBZXBCLHdEQUFlLENBQUN3QixJQUFJLElBQUl4QixxREFBYyxDQUFDLFFBQVFDLFdBQVdBLEVBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ocmdhLWFwcHMvLi9tb2RlbHMvVXNlci5qcz83MzY3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSdcblxuY29uc3QgdXNlclNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoXG4gIHtcbiAgICBuYW1lOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICBlbWFpbDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlLCB1bmlxdWU6IHRydWUgfSxcbiAgICBwYXNzd29yZDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgcm9sZTogeyB0eXBlOiBTdHJpbmcsIGVudW06IFsnQURNSU4nLCAnU1RBRkYnXSwgZGVmYXVsdDogJ1NUQUZGJyB9LFxuICAgIGlzQWN0aXZlOiB7IHR5cGU6IEJvb2xlYW4sIGRlZmF1bHQ6IHRydWUgfSxcbiAgfSxcbiAge1xuICAgIHRpbWVzdGFtcHM6IHRydWUsXG4gICAgdG9KU09OOiB7XG4gICAgICB2aXJ0dWFsczogdHJ1ZSxcbiAgICAgIHRyYW5zZm9ybTogKF8sIHJldCkgPT4ge1xuICAgICAgICBkZWxldGUgcmV0Ll9pZFxuICAgICAgICBkZWxldGUgcmV0Ll9fdlxuICAgICAgICByZXR1cm4gcmV0XG4gICAgICB9LFxuICAgIH0sXG4gIH1cbilcblxuZXhwb3J0IGRlZmF1bHQgbW9uZ29vc2UubW9kZWxzLlVzZXIgfHwgbW9uZ29vc2UubW9kZWwoJ1VzZXInLCB1c2VyU2NoZW1hKVxuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwidXNlclNjaGVtYSIsIlNjaGVtYSIsIm5hbWUiLCJ0eXBlIiwiU3RyaW5nIiwicmVxdWlyZWQiLCJlbWFpbCIsInVuaXF1ZSIsInBhc3N3b3JkIiwicm9sZSIsImVudW0iLCJkZWZhdWx0IiwiaXNBY3RpdmUiLCJCb29sZWFuIiwidGltZXN0YW1wcyIsInRvSlNPTiIsInZpcnR1YWxzIiwidHJhbnNmb3JtIiwiXyIsInJldCIsIl9pZCIsIl9fdiIsIm1vZGVscyIsIlVzZXIiLCJtb2RlbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./models/User.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fkaryawan%2Friwayat%2Froute&page=%2Fapi%2Fkaryawan%2Friwayat%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fkaryawan%2Friwayat%2Froute.js&appDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();