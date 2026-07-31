import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { LinearClient } from "./linear/client.js";
import { getTemplate, renderTemplate, templates } from "./linear/templates.js";

const app = express();
const port = Number(process.env.LINEAR_GENERATOR_PORT || 3001);
const corsOrigin = process.env.LINEAR_GENERATOR_CORS_ORIGIN || process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));

const SyncSchema = z.object({
  templateId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  teamId: z.string().min(1).optional(),
  variables: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional().default({}),
  dryRun: z.boolean().optional().default(true),
});

function getConfig(body) {
  return {
    apiKey: process.env.LINEAR_API_KEY,
    projectId: body.projectId || process.env.LINEAR_DEFAULT_PROJECT_ID,
    teamId: body.teamId || process.env.LINEAR_DEFAULT_TEAM_ID,
  };
}

function issueMarker(templateId, issueKey) {
  return `<!-- pc-linear-generator:${templateId}:${issueKey} -->`;
}

function buildIssueDescription(templateId, item) {
  const dependencyText = item.dependencies?.length
    ? `\n\n## Dependencias lógicas\n${item.dependencies.map((key) => `- ${key}`).join("\n")}`
    : "";
  return `${item.description}${dependencyText}\n\n${issueMarker(templateId, item.key)}`;
}

function preview(templateId, variables) {
  const template = getTemplate(templateId);
  if (!template) return null;
  const rendered = renderTemplate(template, variables);
  return {
    id: rendered.id,
    name: rendered.name,
    organization: rendered.organization,
    description: rendered.description,
    issueCount: rendered.issues.length,
    issues: rendered.issues.map((item) => ({
      ...item,
      description: buildIssueDescription(templateId, item),
    })),
  };
}

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "pc-linear-project-generator",
    apiKeyConfigured: Boolean(process.env.LINEAR_API_KEY),
    defaultProjectConfigured: Boolean(process.env.LINEAR_DEFAULT_PROJECT_ID),
    defaultTeamConfigured: Boolean(process.env.LINEAR_DEFAULT_TEAM_ID),
  });
});

app.get("/templates", (req, res) => {
  res.json(
    templates.map(({ id, name, organization, description, issues }) => ({
      id,
      name,
      organization,
      description,
      issueCount: issues.length,
    }))
  );
});

app.post("/preview", (req, res) => {
  const parsed = SyncSchema.safeParse({ ...req.body, dryRun: true });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const result = preview(parsed.data.templateId, parsed.data.variables);
  if (!result) return res.status(404).json({ error: "Plantilla no encontrada." });
  res.json(result);
});

app.post("/sync", async (req, res) => {
  const parsed = SyncSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const rendered = preview(parsed.data.templateId, parsed.data.variables);
  if (!rendered) return res.status(404).json({ error: "Plantilla no encontrada." });

  const config = getConfig(parsed.data);
  if (!config.projectId || !config.teamId) {
    return res.status(400).json({
      error: "Falta projectId o teamId. Envíalos en la solicitud o configura LINEAR_DEFAULT_PROJECT_ID y LINEAR_DEFAULT_TEAM_ID.",
    });
  }

  if (parsed.data.dryRun) {
    return res.json({
      ok: true,
      dryRun: true,
      projectId: config.projectId,
      teamId: config.teamId,
      created: [],
      skipped: [],
      preview: rendered,
    });
  }

  if (!config.apiKey) {
    return res.status(503).json({ error: "LINEAR_API_KEY no está configurada en el servidor." });
  }

  try {
    const client = new LinearClient({ apiKey: config.apiKey });
    const project = await client.getProject(config.projectId);
    if (!project) return res.status(404).json({ error: "Proyecto de Linear no encontrado." });

    const projectTeamIds = new Set(project.teams.nodes.map((team) => team.id));
    if (!projectTeamIds.has(config.teamId)) {
      return res.status(400).json({ error: "El teamId indicado no pertenece al proyecto seleccionado." });
    }

    const existingDescriptions = project.issues.nodes.map((item) => item.description || "");
    const milestonesByName = new Map(
      project.projectMilestones.nodes.map((milestone) => [milestone.name.toLowerCase(), milestone.id])
    );

    const created = [];
    const skipped = [];

    for (const item of rendered.issues) {
      const marker = issueMarker(parsed.data.templateId, item.key);
      const existing = project.issues.nodes.find((candidate, index) => existingDescriptions[index].includes(marker));
      if (existing) {
        skipped.push({ key: item.key, reason: "already_exists", issue: existing });
        continue;
      }

      const projectMilestoneId = item.milestone
        ? milestonesByName.get(item.milestone.toLowerCase()) || undefined
        : undefined;

      const input = {
        teamId: config.teamId,
        projectId: config.projectId,
        title: item.title,
        description: item.description,
        priority: item.priority,
      };

      if (item.dueDate) input.dueDate = item.dueDate;
      if (projectMilestoneId) input.projectMilestoneId = projectMilestoneId;

      const createdIssue = await client.createIssue(input);
      created.push({ key: item.key, issue: createdIssue });
    }

    res.json({
      ok: true,
      dryRun: false,
      project: { id: project.id, name: project.name, url: project.url },
      created,
      skipped,
    });
  } catch (error) {
    console.error("Linear generator sync failed", error);
    res.status(502).json({
      error: error.message || "No fue posible sincronizar con Linear.",
      details: error.details || null,
    });
  }
});

app.listen(port, () => {
  console.log(`Linear Project Generator disponible en http://localhost:${port}`);
});
