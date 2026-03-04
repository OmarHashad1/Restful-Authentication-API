import "dotenv/config";
import { bootstrap } from "./src/bootstrap.js";
import { logger } from "./src/utils/winston.js";
bootstrap();

logger