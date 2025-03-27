import {
  GoogleSafetySettingsThreshold,
  ServiceProvider,
  StoreKey,
  ApiPath,
  OPENAI_BASE_URL,
  ANTHROPIC_BASE_URL,
  GEMINI_BASE_URL,
  BAIDU_BASE_URL,
  BYTEDANCE_BASE_URL,
  ALIBABA_BASE_URL,
  TENCENT_BASE_URL,
  MOONSHOT_BASE_URL,
  IFLYTEK_BASE_URL,
  DEEPSEEK_BASE_URL,
  XAI_BASE_URL,
  CHATGLM_BASE_URL,
  SILICONFLOW_BASE_URL,
} from "../constant";
import { getHeaders } from "../client/api";
import { getClientConfig } from "../config/client";
import { createPersistStore } from "../utils/store";
import { ensure } from "../utils/clone";
import { DEFAULT_CONFIG } from "./config";
import { getModelProvider } from "../utils/model";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const isApp = getClientConfig()?.buildMode === "export";

const DEFAULT_OPENAI_URL = isApp ? OPENAI_BASE_URL : ApiPath.OpenAI;
const DEFAULT_GOOGLE_URL = isApp ? GEMINI_BASE_URL : ApiPath.Google;
const DEFAULT_ANTHROPIC_URL = isApp ? ANTHROPIC_BASE_URL : ApiPath.Anthropic;
const DEFAULT_BAIDU_URL = isApp ? BAIDU_BASE_URL : "/api/baidu";
const DEFAULT_BYTEDANCE_URL = isApp ? BYTEDANCE_BASE_URL : "/api/bytedance";
const DEFAULT_ALIBABA_URL = isApp ? ALIBABA_BASE_URL : "/api/alibaba";
const DEFAULT_MOONSHOT_URL = isApp ? MOONSHOT_BASE_URL : "/api/moonshot";
const DEFAULT_TENCENT_URL = isApp ? TENCENT_BASE_URL : "/api/tencent";
const DEFAULT_IFLYTEK_URL = isApp ? IFLYTEK_BASE_URL : "/api/iflytek";
const DEFAULT_DEEPSEEK_URL = isApp ? DEEPSEEK_BASE_URL : ApiPath.DeepSeek;
const DEFAULT_XAI_URL = isApp ? XAI_BASE_URL : ApiPath.XAI;
const DEFAULT_CHATGLM_URL = isApp ? CHATGLM_BASE_URL : "/api/chatglm";
const DEFAULT_SILICONFLOW_URL = isApp
  ? SILICONFLOW_BASE_URL
  : "/api/siliconflow";

export interface AccessState {
  token: string;
  accessCode: string;
  tokenExpiredAt: number;
  useCustomConfig: boolean;
  openaiApiKey: string;
  openaiUrl: string;
  provider: ServiceProvider;
  googleUrl: string;
  googleApiKey: string;
  googleApiVersion: string;
  googleSafetySettings: GoogleSafetySettingsThreshold;
  anthropicUrl: string;
  anthropicApiKey: string;
  anthropicApiVersion: string;
  baiduUrl: string;
  baiduApiKey: string;
  baiduSecretKey: string;
  bytedanceUrl: string;
  bytedanceApiKey: string;
  alibabaUrl: string;
  alibabaApiKey: string;
  moonshotUrl: string;
  moonshotApiKey: string;
  tencentUrl: string;
  tencentSecretKey: string;
  tencentSecretId: string;
  iflytekUrl: string;
  iflytekApiKey: string;
  iflytekApiSecret: string;
  deepseekUrl: string;
  deepseekApiKey: string;
  xaiUrl: string;
  xaiApiKey: string;
  chatglmUrl: string;
  chatglmApiKey: string;
  siliconflowUrl: string;
  siliconflowApiKey: string;
  needCode: boolean;
  hideUserApiKey: boolean;
  hideBalanceQuery: boolean;
  disableGPT4: boolean;
  disableFastLink: boolean;
  customModels: string;
  defaultModel: string;
  visionModels: string;
  edgeTTSVoiceName: string;
}

export const DEFAULT_ACCESS_STATE: AccessState = {
  token: "",
  accessCode: "",
  tokenExpiredAt: 0,
  useCustomConfig: false,
  openaiApiKey: "",
  openaiUrl: DEFAULT_OPENAI_URL,
  provider: ServiceProvider.OpenAI,
  googleUrl: DEFAULT_GOOGLE_URL,
  googleApiKey: "",
  googleApiVersion: "v1",
  googleSafetySettings: GoogleSafetySettingsThreshold.BLOCK_ONLY_HIGH,
  anthropicUrl: DEFAULT_ANTHROPIC_URL,
  anthropicApiKey: "",
  anthropicApiVersion: "2023-06-01",
  baiduUrl: DEFAULT_BAIDU_URL,
  baiduApiKey: "",
  baiduSecretKey: "",
  bytedanceUrl: DEFAULT_BYTEDANCE_URL,
  bytedanceApiKey: "",
  alibabaUrl: DEFAULT_ALIBABA_URL,
  alibabaApiKey: "",
  moonshotUrl: DEFAULT_MOONSHOT_URL,
  moonshotApiKey: "",
  tencentUrl: DEFAULT_TENCENT_URL,
  tencentSecretKey: "",
  tencentSecretId: "",
  iflytekUrl: DEFAULT_IFLYTEK_URL,
  iflytekApiKey: "",
  iflytekApiSecret: "",
  deepseekUrl: DEFAULT_DEEPSEEK_URL,
  deepseekApiKey: "",
  xaiUrl: DEFAULT_XAI_URL,
  xaiApiKey: "",
  chatglmUrl: DEFAULT_CHATGLM_URL,
  chatglmApiKey: "",
  siliconflowUrl: DEFAULT_SILICONFLOW_URL,
  siliconflowApiKey: "",
  needCode: true,
  hideUserApiKey: false,
  hideBalanceQuery: false,
  disableGPT4: false,
  disableFastLink: false,
  customModels: "",
  defaultModel: "",
  visionModels: "",
  edgeTTSVoiceName: "zh-CN-YunxiNeural",
};

interface AccessStoreMethods {
  enabledAccessControl(): boolean;
  getVisionModels(): string;
  edgeVoiceName(): string;
  isValidOpenAI(): boolean;
  isValidGoogle(): boolean;
  isValidAnthropic(): boolean;
  isValidBaidu(): boolean;
  isValidByteDance(): boolean;
  isValidAlibaba(): boolean;
  isValidTencent(): boolean;
  isValidMoonshot(): boolean;
  isValidIflytek(): boolean;
  isValidDeepSeek(): boolean;
  isValidXAI(): boolean;
  isValidChatGLM(): boolean;
  isValidSiliconFlow(): boolean;
  isAuthorized(): boolean;
  fetch(): void;
  isValid(): boolean;
}

export const useAccessStore = createPersistStore<
  AccessState,
  AccessStoreMethods
>(
  { ...DEFAULT_ACCESS_STATE },
  (set, get) => ({
    enabledAccessControl() {
      this.fetch();
      return get().needCode;
    },
    getVisionModels() {
      this.fetch();
      return get().visionModels;
    },
    edgeVoiceName() {
      this.fetch();
      return get().edgeTTSVoiceName;
    },
    isValidOpenAI() {
      return ensure(get(), ["openaiApiKey"]);
    },
    isValidGoogle() {
      return ensure(get(), ["googleApiKey"]);
    },
    isValidAnthropic() {
      return ensure(get(), ["anthropicApiKey"]);
    },
    isValidBaidu() {
      return ensure(get(), ["baiduApiKey", "baiduSecretKey"]);
    },
    isValidByteDance() {
      return ensure(get(), ["bytedanceApiKey"]);
    },
    isValidAlibaba() {
      return ensure(get(), ["alibabaApiKey"]);
    },
    isValidTencent() {
      return ensure(get(), ["tencentSecretKey", "tencentSecretId"]);
    },
    isValidMoonshot() {
      return ensure(get(), ["moonshotApiKey"]);
    },
    isValidIflytek() {
      return ensure(get(), ["iflytekApiKey"]);
    },
    isValidDeepSeek() {
      return ensure(get(), ["deepseekApiKey"]);
    },
    isValidXAI() {
      return ensure(get(), ["xaiApiKey"]);
    },
    isValidChatGLM() {
      return ensure(get(), ["chatglmApiKey"]);
    },
    isValidSiliconFlow() {
      return ensure(get(), ["siliconflowApiKey"]);
    },
    isAuthorized() {
      this.fetch();
      return (
        this.isValidOpenAI() ||
        this.isValidGoogle() ||
        this.isValidAnthropic() ||
        this.isValidBaidu() ||
        this.isValidByteDance() ||
        this.isValidAlibaba() ||
        this.isValidTencent() ||
        this.isValidMoonshot() ||
        this.isValidIflytek() ||
        this.isValidDeepSeek() ||
        this.isValidXAI() ||
        this.isValidChatGLM() ||
        this.isValidSiliconFlow() ||
        !this.enabledAccessControl() ||
        (this.enabledAccessControl() && ensure(get(), ["accessCode"]))
      );
    },
    fetch() {
      if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
      fetchState = 1;
      fetch("/api/config", {
        method: "post",
        body: null,
        headers: {
          ...getHeaders(),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          const defaultModel = res.defaultModel ?? "";
          if (defaultModel !== "") {
            const [model, providerName] = getModelProvider(defaultModel);
            DEFAULT_CONFIG.modelConfig.model = model;
            DEFAULT_CONFIG.modelConfig.providerName = providerName as any;
          }
          return res;
        })
        .then((res: DangerConfig) => {
          console.log("[Config] got config from server", res);
          set(() => ({ ...res }));
        })
        .catch(() => {
          console.error("[Config] failed to fetch config");
        })
        .finally(() => {
          fetchState = 2;
        });
    },
    isValid() {
      return this.isValidOpenAI();
    },
  }),
  {
    name: StoreKey.Access,
    version: 1.1,
    migrate(persistedState, version) {
      const state = persistedState as AccessState;
      if (version < 1.1) {
        state.openaiUrl = "";
      }
      return {
        ...state,
        ...DEFAULT_ACCESS_STATE,
        lastUpdateTime: 0,
        _hasHydrated: false,
        markUpdate: () => {},
        update: () => {},
        setHasHydrated: () => {},
        enabledAccessControl: () => state.needCode,
        getVisionModels: () => state.visionModels,
        edgeVoiceName: () => state.edgeTTSVoiceName,
        isValidOpenAI: () => ensure(state, ["openaiApiKey"]),
        isValidGoogle: () => ensure(state, ["googleApiKey"]),
        isValidAnthropic: () => ensure(state, ["anthropicApiKey"]),
        isValidBaidu: () => ensure(state, ["baiduApiKey", "baiduSecretKey"]),
        isValidByteDance: () => ensure(state, ["bytedanceApiKey"]),
        isValidAlibaba: () => ensure(state, ["alibabaApiKey"]),
        isValidTencent: () =>
          ensure(state, ["tencentSecretKey", "tencentSecretId"]),
        isValidMoonshot: () => ensure(state, ["moonshotApiKey"]),
        isValidIflytek: () => ensure(state, ["iflytekApiKey"]),
        isValidDeepSeek: () => ensure(state, ["deepseekApiKey"]),
        isValidXAI: () => ensure(state, ["xaiApiKey"]),
        isValidChatGLM: () => ensure(state, ["chatglmApiKey"]),
        isValidSiliconFlow: () => ensure(state, ["siliconflowApiKey"]),
        isAuthorized: () => true,
        fetch: () => {},
        isValid: () => true,
      };
    },
  },
);
