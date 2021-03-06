"use strict";
exports.__esModule = true;
exports.DocParser = exports.parseCommandDbJson = void 0;
var from_xml_1 = require("from-xml");
var WerckmeisterUrl = 'https://werckme.github.io';
var CommandParameter = /** @class */ (function () {
    function CommandParameter(rawObject) {
        this.rawObject = rawObject;
    }
    CommandParameter.prototype.getName = function () { return (this.rawObject || {})['@name']; };
    CommandParameter.prototype.getIsOptional = function () { return (this.rawObject || {})['@optional'] === '1'; };
    CommandParameter.prototype.getType = function () { return (this.rawObject || {})['@type']; };
    CommandParameter.prototype.getDescription = function () {
        var result = (this.rawObject || {})['#'];
        if (result && result.join) {
            return result.join('\n');
        }
        return result;
    };
    CommandParameter.prototype.getIsDeprecated = function () { return (this.rawObject || {})['@deprecated'].length > 0; };
    CommandParameter.prototype.getDeprecatedText = function () { return (this.rawObject || {})['@deprecated']; };
    return CommandParameter;
}());
var Command = /** @class */ (function () {
    function Command(rawObject) {
        this.rawObject = rawObject;
    }
    Command.prototype.getDocumentContext = function () {
        var _a, _b;
        var txtValue = (((_b = (_a = this.rawObject) === null || _a === void 0 ? void 0 : _a.doc) === null || _b === void 0 ? void 0 : _b.command) || {})['@where'];
        if (!txtValue) {
            return [];
        }
        return txtValue.split(',')
            .map(function (x) { return x.trim(); });
    };
    Command.prototype.getName = function () { var _a, _b; return (((_b = (_a = this.rawObject) === null || _a === void 0 ? void 0 : _a.doc) === null || _b === void 0 ? void 0 : _b.command) || {})['@name']; };
    Command.prototype.getUrl = function () { return "https://werckme.github.io/manual#" + this.getName(); };
    Command.prototype.getDescription = function () {
        var _a, _b;
        var result = (((_b = (_a = this.rawObject) === null || _a === void 0 ? void 0 : _a.doc) === null || _b === void 0 ? void 0 : _b.command) || {})['#'];
        if (result && result.join) {
            result = result.join('\n');
        }
        return result;
    };
    Command.prototype.getParameter = function () {
        var _a, _b;
        var params = (_b = (_a = this.rawObject) === null || _a === void 0 ? void 0 : _a.doc) === null || _b === void 0 ? void 0 : _b.param;
        if (!params) {
            return [];
        }
        if (!Array.isArray(params)) {
            // happens if only one object exists
            params = [params];
        }
        return (params || []).map(function (x) { return new CommandParameter(x); });
    };
    return Command;
}());
function parseCommandDbJson(jsonText) {
    var db = {};
    var json = JSON.parse(jsonText);
    for (var commandName in json) {
        db[commandName] = new Command(json[commandName].rawObject);
    }
    return db;
}
exports.parseCommandDbJson = parseCommandDbJson;
var DocParser = /** @class */ (function () {
    function DocParser() {
        this.commandDb = {};
    }
    DocParser.prototype.getDocComment = function (text, docCommentToken) {
        var resLines = [];
        var withinDocBlock = false;
        for (var _i = 0, _a = text.split('\n'); _i < _a.length; _i++) {
            var line = _a[_i];
            var isDocCommentLine = line.trim().startsWith(docCommentToken);
            if (!withinDocBlock && isDocCommentLine) {
                withinDocBlock = true;
            }
            if (withinDocBlock && !isDocCommentLine) {
                break;
            }
            if (isDocCommentLine) {
                resLines.push(line.replace(docCommentToken, '').trim());
            }
        }
        return resLines.join('\n');
    };
    DocParser.prototype.normalizeText = function (text) {
        return text
            .replace(/(\[.*\])\(\s*\/{0,1}manual(.*)\)/g, "$1(" + WerckmeisterUrl + "/manual$2)")
            .replace(/(\[.*\])\((?!(\s*http|\s*https|\s*ftp))\s*(.*)\)/g, "$1(" + WerckmeisterUrl + "/manual$3)")
            .replace(/\\n/g, '');
    };
    DocParser.prototype.parseDocumentText = function (text) {
        text = this.normalizeText(text);
        var xml = from_xml_1.fromXML("<doc>" + text + "</doc>");
        var command = new Command(xml);
        var commandName = command.getName();
        if (!commandName) {
            return;
        }
        this.commandDb[commandName] = command;
    };
    DocParser.prototype.parseLua = function (text) {
        text = this.normalizeText(text);
        var docText = this.getDocComment(text, '--');
        if (!docText) {
            return;
        }
        this.parseDocumentText(docText);
    };
    DocParser.prototype.parseHpp = function (text) {
        text = this.normalizeText(text);
        var docText = this.getDocComment(text, '///');
        if (!docText) {
            return;
        }
        this.parseDocumentText(docText);
    };
    return DocParser;
}());
exports.DocParser = DocParser;
