import { createFileRoute } from "@tanstack/react-router";
import { ProjectForm } from "@/components/admin/project-form";

export const Route = createFileRoute("/admin/projects/new")({
  head: () => ({ meta: [{ title: "New Project — Admin" }] }),
  component: () => <ProjectForm mode="create" />,
});
