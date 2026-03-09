"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_rsc_models_AuditLog_js";
exports.ids = ["_rsc_models_AuditLog_js"];
exports.modules = {

/***/ "(rsc)/./models/AuditLog.js":
/*!****************************!*\
  !*** ./models/AuditLog.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst auditLogSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    userId: {\n        type: (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema).Types.ObjectId,\n        ref: \"User\",\n        default: null\n    },\n    aksi: {\n        type: String,\n        required: true\n    },\n    modul: {\n        type: String,\n        required: true\n    },\n    detail: {\n        type: String,\n        default: null\n    },\n    ipAddress: {\n        type: String,\n        default: null\n    }\n}, {\n    timestamps: true,\n    toJSON: {\n        virtuals: true,\n        transform: (_, ret)=>{\n            delete ret._id;\n            delete ret.__v;\n            return ret;\n        }\n    }\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).AuditLog || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"AuditLog\", auditLogSchema));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9tb2RlbHMvQXVkaXRMb2cuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQStCO0FBRS9CLE1BQU1DLGlCQUFpQixJQUFJRCx3REFBZSxDQUN4QztJQUNFRyxRQUFRO1FBQUVDLE1BQU1KLHdEQUFlLENBQUNLLEtBQUssQ0FBQ0MsUUFBUTtRQUFFQyxLQUFLO1FBQVFDLFNBQVM7SUFBSztJQUMzRUMsTUFBTTtRQUFFTCxNQUFNTTtRQUFRQyxVQUFVO0lBQUs7SUFDckNDLE9BQU87UUFBRVIsTUFBTU07UUFBUUMsVUFBVTtJQUFLO0lBQ3RDRSxRQUFRO1FBQUVULE1BQU1NO1FBQVFGLFNBQVM7SUFBSztJQUN0Q00sV0FBVztRQUFFVixNQUFNTTtRQUFRRixTQUFTO0lBQUs7QUFDM0MsR0FDQTtJQUNFTyxZQUFZO0lBQ1pDLFFBQVE7UUFDTkMsVUFBVTtRQUNWQyxXQUFXLENBQUNDLEdBQUdDO1lBQ2IsT0FBT0EsSUFBSUMsR0FBRztZQUNkLE9BQU9ELElBQUlFLEdBQUc7WUFDZCxPQUFPRjtRQUNUO0lBQ0Y7QUFDRjtBQUdGLGlFQUFlcEIsd0RBQWUsQ0FBQ3dCLFFBQVEsSUFBSXhCLHFEQUFjLENBQUMsWUFBWUMsZUFBZUEsRUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL2hyZ2EtYXBwcy8uL21vZGVscy9BdWRpdExvZy5qcz81YzFjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSdcblxuY29uc3QgYXVkaXRMb2dTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxuICB7XG4gICAgdXNlcklkOiB7IHR5cGU6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5PYmplY3RJZCwgcmVmOiAnVXNlcicsIGRlZmF1bHQ6IG51bGwgfSxcbiAgICBha3NpOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICBtb2R1bDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gICAgZGV0YWlsOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogbnVsbCB9LFxuICAgIGlwQWRkcmVzczogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwgfSxcbiAgfSxcbiAge1xuICAgIHRpbWVzdGFtcHM6IHRydWUsXG4gICAgdG9KU09OOiB7XG4gICAgICB2aXJ0dWFsczogdHJ1ZSxcbiAgICAgIHRyYW5zZm9ybTogKF8sIHJldCkgPT4ge1xuICAgICAgICBkZWxldGUgcmV0Ll9pZFxuICAgICAgICBkZWxldGUgcmV0Ll9fdlxuICAgICAgICByZXR1cm4gcmV0XG4gICAgICB9LFxuICAgIH0sXG4gIH1cbilcblxuZXhwb3J0IGRlZmF1bHQgbW9uZ29vc2UubW9kZWxzLkF1ZGl0TG9nIHx8IG1vbmdvb3NlLm1vZGVsKCdBdWRpdExvZycsIGF1ZGl0TG9nU2NoZW1hKVxuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwiYXVkaXRMb2dTY2hlbWEiLCJTY2hlbWEiLCJ1c2VySWQiLCJ0eXBlIiwiVHlwZXMiLCJPYmplY3RJZCIsInJlZiIsImRlZmF1bHQiLCJha3NpIiwiU3RyaW5nIiwicmVxdWlyZWQiLCJtb2R1bCIsImRldGFpbCIsImlwQWRkcmVzcyIsInRpbWVzdGFtcHMiLCJ0b0pTT04iLCJ2aXJ0dWFscyIsInRyYW5zZm9ybSIsIl8iLCJyZXQiLCJfaWQiLCJfX3YiLCJtb2RlbHMiLCJBdWRpdExvZyIsIm1vZGVsIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./models/AuditLog.js\n");

/***/ })

};
;