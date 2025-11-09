import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    OPENAI_API_KEY: str
    ANTHROPIC_API_KEY: str = ""
    TAVILY_API_KEY: str
    LANGCHAIN_TRACING_V2: str = "false"
    LANGCHAIN_ENDPOINT: str = "https://api.smith.langchain.com"
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_PROJECT: str = "agent-book"

    # LM Studio 接続設定
    LMSTUDIO_BASE_URL: str = "http://localhost:1234/v1"
    LMSTUDIO_MODEL: str = "openai/gpt-oss-20b"  # 例: "gpt-4o-mini-gguf" 等
    TEMPERATURE: float = 0.0
    
    # for Application
    openai_smart_model: str = ""
    openai_embedding_model: str = ""
    anthropic_smart_model: str = ""
    temperature: float = 0.0
    
    default_reflection_db_path: str = "tmp/reflection_db.json"

    def __init__(self, **values):
        super().__init__(**values)
        self._set_env_variables()

    def _set_env_variables(self):
        for key in self.__annotations__.keys():
            if key.isupper():
                os.environ[key] = str(getattr(self, key))

# === ここからクラスの外 ===
# === LM Studio 互換パッチ（安定版）===
try:
    from openai.resources.chat import completions

    _orig_create = completions.Completions.create  # 元のメソッドを保持

    def _patched_create(self, *args, **kwargs):
        # 1) top-level の tool_choice を文字列に正規化
        if "tool_choice" in kwargs and isinstance(kwargs["tool_choice"], dict):
            kwargs["tool_choice"] = "auto"

        # 2) LangChain が model_kwargs に詰め込む場合のケア
        mk = kwargs.get("model_kwargs")
        if isinstance(mk, dict):
            if "tool_choice" in mk and isinstance(mk["tool_choice"], dict):
                mk["tool_choice"] = "auto"
            # LM Studio は tools 未対応: あれば落とす
            if "tools" in mk:
                mk.pop("tools", None)
            # structured_output(Goal) が使う json_schema を json_object に降格
            rf = mk.get("response_format")
            if isinstance(rf, dict) and rf.get("type") == "json_schema":
                mk["response_format"] = {"type": "json_object"}

        # 3) top-level の tools も除去
        if "tools" in kwargs:
            kwargs.pop("tools", None)

        return _orig_create(self, *args, **kwargs)  # ← self を渡す（ここ重要）

    # クラスに “インスタンスメソッド” として差し替え
    completions.Completions.create = _patched_create
    print("[LM Studio patch applied ✅]")
except Exception as e:
    print(f"[LM Studio patch warning] {e}")
