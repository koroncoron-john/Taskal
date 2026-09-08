-- maintenance_logs contains private work records and must not be readable
-- through the public API without an authenticated project owner.

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maintenance_logs_select_own" ON public.maintenance_logs;
DROP POLICY IF EXISTS "maintenance_logs_insert_own" ON public.maintenance_logs;
DROP POLICY IF EXISTS "maintenance_logs_update_own" ON public.maintenance_logs;
DROP POLICY IF EXISTS "maintenance_logs_delete_own" ON public.maintenance_logs;

CREATE POLICY "maintenance_logs_select_own"
ON public.maintenance_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.projects
        WHERE projects.id = maintenance_logs.project_id
          AND projects.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY "maintenance_logs_insert_own"
ON public.maintenance_logs
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.projects
        WHERE projects.id = maintenance_logs.project_id
          AND projects.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY "maintenance_logs_update_own"
ON public.maintenance_logs
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.projects
        WHERE projects.id = maintenance_logs.project_id
          AND projects.user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.projects
        WHERE projects.id = maintenance_logs.project_id
          AND projects.user_id = (SELECT auth.uid())
    )
);

CREATE POLICY "maintenance_logs_delete_own"
ON public.maintenance_logs
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.projects
        WHERE projects.id = maintenance_logs.project_id
          AND projects.user_id = (SELECT auth.uid())
    )
);

