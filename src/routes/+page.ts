export const ssr = false;

const quickUseFile = import.meta.glob(['./new/+server.ts'], {as: 'raw'});

export const load = async () => {
    const module = Object.entries(quickUseFile).map(([k, v]) =>
        v().then((result) => {
            const segments = k.split('/');
            return { filename: segments.slice(2).join('/'), source: result };
        }));
    const code = Promise.all(module);
    return {code}
};
