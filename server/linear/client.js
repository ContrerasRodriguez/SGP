const LINEAR_API_URL = "https://api.linear.app/graphql";

export class LinearApiError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = "LinearApiError";
    this.details = details;
  }
}

export class LinearClient {
  constructor({ apiKey, apiUrl = LINEAR_API_URL }) {
    if (!apiKey) throw new Error("LINEAR_API_KEY no está configurada.");
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async request(query, variables = {}) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.apiKey,
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new LinearApiError(`Linear respondió HTTP ${response.status}.`, payload);
    }

    if (!payload || payload.errors?.length) {
      const message = payload?.errors?.map((item) => item.message).join("; ") || "Respuesta inválida de Linear.";
      throw new LinearApiError(message, payload?.errors || payload);
    }

    return payload.data;
  }

  async getViewer() {
    const data = await this.request(`query Viewer { viewer { id name email } }`);
    return data.viewer;
  }

  async getProject(projectId) {
    const data = await this.request(
      `query Project($id: String!) {
        project(id: $id) {
          id
          name
          url
          teams { nodes { id name key } }
          projectMilestones { nodes { id name targetDate } }
          issues(first: 250) {
            nodes { id identifier title description url }
          }
        }
      }`,
      { id: projectId }
    );
    return data.project;
  }

  async createIssue(input) {
    const data = await this.request(
      `mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue { id identifier title url }
        }
      }`,
      { input }
    );

    if (!data.issueCreate?.success || !data.issueCreate?.issue) {
      throw new LinearApiError("Linear no confirmó la creación del issue.", data.issueCreate);
    }

    return data.issueCreate.issue;
  }
}
