import { z } from 'zod';
import { configSchema } from '../../schema/index.js';
export const dryRunSchema = z.object({
    ...configSchema.shape,
    extrinsic: z.string({
        description: 'Extrinsic or call to dry run. If you pass call here then address is required to fake signature'
    }).optional(),
    address: z.string({
        description: 'Address to fake sign extrinsic'
    }).optional(),
    preimage: z.string({
        description: 'Preimage to dry run'
    }).optional(),
    at: z.string({
        description: 'Block hash to dry run'
    }).optional(),
    'output-path': z.string({
        description: 'File path to print output'
    }).optional(),
    html: z.boolean({
        description: 'Generate html with storage diff'
    }).optional(),
    open: z.boolean({
        description: 'Open generated html'
    }).optional()
});
export * from './cli.js';
export * from './rpc.js';
