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
exports.id = "app/api/portfolio/route";
exports.ids = ["app/api/portfolio/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
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

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:buffer");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:util");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fportfolio%2Froute&page=%2Fapi%2Fportfolio%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fportfolio%2Froute.ts&appDir=C%3A%5CUsers%5Cgamer%5CDesktop%5Cprevisao%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cgamer%5CDesktop%5Cprevisao&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fportfolio%2Froute&page=%2Fapi%2Fportfolio%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fportfolio%2Froute.ts&appDir=C%3A%5CUsers%5Cgamer%5CDesktop%5Cprevisao%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cgamer%5CDesktop%5Cprevisao&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_gamer_Desktop_previsao_app_api_portfolio_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/portfolio/route.ts */ \"(rsc)/./app/api/portfolio/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/portfolio/route\",\n        pathname: \"/api/portfolio\",\n        filename: \"route\",\n        bundlePath: \"app/api/portfolio/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\gamer\\\\Desktop\\\\previsao\\\\app\\\\api\\\\portfolio\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_gamer_Desktop_previsao_app_api_portfolio_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/portfolio/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZwb3J0Zm9saW8lMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnBvcnRmb2xpbyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnBvcnRmb2xpbyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNnYW1lciU1Q0Rlc2t0b3AlNUNwcmV2aXNhbyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDZ2FtZXIlNUNEZXNrdG9wJTVDcHJldmlzYW8maXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ2tCO0FBQy9GO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcHJldmlzYW8vPzVlYWMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcZ2FtZXJcXFxcRGVza3RvcFxcXFxwcmV2aXNhb1xcXFxhcHBcXFxcYXBpXFxcXHBvcnRmb2xpb1xcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvcG9ydGZvbGlvL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvcG9ydGZvbGlvXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9wb3J0Zm9saW8vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxnYW1lclxcXFxEZXNrdG9wXFxcXHByZXZpc2FvXFxcXGFwcFxcXFxhcGlcXFxccG9ydGZvbGlvXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9wb3J0Zm9saW8vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fportfolio%2Froute&page=%2Fapi%2Fportfolio%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fportfolio%2Froute.ts&appDir=C%3A%5CUsers%5Cgamer%5CDesktop%5Cprevisao%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cgamer%5CDesktop%5Cprevisao&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/portfolio/route.ts":
/*!************************************!*\
  !*** ./app/api/portfolio/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   dynamic: () => (/* binding */ dynamic)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_db__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/db */ \"(rsc)/./lib/db.ts\");\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n\n\n\nconst dynamic = \"force-dynamic\";\nasync function GET() {\n    const session = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_2__.getSession)();\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"N\\xe3o autenticado\"\n    }, {\n        status: 401\n    });\n    const positions = await _lib_db__WEBPACK_IMPORTED_MODULE_1__.db.position.findMany({\n        where: {\n            userId: session.userId\n        },\n        include: {\n            market: {\n                select: {\n                    id: true,\n                    title: true,\n                    emoji: true,\n                    status: true,\n                    resolution: true\n                }\n            },\n            outcome: {\n                select: {\n                    id: true,\n                    label: true,\n                    probability: true\n                }\n            }\n        },\n        orderBy: {\n            createdAt: \"desc\"\n        }\n    });\n    const transactions = await _lib_db__WEBPACK_IMPORTED_MODULE_1__.db.transaction.findMany({\n        where: {\n            userId: session.userId\n        },\n        orderBy: {\n            createdAt: \"desc\"\n        },\n        take: 30\n    });\n    const user = await _lib_db__WEBPACK_IMPORTED_MODULE_1__.db.user.findUnique({\n        where: {\n            id: session.userId\n        },\n        select: {\n            balance: true,\n            name: true,\n            phone: true\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        positions,\n        transactions,\n        user\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL3BvcnRmb2xpby9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUEyQztBQUNiO0FBQ1U7QUFFakMsTUFBTUcsVUFBVSxnQkFBZ0I7QUFFaEMsZUFBZUM7SUFDcEIsTUFBTUMsVUFBVSxNQUFNSCxxREFBVUE7SUFDaEMsSUFBSSxDQUFDRyxTQUFTLE9BQU9MLHFEQUFZQSxDQUFDTSxJQUFJLENBQUM7UUFBRUMsT0FBTztJQUFrQixHQUFHO1FBQUVDLFFBQVE7SUFBSTtJQUVuRixNQUFNQyxZQUFZLE1BQU1SLHVDQUFFQSxDQUFDUyxRQUFRLENBQUNDLFFBQVEsQ0FBQztRQUMzQ0MsT0FBTztZQUFFQyxRQUFRUixRQUFRUSxNQUFNO1FBQUM7UUFDaENDLFNBQVM7WUFDUEMsUUFBUTtnQkFBRUMsUUFBUTtvQkFBRUMsSUFBSTtvQkFBTUMsT0FBTztvQkFBTUMsT0FBTztvQkFBTVgsUUFBUTtvQkFBTVksWUFBWTtnQkFBSztZQUFFO1lBQ3pGQyxTQUFTO2dCQUFFTCxRQUFRO29CQUFFQyxJQUFJO29CQUFNSyxPQUFPO29CQUFNQyxhQUFhO2dCQUFLO1lBQUU7UUFDbEU7UUFDQUMsU0FBUztZQUFFQyxXQUFXO1FBQU87SUFDL0I7SUFFQSxNQUFNQyxlQUFlLE1BQU16Qix1Q0FBRUEsQ0FBQzBCLFdBQVcsQ0FBQ2hCLFFBQVEsQ0FBQztRQUNqREMsT0FBTztZQUFFQyxRQUFRUixRQUFRUSxNQUFNO1FBQUM7UUFDaENXLFNBQVM7WUFBRUMsV0FBVztRQUFPO1FBQzdCRyxNQUFNO0lBQ1I7SUFFQSxNQUFNQyxPQUFPLE1BQU01Qix1Q0FBRUEsQ0FBQzRCLElBQUksQ0FBQ0MsVUFBVSxDQUFDO1FBQ3BDbEIsT0FBTztZQUFFSyxJQUFJWixRQUFRUSxNQUFNO1FBQUM7UUFDNUJHLFFBQVE7WUFBRWUsU0FBUztZQUFNQyxNQUFNO1lBQU1DLE9BQU87UUFBSztJQUNuRDtJQUVBLE9BQU9qQyxxREFBWUEsQ0FBQ00sSUFBSSxDQUFDO1FBQUVHO1FBQVdpQjtRQUFjRztJQUFLO0FBQzNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcHJldmlzYW8vLi9hcHAvYXBpL3BvcnRmb2xpby9yb3V0ZS50cz85MGVhIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xuaW1wb3J0IHsgZGIgfSBmcm9tIFwiQC9saWIvZGJcIjtcbmltcG9ydCB7IGdldFNlc3Npb24gfSBmcm9tIFwiQC9saWIvYXV0aFwiO1xuXG5leHBvcnQgY29uc3QgZHluYW1pYyA9IFwiZm9yY2UtZHluYW1pY1wiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKCkge1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2Vzc2lvbigpO1xuICBpZiAoIXNlc3Npb24pIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIk7Do28gYXV0ZW50aWNhZG9cIiB9LCB7IHN0YXR1czogNDAxIH0pO1xuXG4gIGNvbnN0IHBvc2l0aW9ucyA9IGF3YWl0IGRiLnBvc2l0aW9uLmZpbmRNYW55KHtcbiAgICB3aGVyZTogeyB1c2VySWQ6IHNlc3Npb24udXNlcklkIH0sXG4gICAgaW5jbHVkZToge1xuICAgICAgbWFya2V0OiB7IHNlbGVjdDogeyBpZDogdHJ1ZSwgdGl0bGU6IHRydWUsIGVtb2ppOiB0cnVlLCBzdGF0dXM6IHRydWUsIHJlc29sdXRpb246IHRydWUgfSB9LFxuICAgICAgb3V0Y29tZTogeyBzZWxlY3Q6IHsgaWQ6IHRydWUsIGxhYmVsOiB0cnVlLCBwcm9iYWJpbGl0eTogdHJ1ZSB9IH0sXG4gICAgfSxcbiAgICBvcmRlckJ5OiB7IGNyZWF0ZWRBdDogXCJkZXNjXCIgfSxcbiAgfSk7XG5cbiAgY29uc3QgdHJhbnNhY3Rpb25zID0gYXdhaXQgZGIudHJhbnNhY3Rpb24uZmluZE1hbnkoe1xuICAgIHdoZXJlOiB7IHVzZXJJZDogc2Vzc2lvbi51c2VySWQgfSxcbiAgICBvcmRlckJ5OiB7IGNyZWF0ZWRBdDogXCJkZXNjXCIgfSxcbiAgICB0YWtlOiAzMCxcbiAgfSk7XG5cbiAgY29uc3QgdXNlciA9IGF3YWl0IGRiLnVzZXIuZmluZFVuaXF1ZSh7XG4gICAgd2hlcmU6IHsgaWQ6IHNlc3Npb24udXNlcklkIH0sXG4gICAgc2VsZWN0OiB7IGJhbGFuY2U6IHRydWUsIG5hbWU6IHRydWUsIHBob25lOiB0cnVlIH0sXG4gIH0pO1xuXG4gIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHBvc2l0aW9ucywgdHJhbnNhY3Rpb25zLCB1c2VyIH0pO1xufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImRiIiwiZ2V0U2Vzc2lvbiIsImR5bmFtaWMiLCJHRVQiLCJzZXNzaW9uIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwicG9zaXRpb25zIiwicG9zaXRpb24iLCJmaW5kTWFueSIsIndoZXJlIiwidXNlcklkIiwiaW5jbHVkZSIsIm1hcmtldCIsInNlbGVjdCIsImlkIiwidGl0bGUiLCJlbW9qaSIsInJlc29sdXRpb24iLCJvdXRjb21lIiwibGFiZWwiLCJwcm9iYWJpbGl0eSIsIm9yZGVyQnkiLCJjcmVhdGVkQXQiLCJ0cmFuc2FjdGlvbnMiLCJ0cmFuc2FjdGlvbiIsInRha2UiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsImJhbGFuY2UiLCJuYW1lIiwicGhvbmUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/portfolio/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createSession: () => (/* binding */ createSession),\n/* harmony export */   destroySession: () => (/* binding */ destroySession),\n/* harmony export */   getSession: () => (/* binding */ getSession)\n/* harmony export */ });\n/* harmony import */ var jose__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jose */ \"(rsc)/./node_modules/jose/dist/node/esm/jwt/sign.js\");\n/* harmony import */ var jose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jose */ \"(rsc)/./node_modules/jose/dist/node/esm/jwt/verify.js\");\n/* harmony import */ var next_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/headers */ \"(rsc)/./node_modules/next/dist/api/headers.js\");\n\n\nconst SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? \"previsao_secret\");\nconst COOKIE = \"previsao_token\";\nasync function createSession(userId) {\n    const token = await new jose__WEBPACK_IMPORTED_MODULE_1__.SignJWT({\n        userId\n    }).setProtectedHeader({\n        alg: \"HS256\"\n    }).setExpirationTime(\"30d\").sign(SECRET);\n    (0,next_headers__WEBPACK_IMPORTED_MODULE_0__.cookies)().set(COOKIE, token, {\n        httpOnly: true,\n        maxAge: 60 * 60 * 24 * 30,\n        path: \"/\"\n    });\n}\nasync function getSession() {\n    const token = (0,next_headers__WEBPACK_IMPORTED_MODULE_0__.cookies)().get(COOKIE)?.value;\n    if (!token) return null;\n    try {\n        const { payload } = await (0,jose__WEBPACK_IMPORTED_MODULE_2__.jwtVerify)(token, SECRET);\n        return {\n            userId: payload.userId\n        };\n    } catch  {\n        return null;\n    }\n}\nasync function destroySession() {\n    (0,next_headers__WEBPACK_IMPORTED_MODULE_0__.cookies)().delete(COOKIE);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBMEM7QUFDSDtBQUV2QyxNQUFNRyxTQUFTLElBQUlDLGNBQWNDLE1BQU0sQ0FBQ0MsUUFBUUMsR0FBRyxDQUFDQyxVQUFVLElBQUk7QUFDbEUsTUFBTUMsU0FBUztBQUVSLGVBQWVDLGNBQWNDLE1BQWM7SUFDaEQsTUFBTUMsUUFBUSxNQUFNLElBQUlaLHlDQUFPQSxDQUFDO1FBQUVXO0lBQU8sR0FDdENFLGtCQUFrQixDQUFDO1FBQUVDLEtBQUs7SUFBUSxHQUNsQ0MsaUJBQWlCLENBQUMsT0FDbEJDLElBQUksQ0FBQ2I7SUFDUkQscURBQU9BLEdBQUdlLEdBQUcsQ0FBQ1IsUUFBUUcsT0FBTztRQUFFTSxVQUFVO1FBQU1DLFFBQVEsS0FBSyxLQUFLLEtBQUs7UUFBSUMsTUFBTTtJQUFJO0FBQ3RGO0FBRU8sZUFBZUM7SUFDcEIsTUFBTVQsUUFBUVYscURBQU9BLEdBQUdvQixHQUFHLENBQUNiLFNBQVNjO0lBQ3JDLElBQUksQ0FBQ1gsT0FBTyxPQUFPO0lBQ25CLElBQUk7UUFDRixNQUFNLEVBQUVZLE9BQU8sRUFBRSxHQUFHLE1BQU12QiwrQ0FBU0EsQ0FBQ1csT0FBT1Q7UUFDM0MsT0FBTztZQUFFUSxRQUFRYSxRQUFRYixNQUFNO1FBQVc7SUFDNUMsRUFBRSxPQUFNO1FBQ04sT0FBTztJQUNUO0FBQ0Y7QUFFTyxlQUFlYztJQUNwQnZCLHFEQUFPQSxHQUFHd0IsTUFBTSxDQUFDakI7QUFDbkIiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcmV2aXNhby8uL2xpYi9hdXRoLnRzP2JmN2UiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2lnbkpXVCwgand0VmVyaWZ5IH0gZnJvbSBcImpvc2VcIjtcbmltcG9ydCB7IGNvb2tpZXMgfSBmcm9tIFwibmV4dC9oZWFkZXJzXCI7XG5cbmNvbnN0IFNFQ1JFVCA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShwcm9jZXNzLmVudi5KV1RfU0VDUkVUID8/IFwicHJldmlzYW9fc2VjcmV0XCIpO1xuY29uc3QgQ09PS0lFID0gXCJwcmV2aXNhb190b2tlblwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbih1c2VySWQ6IHN0cmluZykge1xuICBjb25zdCB0b2tlbiA9IGF3YWl0IG5ldyBTaWduSldUKHsgdXNlcklkIH0pXG4gICAgLnNldFByb3RlY3RlZEhlYWRlcih7IGFsZzogXCJIUzI1NlwiIH0pXG4gICAgLnNldEV4cGlyYXRpb25UaW1lKFwiMzBkXCIpXG4gICAgLnNpZ24oU0VDUkVUKTtcbiAgY29va2llcygpLnNldChDT09LSUUsIHRva2VuLCB7IGh0dHBPbmx5OiB0cnVlLCBtYXhBZ2U6IDYwICogNjAgKiAyNCAqIDMwLCBwYXRoOiBcIi9cIiB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNlc3Npb24oKTogUHJvbWlzZTx7IHVzZXJJZDogc3RyaW5nIH0gfCBudWxsPiB7XG4gIGNvbnN0IHRva2VuID0gY29va2llcygpLmdldChDT09LSUUpPy52YWx1ZTtcbiAgaWYgKCF0b2tlbikgcmV0dXJuIG51bGw7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBwYXlsb2FkIH0gPSBhd2FpdCBqd3RWZXJpZnkodG9rZW4sIFNFQ1JFVCk7XG4gICAgcmV0dXJuIHsgdXNlcklkOiBwYXlsb2FkLnVzZXJJZCBhcyBzdHJpbmcgfTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlc3Ryb3lTZXNzaW9uKCkge1xuICBjb29raWVzKCkuZGVsZXRlKENPT0tJRSk7XG59XG4iXSwibmFtZXMiOlsiU2lnbkpXVCIsImp3dFZlcmlmeSIsImNvb2tpZXMiLCJTRUNSRVQiLCJUZXh0RW5jb2RlciIsImVuY29kZSIsInByb2Nlc3MiLCJlbnYiLCJKV1RfU0VDUkVUIiwiQ09PS0lFIiwiY3JlYXRlU2Vzc2lvbiIsInVzZXJJZCIsInRva2VuIiwic2V0UHJvdGVjdGVkSGVhZGVyIiwiYWxnIiwic2V0RXhwaXJhdGlvblRpbWUiLCJzaWduIiwic2V0IiwiaHR0cE9ubHkiLCJtYXhBZ2UiLCJwYXRoIiwiZ2V0U2Vzc2lvbiIsImdldCIsInZhbHVlIiwicGF5bG9hZCIsImRlc3Ryb3lTZXNzaW9uIiwiZGVsZXRlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/db.ts":
/*!*******************!*\
  !*** ./lib/db.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   db: () => (/* binding */ db)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst db = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = db;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQThDO0FBRTlDLE1BQU1DLGtCQUFrQkM7QUFFakIsTUFBTUMsS0FBS0YsZ0JBQWdCRyxNQUFNLElBQUksSUFBSUosd0RBQVlBLEdBQUc7QUFFL0QsSUFBSUssSUFBcUMsRUFBRUosZ0JBQWdCRyxNQUFNLEdBQUdEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcHJldmlzYW8vLi9saWIvZGIudHM/MWRmMCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tIFwiQHByaXNtYS9jbGllbnRcIjtcblxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHsgcHJpc21hOiBQcmlzbWFDbGllbnQgfTtcblxuZXhwb3J0IGNvbnN0IGRiID0gZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/PyBuZXcgUHJpc21hQ2xpZW50KCk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIGdsb2JhbEZvclByaXNtYS5wcmlzbWEgPSBkYjtcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJnbG9iYWxGb3JQcmlzbWEiLCJnbG9iYWxUaGlzIiwiZGIiLCJwcmlzbWEiLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/db.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/jose"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fportfolio%2Froute&page=%2Fapi%2Fportfolio%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fportfolio%2Froute.ts&appDir=C%3A%5CUsers%5Cgamer%5CDesktop%5Cprevisao%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cgamer%5CDesktop%5Cprevisao&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();