import type { LanguagePipelineConfig } from "./_types";
import fa from "./fa";
import tr from "./tr";
import es from "./es";

export const PIPELINES: Record<string, LanguagePipelineConfig> = {
    fa,
    tr,
    es,
};

export function getPipeline(code: string): LanguagePipelineConfig {
    const p = PIPELINES[code];
    if (!p) throw new Error(`No pipeline config for language '${code}'. Add services/ingest/src/pipelines/${code}.ts and register it in services/ingest/src/pipelines/index.ts.`);
    return p;
}
