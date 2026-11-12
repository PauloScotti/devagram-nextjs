import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Precisa rodar antes de qualquer schema ser criado: todo schema importa `z` daqui.
extendZodWithOpenApi(z);

export { z };
