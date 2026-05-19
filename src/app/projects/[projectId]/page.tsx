"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProjectIndexPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  useEffect(() => {
    if (projectId) router.replace(`/projects/${projectId}/dashboard`);
  }, [projectId, router]);

  return null;
}
