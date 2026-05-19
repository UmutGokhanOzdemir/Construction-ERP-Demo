"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import type { Project } from "@/types";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project } = useSWR<Project>(projectId ? `/projects/${projectId}` : null);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar projectId={projectId} projectName={project?.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
