module.exports = [
"[project]/lib/db.js [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/lib/db.js [app-route] (ecmascript)");
    });
});
}),
"[project]/models/AuditLog.js [app-route] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/models_AuditLog_831d2167.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/models/AuditLog.js [app-route] (ecmascript)");
    });
});
}),
];