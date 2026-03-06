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
exports.id = "app/api/dashboard/route";
exports.ids = ["app/api/dashboard/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("bcryptjs");

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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.js&appDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.js&appDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_GA_HRGA_APPS_hrga_apps_app_api_dashboard_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/dashboard/route.js */ \"(rsc)/./app/api/dashboard/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/dashboard/route\",\n        pathname: \"/api/dashboard\",\n        filename: \"route\",\n        bundlePath: \"app/api/dashboard/route\"\n    },\n    resolvedPagePath: \"D:\\\\GA\\\\HRGA APPS\\\\hrga_apps\\\\app\\\\api\\\\dashboard\\\\route.js\",\n    nextConfigOutput,\n    userland: D_GA_HRGA_APPS_hrga_apps_app_api_dashboard_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/dashboard/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZkYXNoYm9hcmQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmRhc2hib2FyZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmRhc2hib2FyZCUyRnJvdXRlLmpzJmFwcERpcj1EJTNBJTVDR0ElNUNIUkdBJTIwQVBQUyU1Q2hyZ2FfYXBwcyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9RCUzQSU1Q0dBJTVDSFJHQSUyMEFQUFMlNUNocmdhX2FwcHMmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ1c7QUFDeEY7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxpRUFBaUU7QUFDekU7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUN1SDs7QUFFdkgiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ocmdhLWFwcHMvPzg1YWEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiRDpcXFxcR0FcXFxcSFJHQSBBUFBTXFxcXGhyZ2FfYXBwc1xcXFxhcHBcXFxcYXBpXFxcXGRhc2hib2FyZFxcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvZGFzaGJvYXJkL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvZGFzaGJvYXJkXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9kYXNoYm9hcmQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJEOlxcXFxHQVxcXFxIUkdBIEFQUFNcXFxcaHJnYV9hcHBzXFxcXGFwcFxcXFxhcGlcXFxcZGFzaGJvYXJkXFxcXHJvdXRlLmpzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9kYXNoYm9hcmQvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.js&appDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/dashboard/route.js":
/*!************************************!*\
  !*** ./app/api/dashboard/route.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.js\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.js\");\n/* harmony import */ var _barrel_optimize_names_addDays_endOfMonth_startOfMonth_subMonths_date_fns__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! __barrel_optimize__?names=addDays,endOfMonth,startOfMonth,subMonths!=!date-fns */ \"(rsc)/./node_modules/date-fns/addDays.mjs\");\n/* harmony import */ var _barrel_optimize_names_addDays_endOfMonth_startOfMonth_subMonths_date_fns__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! __barrel_optimize__?names=addDays,endOfMonth,startOfMonth,subMonths!=!date-fns */ \"(rsc)/./node_modules/date-fns/subMonths.mjs\");\n/* harmony import */ var _barrel_optimize_names_addDays_endOfMonth_startOfMonth_subMonths_date_fns__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! __barrel_optimize__?names=addDays,endOfMonth,startOfMonth,subMonths!=!date-fns */ \"(rsc)/./node_modules/date-fns/endOfMonth.mjs\");\n\n\n\n\n\nasync function GET() {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    try {\n        const now = new Date();\n        const thirtyDaysLater = (0,_barrel_optimize_names_addDays_endOfMonth_startOfMonth_subMonths_date_fns__WEBPACK_IMPORTED_MODULE_4__.addDays)(now, 30);\n        const [totalKaryawan, karyawanAktif, kontrakBerakhir, totalAset, asetDipinjam, maintenancePending, totalKendaraan, kendaraanTersedia, pajakJatuhTempo, notifikasiUnread, recentAudit, asetByKategori, monthlyUtilitas] = await Promise.all([\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].karyawan.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].karyawan.count({\n                where: {\n                    statusAktif: true\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].karyawan.count({\n                where: {\n                    tanggalKontrakBerakhir: {\n                        gte: now,\n                        lte: thirtyDaysLater\n                    },\n                    statusAktif: true\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].aset.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].aset.count({\n                where: {\n                    status: \"DIPINJAM\"\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].maintenanceRequest.count({\n                where: {\n                    status: {\n                        in: [\n                            \"PENDING\",\n                            \"PROSES\"\n                        ]\n                    }\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].kendaraan.count(),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].kendaraan.count({\n                where: {\n                    status: \"TERSEDIA\"\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].pembayaranPajak.count({\n                where: {\n                    status: \"BELUM\",\n                    tanggalJatuhTempo: {\n                        gte: now,\n                        lte: thirtyDaysLater\n                    }\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].notifikasi.count({\n                where: {\n                    status: \"BELUM_DIBACA\"\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].auditLog.findMany({\n                take: 5,\n                orderBy: {\n                    createdAt: \"desc\"\n                },\n                include: {\n                    user: {\n                        select: {\n                            name: true\n                        }\n                    }\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].aset.groupBy({\n                by: [\n                    \"kategori\"\n                ],\n                _count: {\n                    id: true\n                }\n            }),\n            _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].utilitas.groupBy({\n                by: [\n                    \"jenis\"\n                ],\n                where: {\n                    bulan: now.getMonth() + 1,\n                    tahun: now.getFullYear()\n                },\n                _sum: {\n                    tagihan: true\n                }\n            })\n        ]);\n        // Karyawan by contract status\n        const karyawanByKontrak = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].karyawan.groupBy({\n            by: [\n                \"statusKontrak\"\n            ],\n            where: {\n                statusAktif: true\n            },\n            _count: {\n                id: true\n            }\n        });\n        // Monthly karyawan trend (last 6 months)\n        const monthlyKaryawan = [];\n        for(let i = 5; i >= 0; i--){\n            const date = (0,_barrel_optimize_names_addDays_endOfMonth_startOfMonth_subMonths_date_fns__WEBPACK_IMPORTED_MODULE_5__.subMonths)(now, i);\n            const count = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].karyawan.count({\n                where: {\n                    tanggalMasuk: {\n                        lte: (0,_barrel_optimize_names_addDays_endOfMonth_startOfMonth_subMonths_date_fns__WEBPACK_IMPORTED_MODULE_6__.endOfMonth)(date)\n                    }\n                }\n            });\n            monthlyKaryawan.push({\n                month: date.toLocaleString(\"id-ID\", {\n                    month: \"short\"\n                }),\n                total: count\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            stats: {\n                totalKaryawan,\n                karyawanAktif,\n                kontrakBerakhir,\n                totalAset,\n                asetDipinjam,\n                maintenancePending,\n                totalKendaraan,\n                kendaraanTersedia,\n                pajakJatuhTempo,\n                notifikasiUnread\n            },\n            charts: {\n                karyawanByKontrak: karyawanByKontrak.map((k)=>({\n                        name: k.statusKontrak,\n                        value: k._count.id\n                    })),\n                asetByKategori: asetByKategori.map((a)=>({\n                        name: a.kategori,\n                        value: a._count.id\n                    })),\n                monthlyKaryawan,\n                monthlyUtilitas: monthlyUtilitas.map((u)=>({\n                        name: u.jenis,\n                        tagihan: u._sum.tagihan || 0\n                    }))\n            },\n            recentActivity: recentAudit.map((log)=>({\n                    id: log.id,\n                    user: log.user?.name || \"System\",\n                    aksi: log.aksi,\n                    modul: log.modul,\n                    detail: log.detail,\n                    createdAt: log.createdAt\n                }))\n        });\n    } catch (error) {\n        console.error(\"Dashboard API error:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Gagal memuat data dashboard\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNDLE9BQU8sSUFBSTtvQkFDN0I7WUFDRjtZQUNBb0IsZ0JBQWdCMUQsWUFBWWtELEdBQUcsQ0FBQyxDQUFDUyxNQUFTO29CQUN4QzVCLElBQUk0QixJQUFJNUIsRUFBRTtvQkFDVk4sTUFBTWtDLElBQUlsQyxJQUFJLEVBQUVFLFFBQVE7b0JBQ3hCaUMsTUFBTUQsSUFBSUMsSUFBSTtvQkFDZEMsT0FBT0YsSUFBSUUsS0FBSztvQkFDaEJDLFFBQVFILElBQUlHLE1BQU07b0JBQ2xCdkMsV0FBV29DLElBQUlwQyxTQUFTO2dCQUMxQjtRQUNGO0lBQ0EsRUFBRSxPQUFPdEMsT0FBTztRQUNkOEUsUUFBUTlFLEtBQUssQ0FBQyx3QkFBd0JBO1FBQ3RDLE9BQU9YLHFEQUFZQSxDQUFDVSxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUE4QixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUNuRjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaHJnYS1hcHBzLy4vYXBwL2FwaS9kYXNoYm9hcmQvcm91dGUuanM/OGE0NSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgnXG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJ0AvbGliL2F1dGgnXG5pbXBvcnQgcHJpc21hIGZyb20gJ0AvbGliL3ByaXNtYSdcbmltcG9ydCB7IGFkZERheXMsIHN0YXJ0T2ZNb250aCwgZW5kT2ZNb250aCwgc3ViTW9udGhzIH0gZnJvbSAnZGF0ZS1mbnMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQoKSB7XG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKVxuICBpZiAoIXNlc3Npb24pIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pXG5cbiAgdHJ5IHtcbiAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICBjb25zdCB0aGlydHlEYXlzTGF0ZXIgPSBhZGREYXlzKG5vdywgMzApXG5cbiAgY29uc3QgW1xuICAgIHRvdGFsS2FyeWF3YW4sXG4gICAga2FyeWF3YW5Ba3RpZixcbiAgICBrb250cmFrQmVyYWtoaXIsXG4gICAgdG90YWxBc2V0LFxuICAgIGFzZXREaXBpbmphbSxcbiAgICBtYWludGVuYW5jZVBlbmRpbmcsXG4gICAgdG90YWxLZW5kYXJhYW4sXG4gICAga2VuZGFyYWFuVGVyc2VkaWEsXG4gICAgcGFqYWtKYXR1aFRlbXBvLFxuICAgIG5vdGlmaWthc2lVbnJlYWQsXG4gICAgcmVjZW50QXVkaXQsXG4gICAgYXNldEJ5S2F0ZWdvcmksXG4gICAgbW9udGhseVV0aWxpdGFzLFxuICBdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIHByaXNtYS5rYXJ5YXdhbi5jb3VudCgpLFxuICAgIHByaXNtYS5rYXJ5YXdhbi5jb3VudCh7IHdoZXJlOiB7IHN0YXR1c0FrdGlmOiB0cnVlIH0gfSksXG4gICAgcHJpc21hLmthcnlhd2FuLmNvdW50KHtcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIHRhbmdnYWxLb250cmFrQmVyYWtoaXI6IHsgZ3RlOiBub3csIGx0ZTogdGhpcnR5RGF5c0xhdGVyIH0sXG4gICAgICAgIHN0YXR1c0FrdGlmOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBwcmlzbWEuYXNldC5jb3VudCgpLFxuICAgIHByaXNtYS5hc2V0LmNvdW50KHsgd2hlcmU6IHsgc3RhdHVzOiAnRElQSU5KQU0nIH0gfSksXG4gICAgcHJpc21hLm1haW50ZW5hbmNlUmVxdWVzdC5jb3VudCh7IHdoZXJlOiB7IHN0YXR1czogeyBpbjogWydQRU5ESU5HJywgJ1BST1NFUyddIH0gfSB9KSxcbiAgICBwcmlzbWEua2VuZGFyYWFuLmNvdW50KCksXG4gICAgcHJpc21hLmtlbmRhcmFhbi5jb3VudCh7IHdoZXJlOiB7IHN0YXR1czogJ1RFUlNFRElBJyB9IH0pLFxuICAgIHByaXNtYS5wZW1iYXlhcmFuUGFqYWsuY291bnQoe1xuICAgICAgd2hlcmU6IHtcbiAgICAgICAgc3RhdHVzOiAnQkVMVU0nLFxuICAgICAgICB0YW5nZ2FsSmF0dWhUZW1wbzogeyBndGU6IG5vdywgbHRlOiB0aGlydHlEYXlzTGF0ZXIgfSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgcHJpc21hLm5vdGlmaWthc2kuY291bnQoeyB3aGVyZTogeyBzdGF0dXM6ICdCRUxVTV9ESUJBQ0EnIH0gfSksXG4gICAgcHJpc21hLmF1ZGl0TG9nLmZpbmRNYW55KHtcbiAgICAgIHRha2U6IDUsXG4gICAgICBvcmRlckJ5OiB7IGNyZWF0ZWRBdDogJ2Rlc2MnIH0sXG4gICAgICBpbmNsdWRlOiB7IHVzZXI6IHsgc2VsZWN0OiB7IG5hbWU6IHRydWUgfSB9IH0sXG4gICAgfSksXG4gICAgcHJpc21hLmFzZXQuZ3JvdXBCeSh7XG4gICAgICBieTogWydrYXRlZ29yaSddLFxuICAgICAgX2NvdW50OiB7IGlkOiB0cnVlIH0sXG4gICAgfSksXG4gICAgcHJpc21hLnV0aWxpdGFzLmdyb3VwQnkoe1xuICAgICAgYnk6IFsnamVuaXMnXSxcbiAgICAgIHdoZXJlOiB7XG4gICAgICAgIGJ1bGFuOiBub3cuZ2V0TW9udGgoKSArIDEsXG4gICAgICAgIHRhaHVuOiBub3cuZ2V0RnVsbFllYXIoKSxcbiAgICAgIH0sXG4gICAgICBfc3VtOiB7IHRhZ2loYW46IHRydWUgfSxcbiAgICB9KSxcbiAgXSlcblxuICAvLyBLYXJ5YXdhbiBieSBjb250cmFjdCBzdGF0dXNcbiAgY29uc3Qga2FyeWF3YW5CeUtvbnRyYWsgPSBhd2FpdCBwcmlzbWEua2FyeWF3YW4uZ3JvdXBCeSh7XG4gICAgYnk6IFsnc3RhdHVzS29udHJhayddLFxuICAgIHdoZXJlOiB7IHN0YXR1c0FrdGlmOiB0cnVlIH0sXG4gICAgX2NvdW50OiB7IGlkOiB0cnVlIH0sXG4gIH0pXG5cbiAgLy8gTW9udGhseSBrYXJ5YXdhbiB0cmVuZCAobGFzdCA2IG1vbnRocylcbiAgY29uc3QgbW9udGhseUthcnlhd2FuID0gW11cbiAgZm9yIChsZXQgaSA9IDU7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3QgZGF0ZSA9IHN1Yk1vbnRocyhub3csIGkpXG4gICAgY29uc3QgY291bnQgPSBhd2FpdCBwcmlzbWEua2FyeWF3YW4uY291bnQoe1xuICAgICAgd2hlcmU6IHsgdGFuZ2dhbE1hc3VrOiB7IGx0ZTogZW5kT2ZNb250aChkYXRlKSB9IH0sXG4gICAgfSlcbiAgICBtb250aGx5S2FyeWF3YW4ucHVzaCh7XG4gICAgICBtb250aDogZGF0ZS50b0xvY2FsZVN0cmluZygnaWQtSUQnLCB7IG1vbnRoOiAnc2hvcnQnIH0pLFxuICAgICAgdG90YWw6IGNvdW50LFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgIHN0YXRzOiB7XG4gICAgICB0b3RhbEthcnlhd2FuLFxuICAgICAga2FyeWF3YW5Ba3RpZixcbiAgICAgIGtvbnRyYWtCZXJha2hpcixcbiAgICAgIHRvdGFsQXNldCxcbiAgICAgIGFzZXREaXBpbmphbSxcbiAgICAgIG1haW50ZW5hbmNlUGVuZGluZyxcbiAgICAgIHRvdGFsS2VuZGFyYWFuLFxuICAgICAga2VuZGFyYWFuVGVyc2VkaWEsXG4gICAgICBwYWpha0phdHVoVGVtcG8sXG4gICAgICBub3RpZmlrYXNpVW5yZWFkLFxuICAgIH0sXG4gICAgY2hhcnRzOiB7XG4gICAgICBrYXJ5YXdhbkJ5S29udHJhazoga2FyeWF3YW5CeUtvbnRyYWsubWFwKChrKSA9PiAoe1xuICAgICAgICBuYW1lOiBrLnN0YXR1c0tvbnRyYWssXG4gICAgICAgIHZhbHVlOiBrLl9jb3VudC5pZCxcbiAgICAgIH0pKSxcbiAgICAgIGFzZXRCeUthdGVnb3JpOiBhc2V0QnlLYXRlZ29yaS5tYXAoKGEpID0+ICh7XG4gICAgICAgIG5hbWU6IGEua2F0ZWdvcmksXG4gICAgICAgIHZhbHVlOiBhLl9jb3VudC5pZCxcbiAgICAgIH0pKSxcbiAgICAgIG1vbnRobHlLYXJ5YXdhbixcbiAgICAgIG1vbnRobHlVdGlsaXRhczogbW9udGhseVV0aWxpdGFzLm1hcCgodSkgPT4gKHtcbiAgICAgICAgbmFtZTogdS5qZW5pcyxcbiAgICAgICAgdGFnaWhhbjogdS5fc3VtLnRhZ2loYW4gfHwgMCxcbiAgICAgIH0pKSxcbiAgICB9LFxuICAgIHJlY2VudEFjdGl2aXR5OiByZWNlbnRBdWRpdC5tYXAoKGxvZykgPT4gKHtcbiAgICAgIGlkOiBsb2cuaWQsXG4gICAgICB1c2VyOiBsb2cudXNlcj8ubmFtZSB8fCAnU3lzdGVtJyxcbiAgICAgIGFrc2k6IGxvZy5ha3NpLFxuICAgICAgbW9kdWw6IGxvZy5tb2R1bCxcbiAgICAgIGRldGFpbDogbG9nLmRldGFpbCxcbiAgICAgIGNyZWF0ZWRBdDogbG9nLmNyZWF0ZWRBdCxcbiAgICB9KSksXG4gIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRGFzaGJvYXJkIEFQSSBlcnJvcjonLCBlcnJvcilcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0dhZ2FsIG1lbXVhdCBkYXRhIGRhc2hib2FyZCcgfSwgeyBzdGF0dXM6IDUwMCB9KVxuICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2VydmVyU2Vzc2lvbiIsImF1dGhPcHRpb25zIiwicHJpc21hIiwiYWRkRGF5cyIsInN0YXJ0T2ZNb250aCIsImVuZE9mTW9udGgiLCJzdWJNb250aHMiLCJHRVQiLCJzZXNzaW9uIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwibm93IiwiRGF0ZSIsInRoaXJ0eURheXNMYXRlciIsInRvdGFsS2FyeWF3YW4iLCJrYXJ5YXdhbkFrdGlmIiwia29udHJha0JlcmFraGlyIiwidG90YWxBc2V0IiwiYXNldERpcGluamFtIiwibWFpbnRlbmFuY2VQZW5kaW5nIiwidG90YWxLZW5kYXJhYW4iLCJrZW5kYXJhYW5UZXJzZWRpYSIsInBhamFrSmF0dWhUZW1wbyIsIm5vdGlmaWthc2lVbnJlYWQiLCJyZWNlbnRBdWRpdCIsImFzZXRCeUthdGVnb3JpIiwibW9udGhseVV0aWxpdGFzIiwiUHJvbWlzZSIsImFsbCIsImthcnlhd2FuIiwiY291bnQiLCJ3aGVyZSIsInN0YXR1c0FrdGlmIiwidGFuZ2dhbEtvbnRyYWtCZXJha2hpciIsImd0ZSIsImx0ZSIsImFzZXQiLCJtYWludGVuYW5jZVJlcXVlc3QiLCJpbiIsImtlbmRhcmFhbiIsInBlbWJheWFyYW5QYWphayIsInRhbmdnYWxKYXR1aFRlbXBvIiwibm90aWZpa2FzaSIsImF1ZGl0TG9nIiwiZmluZE1hbnkiLCJ0YWtlIiwib3JkZXJCeSIsImNyZWF0ZWRBdCIsImluY2x1ZGUiLCJ1c2VyIiwic2VsZWN0IiwibmFtZSIsImdyb3VwQnkiLCJieSIsIl9jb3VudCIsImlkIiwidXRpbGl0YXMiLCJidWxhbiIsImdldE1vbnRoIiwidGFodW4iLCJnZXRGdWxsWWVhciIsIl9zdW0iLCJ0YWdpaGFuIiwia2FyeWF3YW5CeUtvbnRyYWsiLCJtb250aGx5S2FyeWF3YW4iLCJpIiwiZGF0ZSIsInRhbmdnYWxNYXN1ayIsInB1c2giLCJtb250aCIsInRvTG9jYWxlU3RyaW5nIiwidG90YWwiLCJzdGF0cyIsImNoYXJ0cyIsIm1hcCIsImsiLCJzdGF0dXNLb250cmFrIiwidmFsdWUiLCJhIiwia2F0ZWdvcmkiLCJ1IiwiamVuaXMiLCJyZWNlbnRBY3Rpdml0eSIsImxvZyIsImFrc2kiLCJtb2R1bCIsImRldGFpbCIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/dashboard/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/auth.js":
/*!*********************!*\
  !*** ./lib/auth.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bcryptjs */ \"bcryptjs\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./lib/prisma.js\");\n\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    throw new Error(\"Email dan password harus diisi\");\n                }\n                const user = await _prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user || !user.isActive) {\n                    throw new Error(\"Email atau password salah\");\n                }\n                const isPasswordValid = await bcryptjs__WEBPACK_IMPORTED_MODULE_2___default().compare(credentials.password, user.password);\n                if (!isPasswordValid) {\n                    throw new Error(\"Email atau password salah\");\n                }\n                return {\n                    id: user.id.toString(),\n                    name: user.name,\n                    email: user.email,\n                    role: user.role\n                };\n            }\n        })\n    ],\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role;\n                token.id = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token) {\n                session.user.role = token.role;\n                session.user.id = token.id;\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    session: {\n        strategy: \"jwt\"\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (next_auth__WEBPACK_IMPORTED_MODULE_0___default()(authOptions));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFnQztBQUNpQztBQUNwQztBQUNBO0FBRXRCLE1BQU1JLGNBQWM7SUFDekJDLFdBQVc7UUFDVEosMkVBQW1CQSxDQUFDO1lBQ2xCSyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVU7b0JBQ2pELE1BQU0sSUFBSUUsTUFBTTtnQkFDbEI7Z0JBRUEsTUFBTUMsT0FBTyxNQUFNWCwrQ0FBTUEsQ0FBQ1csSUFBSSxDQUFDQyxVQUFVLENBQUM7b0JBQ3hDQyxPQUFPO3dCQUFFUixPQUFPRCxZQUFZQyxLQUFLO29CQUFDO2dCQUNwQztnQkFFQSxJQUFJLENBQUNNLFFBQVEsQ0FBQ0EsS0FBS0csUUFBUSxFQUFFO29CQUMzQixNQUFNLElBQUlKLE1BQU07Z0JBQ2xCO2dCQUVBLE1BQU1LLGtCQUFrQixNQUFNaEIsdURBQWMsQ0FBQ0ssWUFBWUksUUFBUSxFQUFFRyxLQUFLSCxRQUFRO2dCQUVoRixJQUFJLENBQUNPLGlCQUFpQjtvQkFDcEIsTUFBTSxJQUFJTCxNQUFNO2dCQUNsQjtnQkFFQSxPQUFPO29CQUNMTyxJQUFJTixLQUFLTSxFQUFFLENBQUNDLFFBQVE7b0JBQ3BCZixNQUFNUSxLQUFLUixJQUFJO29CQUNmRSxPQUFPTSxLQUFLTixLQUFLO29CQUNqQmMsTUFBTVIsS0FBS1EsSUFBSTtnQkFDakI7WUFDRjtRQUNGO0tBQ0Q7SUFDREMsV0FBVztRQUNULE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFWCxJQUFJLEVBQUU7WUFDdkIsSUFBSUEsTUFBTTtnQkFDUlcsTUFBTUgsSUFBSSxHQUFHUixLQUFLUSxJQUFJO2dCQUN0QkcsTUFBTUwsRUFBRSxHQUFHTixLQUFLTSxFQUFFO1lBQ3BCO1lBQ0EsT0FBT0s7UUFDVDtRQUNBLE1BQU1DLFNBQVEsRUFBRUEsT0FBTyxFQUFFRCxLQUFLLEVBQUU7WUFDOUIsSUFBSUEsT0FBTztnQkFDVEMsUUFBUVosSUFBSSxDQUFDUSxJQUFJLEdBQUdHLE1BQU1ILElBQUk7Z0JBQzlCSSxRQUFRWixJQUFJLENBQUNNLEVBQUUsR0FBR0ssTUFBTUwsRUFBRTtZQUM1QjtZQUNBLE9BQU9NO1FBQ1Q7SUFDRjtJQUNBQyxPQUFPO1FBQ0xDLFFBQVE7UUFDUkMsT0FBTztJQUNUO0lBQ0FILFNBQVM7UUFDUEksVUFBVTtJQUNaO0lBQ0FDLFFBQVFDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZTtBQUNyQyxFQUFDO0FBRUQsaUVBQWVsQyxnREFBUUEsQ0FBQ0ksWUFBWUEsRUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL2hyZ2EtYXBwcy8uL2xpYi9hdXRoLmpzPzI4N2IiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE5leHRBdXRoIGZyb20gJ25leHQtYXV0aCdcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHMnXG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJ1xuaW1wb3J0IHByaXNtYSBmcm9tICcuL3ByaXNtYSdcblxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zID0ge1xuICBwcm92aWRlcnM6IFtcbiAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcbiAgICAgIG5hbWU6ICdjcmVkZW50aWFscycsXG4gICAgICBjcmVkZW50aWFsczoge1xuICAgICAgICBlbWFpbDogeyBsYWJlbDogJ0VtYWlsJywgdHlwZTogJ2VtYWlsJyB9LFxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogJ1Bhc3N3b3JkJywgdHlwZTogJ3Bhc3N3b3JkJyB9LFxuICAgICAgfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbWFpbCBkYW4gcGFzc3dvcmQgaGFydXMgZGlpc2knKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoe1xuICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbCB9LFxuICAgICAgICB9KVxuXG4gICAgICAgIGlmICghdXNlciB8fCAhdXNlci5pc0FjdGl2ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW1haWwgYXRhdSBwYXNzd29yZCBzYWxhaCcpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1Bhc3N3b3JkVmFsaWQgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShjcmVkZW50aWFscy5wYXNzd29yZCwgdXNlci5wYXNzd29yZClcblxuICAgICAgICBpZiAoIWlzUGFzc3dvcmRWYWxpZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW1haWwgYXRhdSBwYXNzd29yZCBzYWxhaCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiB1c2VyLmlkLnRvU3RyaW5nKCksXG4gICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICAgIHJvbGU6IHVzZXIucm9sZSxcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgY2FsbGJhY2tzOiB7XG4gICAgYXN5bmMgand0KHsgdG9rZW4sIHVzZXIgfSkge1xuICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgdG9rZW4ucm9sZSA9IHVzZXIucm9sZVxuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWRcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b2tlblxuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICBzZXNzaW9uLnVzZXIucm9sZSA9IHRva2VuLnJvbGVcbiAgICAgICAgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4uaWRcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXNzaW9uXG4gICAgfSxcbiAgfSxcbiAgcGFnZXM6IHtcbiAgICBzaWduSW46ICcvbG9naW4nLFxuICAgIGVycm9yOiAnL2xvZ2luJyxcbiAgfSxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiAnand0JyxcbiAgfSxcbiAgc2VjcmV0OiBwcm9jZXNzLmVudi5ORVhUQVVUSF9TRUNSRVQsXG59XG5cbmV4cG9ydCBkZWZhdWx0IE5leHRBdXRoKGF1dGhPcHRpb25zKVxuIl0sIm5hbWVzIjpbIk5leHRBdXRoIiwiQ3JlZGVudGlhbHNQcm92aWRlciIsImJjcnlwdCIsInByaXNtYSIsImF1dGhPcHRpb25zIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsIkVycm9yIiwidXNlciIsImZpbmRVbmlxdWUiLCJ3aGVyZSIsImlzQWN0aXZlIiwiaXNQYXNzd29yZFZhbGlkIiwiY29tcGFyZSIsImlkIiwidG9TdHJpbmciLCJyb2xlIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJzZXNzaW9uIiwicGFnZXMiLCJzaWduSW4iLCJlcnJvciIsInN0cmF0ZWd5Iiwic2VjcmV0IiwicHJvY2VzcyIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.js\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.js":
/*!***********************!*\
  !*** ./lib/prisma.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE2QztBQUU3QyxNQUFNQyxrQkFBa0JDO0FBRXhCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQTtBQUV6RCxJQUFJSSxJQUF5QixFQUFjSCxnQkFBZ0JFLE1BQU0sR0FBR0E7QUFFcEUsaUVBQWVBLE1BQU1BLEVBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ocmdhLWFwcHMvLi9saWIvcHJpc21hLmpzPzc1MTUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnXG5cbmNvbnN0IGdsb2JhbEZvclByaXNtYSA9IGdsb2JhbFRoaXNcblxuY29uc3QgcHJpc21hID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/PyBuZXcgUHJpc21hQ2xpZW50KClcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBwcmlzbWFcblxuZXhwb3J0IGRlZmF1bHQgcHJpc21hXG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsInByaXNtYSIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/date-fns","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdashboard%2Froute&page=%2Fapi%2Fdashboard%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdashboard%2Froute.js&appDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CGA%5CHRGA%20APPS%5Chrga_apps&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();