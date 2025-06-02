"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const config_1 = require("@nestjs/config");
exports.jwtConfig = {
    useFactory: (configService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
            expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        },
    }),
    inject: [config_1.ConfigService],
};
//# sourceMappingURL=jwt.config.js.map