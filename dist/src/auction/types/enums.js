"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories = exports.Category = exports.SaleStatusCode = void 0;
var SaleStatusCode;
(function (SaleStatusCode) {
    SaleStatusCode[SaleStatusCode["Sold"] = 0] = "Sold";
    SaleStatusCode[SaleStatusCode["NotEnoughFunds"] = 1] = "NotEnoughFunds";
    SaleStatusCode[SaleStatusCode["AlreadyBought"] = 2] = "AlreadyBought";
    SaleStatusCode[SaleStatusCode["InvalidListing"] = 3] = "InvalidListing";
})(SaleStatusCode || (exports.SaleStatusCode = SaleStatusCode = {}));
var Category;
(function (Category) {
    Category["Default"] = "default";
    Category["Armor"] = "armor";
    Category["Tools"] = "tools";
    Category["Items"] = "items";
    Category["Blocks"] = "blocks";
})(Category || (exports.Category = Category = {}));
exports.categories = Object.values(Category).filter((cat) => cat !== Category.Default);
