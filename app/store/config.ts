import { LLMModel } from "../client/api";
import { getClientConfig } from "../config/client";
import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_MODELS,
  DEFAULT_SIDEBAR_WIDTH,
  StoreKey,
} from "../constant";
import { createPersistStore } from "../utils/store";

export type ModelType = (typeof DEFAULT_MODELS)[number]["name"];

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter",
}

export enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light",
}

const config = getClientConfig();

export const DEFAULT_CONFIG = {
  lastUpdate: Date.now(), // timestamp, to merge state

  submitKey: SubmitKey.Enter,
  avatar: "1f603",
  fontSize: 14,
  theme: Theme.Auto as Theme,
  tightBorder: !!config?.isApp,
  sendPreviewBubble: true,
  enableAutoGenerateTitle: true,
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,

  disablePromptHint: false,

  dontShowMaskSplashScreen: false, // dont show splash screen when create chat
  hideBuiltinMasks: false, // dont add builtin masks

  customModels: "",
  models: DEFAULT_MODELS as any as LLMModel[],

  modelConfig: {
    model: "gpt-3.5-turbo" as ModelType,
    temperature: 0.5,
    top_p: 1,
    max_tokens: 4000,
    presence_penalty: 0,
    frequency_penalty: 0,
    sendMemory: true,
    historyMessageCount: 4,
    compressMessageLengthThreshold: 1000,
    enableInjectSystemPrompts: true,
    template: config?.template ?? DEFAULT_INPUT_TEMPLATE,
  },
};

export type ChatConfig = typeof DEFAULT_CONFIG;

export type ModelConfig = ChatConfig["modelConfig"];

export const MODEL_INPUT_PRICES = {
  "gpt-4": 0.03,
  "gpt-4-0314": 0.03,
  "gpt-4-0613": 0.03,
  "gpt-4-32k": 0.06,
  "gpt-4-32k-0314": 0.06,
  "gpt-4-32k-0613": 0.06,
  "gpt-4-1106-preview": 0.01, // $0.01 / 1K tokens
  "gpt-4-0125-preview": 0.01, // $0.01 / 1K tokens
  "gpt-4-turbo-preview": 0.01, // $0.01 / 1K tokens
  "gpt-4-vision-preview": 0.01, // $0.01 / 1K tokens
  "gpt-3.5-turbo": 0.0015, // $0.0015 / 1K tokens
  "gpt-3.5-turbo-0301": 0.0015,
  "gpt-3.5-turbo-0613": 0.0015,
  "gpt-3.5-turbo-16k": 0.003, // $0.003 / 1K tokens
  "gpt-3.5-turbo-16k-0613": 0.003,
  "gpt-3.5-turbo-instruct": 0.0015, // $0.0015 / 1K tokens
  "gpt-3.5-turbo-1106": 0.001, // $0.001 / 1K tokens
  "gpt-3.5-turbo-0125": 0.0005, // $0.0005 / 1K tokens
  "qwen-v1": 0,
  ernie: 0,
  spark: 0,
  llama: 0,
  chatglm: 0,
  "gemini-pro": 0,
} as const;

export const MODEL_OUTPUT_PRICES = {
  "gpt-4": 0.06,
  "gpt-4-0314": 0.06,
  "gpt-4-0613": 0.06,
  "gpt-4-32k": 0.12,
  "gpt-4-32k-0314": 0.12,
  "gpt-4-32k-0613": 0.12,
  "gpt-4-1106-preview": 0.03,
  "gpt-4-0125-preview": 0.03,
  "gpt-4-turbo-preview": 0.03,
  "gpt-4-vision-preview": 0.03,
  "gpt-3.5-turbo": 0.002,
  "gpt-3.5-turbo-0301": 0.002,
  "gpt-3.5-turbo-0613": 0.002,
  "gpt-3.5-turbo-16k": 0.004,
  "gpt-3.5-turbo-16k-0613": 0.004,
  "gpt-3.5-turbo-instruct": 0.002,
  "gpt-3.5-turbo-1106": 0.002,
  "gpt-3.5-turbo-0125": 0.0015,
  "qwen-v1": 0,
  ernie: 0,
  spark: 0,
  llama: 0,
  chatglm: 0,
  "gemini-pro": 0,
} as const;

export function limitNumber(
  x: number,
  min: number,
  max: number,
  defaultValue: number,
) {
  if (isNaN(x)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, x));
}

export const ModalConfigValidator = {
  model(x: string) {
    return x as ModelType;
  },
  max_tokens(x: number) {
    return limitNumber(x, 0, 512000, 1024);
  },
  presence_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  frequency_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  temperature(x: number) {
    return limitNumber(x, 0, 2, 1);
  },
  top_p(x: number) {
    return limitNumber(x, 0, 1, 1);
  },
};

export const useAppConfig = createPersistStore(
  { ...DEFAULT_CONFIG },
  (set, get) => ({
    reset() {
      set(() => ({ ...DEFAULT_CONFIG }));
    },

    mergeModels(newModels: LLMModel[]) {
      if (!newModels || newModels.length === 0) {
        return;
      }

      const oldModels = get().models;
      const modelMap: Record<string, LLMModel> = {};

      for (const model of oldModels) {
        model.available = false;
        modelMap[model.name] = model;
      }

      for (const model of newModels) {
        model.available = true;
        modelMap[model.name] = model;
      }

      set(() => ({
        models: Object.values(modelMap),
      }));
    },

    allModels() {},
  }),
  {
    name: StoreKey.Config,
    version: 3.9,
    migrate(persistedState, version) {
      const state = persistedState as ChatConfig;

      if (version < 3.4) {
        state.modelConfig.sendMemory = true;
        state.modelConfig.historyMessageCount = 4;
        state.modelConfig.compressMessageLengthThreshold = 1000;
        state.modelConfig.frequency_penalty = 0;
        state.modelConfig.top_p = 1;
        state.modelConfig.template = DEFAULT_INPUT_TEMPLATE;
        state.dontShowMaskSplashScreen = false;
        state.hideBuiltinMasks = false;
      }

      if (version < 3.5) {
        state.customModels = "claude,claude-100k";
      }

      if (version < 3.6) {
        state.modelConfig.enableInjectSystemPrompts = true;
      }

      if (version < 3.7) {
        state.enableAutoGenerateTitle = true;
      }

      if (version < 3.8) {
        state.lastUpdate = Date.now();
      }

      if (version < 3.9) {
        state.modelConfig.template =
          state.modelConfig.template !== DEFAULT_INPUT_TEMPLATE
            ? state.modelConfig.template
            : config?.template ?? DEFAULT_INPUT_TEMPLATE;
      }

      return state as any;
    },
  },
);
