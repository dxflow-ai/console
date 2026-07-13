import { shape, type ShapeInfer } from "@diphyx/harlemify/runtime";

export const agentSessionShape = shape((factory) => {
    return {
        identity: factory.string().meta({ identifier: true }),
        workflow: factory.string().optional(),
        created_at: factory.number(),
    };
});

export type AgentSession = ShapeInfer<typeof agentSessionShape>;

export type AgentSessionToolCall = {
    id: string;
    name: string;
    argument?: string;
};

export type AgentSessionToolResult = {
    id: string;
    name: string;
    output: string;
    failed?: boolean;
};

export type AgentSessionTurn = {
    role: "user" | "model" | "tool";
    content?: string;
    tool_calls?: AgentSessionToolCall[];
    tool_results?: AgentSessionToolResult[];
};

export type AgentSessionUsage = {
    input: number;
    output: number;
    cache_write: number;
    cache_read: number;
};

export type AgentSessionDetail = AgentSession & {
    history: AgentSessionTurn[];
    usage: AgentSessionUsage;
};

export type AgentReplyType = "message" | "tool_run" | "tool_success" | "tool_failed";

export type AgentReply = {
    type: AgentReplyType;
    message?: string;
    tool?: string;
    argument?: string;
};

export type AgentToolStatus = "running" | "success" | "failed";

export type AgentTool = {
    id: string;
    name: string;
    status: AgentToolStatus;
};

export type AgentMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
    tools?: AgentTool[];
    timestamp: number;
};

export type AgentUsage = {
    input: number;
    output: number;
};
