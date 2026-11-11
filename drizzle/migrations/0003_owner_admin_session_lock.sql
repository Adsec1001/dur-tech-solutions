CREATE TABLE public.admin_sessions (
 session_id uuid PRIMARY KEY,
 user_id uuid NOT NULL,
 started_at timestamptz NOT NULL DEFAULT now(),
 last_activity_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')
);
GRANT ALL ON public.admin_sessions TO service_role;
REVOKE ALL ON public.admin_sessions FROM anon, authenticated;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.start_admin_session() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sid uuid := (auth.jwt()->>'session_id')::uuid;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles r ON r.user_id=u.id JOIN auth.sessions s ON s.user_id=u.id WHERE u.id=auth.uid() AND lower(u.email)='durbilisimguvenlik@gmail.com' AND u.email_confirmed_at IS NOT NULL AND u.is_anonymous IS NOT TRUE AND r.role='admin' AND s.id=sid AND s.created_at > now()-interval '60 seconds') THEN RETURN false; END IF;
 INSERT INTO public.admin_sessions(session_id,user_id) VALUES(sid,auth.uid()) ON CONFLICT DO NOTHING;
 RETURN EXISTS (SELECT 1 FROM public.admin_sessions WHERE session_id=sid AND user_id=auth.uid() AND expires_at>now() AND last_activity_at>now()-interval '10 minutes');
END $$;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT _user_id=auth.uid() AND EXISTS (
 SELECT 1 FROM public.user_roles r JOIN auth.users u ON u.id=r.user_id JOIN public.admin_sessions a ON a.user_id=u.id JOIN auth.sessions s ON s.id=a.session_id AND s.user_id=u.id
 WHERE r.user_id=_user_id AND r.role=_role AND lower(u.email)='durbilisimguvenlik@gmail.com' AND u.email_confirmed_at IS NOT NULL AND u.is_anonymous IS NOT TRUE AND a.session_id=(auth.jwt()->>'session_id')::uuid AND a.expires_at>now() AND a.last_activity_at>now()-interval '10 minutes' AND (s.not_after IS NULL OR s.not_after>now())
 );
$$;
CREATE OR REPLACE FUNCTION public.touch_admin_session() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RETURN false; END IF;
 UPDATE public.admin_sessions SET last_activity_at=now() WHERE session_id=(auth.jwt()->>'session_id')::uuid AND user_id=auth.uid();
 RETURN true;
END $$;
CREATE OR REPLACE FUNCTION public.end_admin_session() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
 DELETE FROM public.admin_sessions WHERE session_id=(auth.jwt()->>'session_id')::uuid AND user_id=auth.uid();
$$;
REVOKE ALL ON FUNCTION public.start_admin_session(), public.touch_admin_session(), public.end_admin_session() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_admin_session(), public.touch_admin_session(), public.end_admin_session() TO authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated;
ALTER POLICY "Read own roles" ON public.user_roles USING (user_id=auth.uid() AND public.has_role(auth.uid(),'admin'));
