export type ModelCatalogItem = {
  id: string;
  name: string;
  logo: string;
  desc: string;
  fileName: string;
  byteSize: number;
  minRam: number;
  priority: number;
};
export const MODEL_CATALOG: ModelCatalogItem[] = [
  {
    id: 'bartowski/Qwen2.5-0.5B-Instruct-GGUF',
    name: 'Qwen 2.5 0.5B',
    logo: 'https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/620760a26f7d2dc95dfc2164/2TOI3iXKwohdT6C8I4drx.png?w=200&h=200&f=face',
    desc: 'Tiny, fast, and reliable on almost any phone.',
    fileName: 'Qwen2.5-0.5B-Instruct-Q4_K_M.gguf',
    byteSize: 397808192,
    minRam: 0,
    priority: 10,
  },
  {
    id: 'bartowski/Llama-3.2-1B-Instruct-GGUF',
    name: 'Llama 3.2 1B',
    logo: 'https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/1654016641505-62024564c76b1772652b3149.jpeg?w=200&h=200&f=face',
    desc: 'Compact general chat model with strong mobile speed.',
    fileName: 'Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    byteSize: 807694464,
    minRam: 2,
    priority: 20,
  },
  {
    id: 'bartowski/Qwen2.5-1.5B-Instruct-GGUF',
    name: 'Qwen 2.5 1.5B',
    logo: 'https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/620760a26f7d2dc95dfc2164/2TOI3iXKwohdT6C8I4drx.png?w=200&h=200&f=face',
    desc: 'Best small-model balance for chat, coding, and speed.',
    fileName: 'Qwen2.5-1.5B-Instruct-Q4_K_M.gguf',
    byteSize: 986048768,
    minRam: 2,
    priority: 30,
  },
  {
    id: 'bartowski/gemma-2-2b-it-GGUF',
    name: 'Gemma 2B',
    logo: 'https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/1649681653581-v2.jpeg?w=200&h=200&f=face',
    desc: 'Lightning fast. Optimized for low memory footprint.',
    fileName: 'gemma-2-2b-it-IQ3_M.gguf',
    byteSize: 1393561440,
    minRam: 3,
    priority: 40,
  },
  {
    id: 'bartowski/Qwen2.5-3B-Instruct-GGUF',
    name: 'Qwen 2.5 3B',
    logo: 'https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/620760a26f7d2dc95dfc2164/2TOI3iXKwohdT6C8I4drx.png?w=200&h=200&f=face',
    desc: 'Stronger reasoning while still practical on midrange devices.',
    fileName: 'Qwen2.5-3B-Instruct-Q4_K_M.gguf',
    byteSize: 1929903264,
    minRam: 4,
    priority: 50,
  },
  {
    id: 'bartowski/Llama-3.2-3B-Instruct-GGUF',
    name: 'Llama 3.2 3B',
    logo: 'https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/1654016641505-62024564c76b1772652b3149.jpeg?w=200&h=200&f=face',
    desc: 'Capable compact model for richer offline conversations.',
    fileName: 'Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    byteSize: 2019377696,
    minRam: 4,
    priority: 60,
  },
  {
    id: 'bartowski/Phi-3.5-mini-instruct-GGUF',
    name: 'Phi 3.5 Mini',
    logo: 'https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/62303d74d79b3cb7b9c87f81/Y6n8wUzWfX5qPUMX3L0Fc.png?w=200&h=200&f=face',
    desc: 'Great compact coding and reasoning model.',
    fileName: 'Phi-3.5-mini-instruct-Q4_K_M.gguf',
    byteSize: 2393232672,
    minRam: 6,
    priority: 70,
  },
  {
    id: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
    name: 'Mistral 7B',
    logo: 'https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/647a46f25381fbcda2149b2c/R0O0AWe-9x3x5P-q6E2Zc.png?w=200&h=200&f=face',
    desc: 'Balanced performance and speed.',
    fileName: 'mistral-7b-instruct-v0.2.Q3_K_L.gguf',
    byteSize: 3822024992,
    minRam: 6,
    priority: 80,
  },
  {
    id: 'MaziyarPanahi/Meta-Llama-3-8B-Instruct-GGUF',
    name: 'Llama 3 (8B)',
    logo: 'https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/1654016641505-62024564c76b1772652b3149.jpeg?w=200&h=200&f=face',
    desc: 'Highly capable. Best for complex reasoning tasks.',
    fileName: 'Meta-Llama-3-8B-Instruct.Q3_K_L.gguf',
    byteSize: 4322469088,
    minRam: 8,
    priority: 90,
  },
];
export const getModelDownloadUrl = (model: ModelCatalogItem) =>
  `https://huggingface.co/${model.id}/resolve/main/${encodeURIComponent(
    model.fileName,
  )}`;
export const getModelTaskId = (
  model: Pick<ModelCatalogItem, 'id' | 'fileName'>,
) => `model_dl_${model.id}_${model.fileName}`.replace(/[^a-zA-Z0-9]/g, '_');
export const formatModelSize = (bytes: number) =>
  `${(bytes / 1000 / 1000 / 1000).toFixed(2)} GB`;
export const findCatalogModel = (
  modelId?: string | null,
  modelName?: string | null,
) =>
  MODEL_CATALOG.find(
    model => model.id === modelId || model.name === modelName,
  ) ?? MODEL_CATALOG[0];
export const getRequiredStorageGB = (bytes: number) =>
  bytes / 1000 / 1000 / 1000 + 1;
