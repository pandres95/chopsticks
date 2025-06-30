import dev from './dev/index.js';
import rpcSpec from './rpc-spec/index.js';
import substrate from './substrate/index.js';
export const allHandlers = {
    ...substrate,
    ...rpcSpec,
    ...dev,
    rpc_methods: async ()=>Promise.resolve({
            version: 1,
            methods: Object.keys(allHandlers).sort()
        })
};
export { substrate, dev };
export { ResponseError } from './shared.js';
