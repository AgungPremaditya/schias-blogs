"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateCategoryException = void 0;
const common_1 = require("@nestjs/common");
class DuplicateCategoryException extends common_1.ConflictException {
    constructor(name) {
        super(`Category with name "${name}" already exists`);
    }
}
exports.DuplicateCategoryException = DuplicateCategoryException;
//# sourceMappingURL=duplicate-category.exception.js.map