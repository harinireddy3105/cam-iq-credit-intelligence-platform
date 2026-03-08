-- =============================================
-- CAM-IQ Database Schema
-- =============================================

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('credit_officer', 'branch_manager', 'risk_committee', 'admin');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'credit_officer',
  branch TEXT,
  employee_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Assessments table
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_name TEXT NOT NULL,
  cin TEXT,
  sector TEXT,
  loan_requested NUMERIC,
  loan_recommended NUMERIC,
  interest_rate NUMERIC,
  tenure_months INTEGER,
  composite_score INTEGER,
  character_score INTEGER,
  capacity_score INTEGER,
  capital_score INTEGER,
  collateral_score INTEGER,
  conditions_score INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'review', 'approved', 'conditional', 'rejected')),
  recommendation_rationale TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- 6. Fraud flags table
CREATE TABLE public.fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  fraud_type TEXT,
  source_a TEXT,
  source_b TEXT,
  variance_amount TEXT,
  severity TEXT CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  evidence TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;

-- 7. Research findings table
CREATE TABLE public.research_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  source TEXT CHECK (source IN ('MCA', 'eCourts', 'CIBIL', 'News', 'RBI', 'SEBI')),
  finding TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.research_findings ENABLE ROW LEVEL SECURITY;

-- 8. Documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  doc_type TEXT,
  file_name TEXT,
  file_path TEXT,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'processed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 9. Field notes table
CREATE TABLE public.field_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  note_text TEXT,
  affected_dimension TEXT,
  score_delta INTEGER,
  explanation TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.field_notes ENABLE ROW LEVEL SECURITY;

-- 10. Covenants table
CREATE TABLE public.covenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  covenant_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.covenants ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- User roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Assessments
CREATE POLICY "View assessments"
  ON public.assessments FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'branch_manager')
  );

CREATE POLICY "Create assessments"
  ON public.assessments FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Update assessments"
  ON public.assessments FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'branch_manager')
  );

-- Fraud flags
CREATE POLICY "View fraud flags"
  ON public.fraud_flags FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id
    AND (a.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'branch_manager'))
  ));

CREATE POLICY "Insert fraud flags"
  ON public.fraud_flags FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.created_by = auth.uid()
  ));

-- Research findings
CREATE POLICY "View research findings"
  ON public.research_findings FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id
    AND (a.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'branch_manager'))
  ));

CREATE POLICY "Insert research findings"
  ON public.research_findings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.created_by = auth.uid()
  ));

-- Documents
CREATE POLICY "View documents"
  ON public.documents FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id
    AND (a.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'branch_manager'))
  ));

CREATE POLICY "Insert documents"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.created_by = auth.uid()
  ));

-- Field notes
CREATE POLICY "View field notes"
  ON public.field_notes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id
    AND (a.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'branch_manager'))
  ));

CREATE POLICY "Insert field notes"
  ON public.field_notes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.created_by = auth.uid()
  ));

-- Covenants
CREATE POLICY "View covenants"
  ON public.covenants FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id
    AND (a.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'branch_manager'))
  ));

CREATE POLICY "Insert covenants"
  ON public.covenants FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.created_by = auth.uid()
  ));

-- =============================================
-- Triggers
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Storage bucket for documents
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('cam-iq-documents', 'cam-iq-documents', false);

CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cam-iq-documents');

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cam-iq-documents');