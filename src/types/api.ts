// ── Enums ────────────────────────────────────────────────
export type SessionStatus = 'ACTIVE' | 'CLOSED' | 'EXPIRED'
export type MemoryStoreType = 'NONE' | 'IN_MEMORY' | 'JDBC'
export type RouteType = 'SIMPLE' | 'KNOWLEDGE_QA' | 'TOOL_HEAVY' | 'LONG_CONTEXT' | 'STRUCTURED_OUTPUT'
export type ToolType = 'LOCAL_BEAN' | 'REST' | 'MCP'
export type FallbackPolicy = 'USE_DEFAULT_MODEL' | 'FAIL_FAST'

// ── Error ─────────────────────────────────────────────────
export interface FieldValidationError { field: string; message: string }
export interface ApiErrorResponse { errorCode: string; errorMessage: string; requestId?: string; timestamp: string; fieldErrors?: FieldValidationError[] }

// ── Chat ──────────────────────────────────────────────────
export interface RuntimeOverride { knowledgeBaseId?: string; memoryStoreType?: MemoryStoreType; enabledToolNames?: string[]; modelHint?: string; streamingEnabled?: boolean }
export interface ChatRequest { assistantCode: string; tenantId: string; sessionId: string; userId: string; message: string; locale?: string; channel?: string; context?: Record<string, unknown>; runtimeOverride?: RuntimeOverride }
export interface ResponseUsage { inputTokens?: number; outputTokens?: number; latencyMs?: number }
export interface ResponseCitation { sourceId?: string; sourceType?: string; title?: string; snippet?: string; location?: string }
export interface ToolExecutionSummary { toolName?: string; toolType?: ToolType; success?: boolean; latencyMs?: number }
export interface ResponseMetadata { ragUsed?: boolean; memoryUsed?: boolean; toolsUsed?: boolean; knowledgeBaseId?: string; promptVersion?: string; configVersion?: string; streamed?: boolean }
export interface ChatResponse { requestId: string; sessionId: string; messageId: string; assistantCode: string; content: string; selectedProvider?: string; selectedModel?: string; finishReason?: string; timestamp: string; usage?: ResponseUsage; citations: ResponseCitation[]; toolExecutions: ToolExecutionSummary[]; metadata?: ResponseMetadata }

// ── Streaming ─────────────────────────────────────────────
export interface StreamingMetadata { selectedModel?: string; selectedProvider?: string; partial?: boolean; finishReason?: string | null }
export interface StreamingChatChunk { requestId: string; sessionId: string; eventType: 'message'; contentChunk?: string; sequenceNumber?: number; timestamp: string; metadata?: StreamingMetadata }
export interface StreamingCompletion { requestId: string; sessionId: string; messageId?: string; eventType: 'completion'; selectedModel?: string; selectedProvider?: string; usage?: ResponseUsage; citations: ResponseCitation[]; toolExecutions: ToolExecutionSummary[]; metadata?: ResponseMetadata; timestamp: string }

// ── Sessions ──────────────────────────────────────────────
export interface SessionSummary { sessionId: string; tenantId?: string; assistantCode?: string; userId?: string; title?: string; status?: SessionStatus; createdAt?: string; updatedAt?: string; lastMessageAt?: string; locale?: string; channel?: string }
export interface MessageDto { messageId?: string; requestId?: string; role?: string; content?: string; selectedModel?: string | null; finishReason?: string | null; hasCitations?: boolean; timestamp?: string }
export interface PageMetadata { size?: number; count?: number; nextCursor?: string | null }
export interface SessionMessagesResponse { sessionId?: string; messages: MessageDto[]; page?: PageMetadata }
export interface UserSessionsResponse { userId?: string; sessions: SessionSummary[]; page?: PageMetadata }

// ── Health ────────────────────────────────────────────────
export interface PingResponse { status?: string; service?: string; timestamp?: string }

// ── Resolved Config ───────────────────────────────────────
export interface ResolvedPromptConfig { systemPromptTemplate?: string; developerPromptTemplate?: string | null; defaultVariables?: Record<string, string>; guardrailInstructions?: string[]; promptVersion?: string }
export interface ResolvedModelRoute { routeName?: string; routeType?: RouteType; minPromptLength?: number | null; maxPromptLength?: number | null; ragEnabledOnly?: boolean; toolsRequiredOnly?: boolean; structuredOutputOnly?: boolean; targetProvider?: string; targetModel?: string; maxInputTokens?: number | null; temperature?: number | null; priority?: number }
export interface ResolvedModelRoutingConfig { defaultModel?: string; defaultProvider?: string; defaultMaxInputTokens?: number; defaultTemperature?: number; fallbackPolicy?: FallbackPolicy; routes?: ResolvedModelRoute[] }
export interface ResolvedRagConfig { enabled?: boolean; defaultKnowledgeBaseId?: string | null; topK?: number; similarityThreshold?: number; retrievalStrategy?: string; citationsEnabled?: boolean; groundedAnswerRequired?: boolean; metadataFilters?: Record<string, string> }
export interface ResolvedMemoryConfig { enabled?: boolean; storeType?: MemoryStoreType; messageWindowSize?: number; ttlMinutes?: number; persistChatHistory?: boolean; summarizeOldMessages?: boolean }
export interface ResolvedToolDefinition { toolName?: string; toolType?: ToolType; requiresApproval?: boolean; timeoutMs?: number | null }
export interface ResolvedToolConfig { enabled?: boolean; allowRuntimeSubsetSelection?: boolean; maxToolCallsPerRequest?: number; toolTimeoutMs?: number; allowedTools?: ResolvedToolDefinition[] }
export interface ResolvedSafetyConfig { blockUnknownTools?: boolean; blockWithoutRagWhenGroundedMode?: boolean; allowDirectModelAnswerWithoutContext?: boolean; maskSensitiveDataInLogs?: boolean; disallowedTopics?: string[] }
export interface ResolvedResponseConfig { defaultTone?: string; defaultFormat?: string; citationRequired?: boolean; markdownEnabled?: boolean; streamEnabled?: boolean; maxOutputTokens?: number }
export interface ResolvedAssistantConfig { assistantCode?: string; tenantId?: string; assistantName?: string; active?: boolean; configVersion?: string; resolvedAt?: string; promptConfig?: ResolvedPromptConfig; modelRoutingConfig?: ResolvedModelRoutingConfig; ragConfig?: ResolvedRagConfig; memoryConfig?: ResolvedMemoryConfig; toolConfig?: ResolvedToolConfig; safetyConfig?: ResolvedSafetyConfig; responseConfig?: ResolvedResponseConfig }

// ── Assistants ────────────────────────────────────────────
export interface AssistantDto { id?: number; assistantCode: string; name: string; description?: string | null; tenantScope?: string | null; configVersion?: string; active?: boolean; createdAt?: string; updatedAt?: string; createdBy?: string | null }
export interface AssistantSummary { assistantCode: string; name: string; tenantScope?: string | null; configVersion?: string; active?: boolean; updatedAt?: string }
export interface CreateAssistantRequest { assistantCode: string; name: string; description?: string | null; tenantScope?: string | null }
export interface UpdateAssistantRequest { name?: string; description?: string | null; tenantScope?: string | null }

// ── Knowledge Bases ───────────────────────────────────────
export interface KnowledgeBaseDto { id?: number; knowledgeBaseId: string; name: string; vectorStoreType?: string; embeddingModel?: string; connectionRef?: string; metadataFilterPolicy?: Record<string, string>; active?: boolean; createdAt?: string; updatedAt?: string }
export interface KnowledgeBaseSummary { knowledgeBaseId: string; name: string; vectorStoreType?: string; active?: boolean; updatedAt?: string }
export interface CreateKnowledgeBaseRequest { knowledgeBaseId: string; name: string; vectorStoreType: string; embeddingModel: string; connectionRef: string; metadataFilterPolicy?: Record<string, string> | null }
export interface UpdateKnowledgeBaseRequest { name?: string; vectorStoreType?: string; embeddingModel?: string; connectionRef?: string; metadataFilterPolicy?: Record<string, string> | null }

// ── Policies ──────────────────────────────────────────────
export interface MemoryPolicyDto { id?: number; assistantCode?: string; memoryEnabled?: boolean; storeType?: MemoryStoreType; messageWindowSize?: number | null; ttlMinutes?: number | null; persistChatHistory?: boolean; summarizeOldMessages?: boolean; updatedAt?: string }
export interface UpsertMemoryPolicyRequest { memoryEnabled: boolean; storeType: MemoryStoreType; messageWindowSize?: number | null; ttlMinutes?: number | null; persistChatHistory?: boolean; summarizeOldMessages?: boolean }
export interface RagPolicyDto { id?: number; assistantCode?: string; ragEnabled?: boolean; defaultKnowledgeBaseId?: string | null; topK?: number | null; similarityThreshold?: number | null; retrievalStrategy?: string | null; citationsEnabled?: boolean; groundedAnswerRequired?: boolean; metadataFilters?: Record<string, string> | null; updatedAt?: string }
export interface UpsertRagPolicyRequest { ragEnabled: boolean; defaultKnowledgeBaseId?: string | null; topK?: number | null; similarityThreshold?: number | null; retrievalStrategy?: string | null; citationsEnabled?: boolean; groundedAnswerRequired?: boolean; metadataFilters?: Record<string, string> | null }
export interface ResponsePolicyDto { id?: number; assistantCode?: string; defaultTone?: string | null; defaultFormat?: string | null; citationRequired?: boolean; markdownEnabled?: boolean; streamEnabled?: boolean; maxOutputTokens?: number | null; updatedAt?: string }
export interface UpsertResponsePolicyRequest { defaultTone?: string | null; defaultFormat?: string | null; citationRequired?: boolean; markdownEnabled?: boolean; streamEnabled?: boolean; maxOutputTokens?: number | null }
export interface SafetyPolicyDto { id?: number; assistantCode?: string; blockUnknownTools?: boolean; blockWithoutRagWhenGroundedMode?: boolean; allowDirectModelAnswerWithoutContext?: boolean; maskSensitiveDataInLogs?: boolean; disallowedTopics?: string[]; updatedAt?: string }
export interface UpsertSafetyPolicyRequest { blockUnknownTools?: boolean; blockWithoutRagWhenGroundedMode?: boolean; allowDirectModelAnswerWithoutContext?: boolean; maskSensitiveDataInLogs?: boolean; disallowedTopics?: string[] | null }
export interface ToolPolicyDto { id?: number; assistantCode?: string; toolName?: string; toolType?: ToolType; enabled?: boolean; requiresApproval?: boolean; timeoutMs?: number | null; createdAt?: string; updatedAt?: string }
export interface CreateToolPolicyRequest { toolName: string; toolType: ToolType; enabled?: boolean; requiresApproval?: boolean; timeoutMs?: number | null }
export interface UpdateToolPolicyRequest { toolName?: string | null; toolType?: ToolType; enabled?: boolean | null; requiresApproval?: boolean | null; timeoutMs?: number | null }

// ── Model Routes ──────────────────────────────────────────
export interface ModelRouteDto { id?: number; assistantCode?: string; routeName?: string; routeType?: RouteType; priority?: number; minPromptLength?: number | null; maxPromptLength?: number | null; ragEnabledOnly?: boolean; toolsRequiredOnly?: boolean; structuredOutputOnly?: boolean; targetProvider?: string; targetModel?: string; maxInputTokens?: number | null; temperature?: number | null; active?: boolean; createdAt?: string; updatedAt?: string }
export interface CreateModelRouteRequest { routeName: string; routeType: RouteType; priority: number; minPromptLength?: number | null; maxPromptLength?: number | null; ragEnabledOnly?: boolean; toolsRequiredOnly?: boolean; structuredOutputOnly?: boolean; targetProvider: string; targetModel: string; maxInputTokens?: number | null; temperature?: number | null; fallbackPolicy?: FallbackPolicy }
export interface UpdateModelRouteRequest { routeName?: string | null; routeType?: RouteType; priority?: number | null; minPromptLength?: number | null; maxPromptLength?: number | null; ragEnabledOnly?: boolean | null; toolsRequiredOnly?: boolean | null; structuredOutputOnly?: boolean | null; targetProvider?: string | null; targetModel?: string | null; maxInputTokens?: number | null; temperature?: number | null; fallbackPolicy?: FallbackPolicy }

// ── Prompt Templates ──────────────────────────────────────
export interface PromptTemplateDto { id?: number; assistantCode?: string; version?: string; active?: boolean; systemPromptTemplate?: string; developerPromptTemplate?: string | null; promptVariables?: Record<string, string> | null; guardrailInstructions?: string[] | null; createdAt?: string; updatedAt?: string; createdBy?: string | null }
export interface PromptTemplateSummary { id?: number; assistantCode?: string; version?: string; active?: boolean; createdAt?: string; createdBy?: string | null }
export interface CreatePromptTemplateRequest { version: string; systemPromptTemplate: string; developerPromptTemplate?: string | null; promptVariables?: Record<string, string> | null; guardrailInstructions?: string[] | null }
export interface UpdatePromptTemplateRequest { version?: string | null; systemPromptTemplate?: string | null; developerPromptTemplate?: string | null; promptVariables?: Record<string, string> | null; guardrailInstructions?: string[] | null }

// ── Executions ────────────────────────────────────────────
export interface ExecutionRecordDto { requestId?: string; sessionId?: string; tenantId?: string; assistantCode?: string; userId?: string; configVersion?: string | null; selectedProvider?: string | null; selectedModel?: string | null; knowledgeBaseId?: string | null; memoryStoreType?: MemoryStoreType; enabledTools?: string[] | null; streamingEnabled?: boolean | null; success?: boolean; errorCode?: string | null; errorMessage?: string | null; inputTokens?: number | null; outputTokens?: number | null; latencyMs?: number | null; startedAt?: string; completedAt?: string | null }

// ── Admin Sessions ────────────────────────────────────────
export interface AdminSessionSummary { sessionId?: string; tenantId?: string; assistantCode?: string; userId?: string; title?: string | null; status?: SessionStatus; messageCount?: number; locale?: string | null; channel?: string | null; createdAt?: string; updatedAt?: string; lastMessageAt?: string | null }

// ── Stats ─────────────────────────────────────────────────
export interface PlatformStatsDto { activeSessions?: number; totalSessionsToday?: number; messagesLast24h?: number; avgLatencyMs?: number | null; totalAssistants?: number; activeAssistants?: number; totalExecutionsToday?: number; failedExecutionsToday?: number; avgOutputTokens?: number | null }

// ── Tenant Overrides ──────────────────────────────────────
export interface TenantOverrideDto { id?: number; tenantId?: string; assistantCode?: string; overrideType?: string; overridePayloadJson?: string; active?: boolean; createdAt?: string; updatedAt?: string; createdBy?: string | null }
export interface CreateTenantOverrideRequest { tenantId: string; assistantCode: string; overrideType: string; overridePayloadJson: string }
export interface UpdateTenantOverrideRequest { overrideType?: string | null; overridePayloadJson?: string | null; active?: boolean | null }

// ── Audit ─────────────────────────────────────────────────
export interface RagAuditRecordDto { id?: number; requestId?: string; sessionId?: string; knowledgeBaseId?: string; retrievedDocumentCount?: number | null; topK?: number | null; similarityThreshold?: number | null; latencyMs?: number | null; groundedMode?: boolean | null; createdAt?: string }
export interface ToolAuditRecordDto { id?: number; requestId?: string; sessionId?: string; toolName?: string; toolType?: ToolType; success?: boolean; latencyMs?: number | null; errorCode?: string | null; errorMessage?: string | null; createdAt?: string }
