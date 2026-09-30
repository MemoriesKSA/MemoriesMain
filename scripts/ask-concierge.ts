// Ask the concierge questions locally, with the same prompt, model and
// settings as /api/concierge, and print her replies.
//
//   npx tsx --env-file=.env.local scripts/ask-concierge.ts ar "كم سعر الخطة؟" "مين انتي؟"
//   npx tsx --env-file=.env.local scripts/ask-concierge.ts ar --model claude-sonnet-5-5 "..."
//
// Each question is one real API call (a few US cents), so this is run by hand
// and is not in run-tests.sh. 30 Sep 2026: written to read ذكرى's Arabic
// before a prompt change goes live, instead of after a visitor finds it odd.

import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPromptParts } from "../app/concierge-data";

const args = process.argv.slice(2);
const locale = args[0] === "en" ? "en" : "ar";
let model = "claude-opus-5-5";
const questions: string[] = [];
for (let i = 1; i < args.length; i++) {
  if (args[i] === "--model") model = args[++i];
  else questions.push(args[i]);
}
if (questions.length === 0) {
  console.error('usage: ask-concierge.ts ar|en [--model id] "question" ...');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// "Thinking off" is spelled differently per model: Sonnet 5 takes disabled,
// Sonnet 5.5 between_tools, Opus 5.5 only adaptive with a low effort.
function thinkingFor(id: string) {
  if (id.startsWith("claude-sonnet-5-5")) return { thinking: { type: "between_tools" } };
  if (id.startsWith("claude-opus-5-5")) return { thinking: { type: "adaptive" }, output_config: { effort: "low" } };
  return { thinking: { type: "disabled" } };
}

async function ask(question: string) {
  const { stable, dynamic } = buildSystemPromptParts(locale, question);
  const reply = await anthropic.messages.create({
    model,
    max_tokens: model.startsWith("claude-opus-5-5") ? 2000 : 600,
    ...(thinkingFor(model) as object),
    system: [
      { type: "text", text: stable, cache_control: { type: "ephemeral" } },
      { type: "text", text: dynamic },
    ],
    messages: [{ role: "user", content: question }],
  });
  const text = reply.content.map((block) => (block.type === "text" ? block.text : "")).join("");
  const u = reply.usage;
  const tokens = `[in ${u.input_tokens}, cache write ${u.cache_creation_input_tokens ?? 0}, cache read ${u.cache_read_input_tokens ?? 0}, out ${u.output_tokens}]`;
  return `${question}\n→ ${text}\n${tokens}`;
}

// One at a time, so the first reply writes the prompt cache and the rest read
// it, the way consecutive visitors do on the live chat.
(async () => {
  const replies: string[] = [];
  for (const question of questions) replies.push(await ask(question));
  console.log(`model: ${model}\n\n${replies.join("\n\n=====\n\n")}`);
})();
