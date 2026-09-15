
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','bride','vendor');
CREATE TYPE public.user_type AS ENUM ('bride','vendor');
CREATE TYPE public.vendor_status AS ENUM ('pendente','aprovado','rejeitado','suspenso');
CREATE TYPE public.task_status AS ENUM ('nao_iniciado','pesquisando','contato','negociacao','contratado');
CREATE TYPE public.lead_status AS ENUM ('novo','contatado','negociacao','fechado','perdido');
CREATE TYPE public.sub_status AS ENUM ('trialing','active','past_due','canceled','none');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  phone text,
  city text,
  state text,
  type public.user_type NOT NULL DEFAULT 'bride',
  referral_code text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '💍',
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- BRIDES
CREATE TABLE public.brides (
  id uuid PRIMARY KEY,
  wedding_date date,
  guests int,
  budget numeric,
  partner_name text,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brides TO authenticated;
GRANT ALL ON public.brides TO service_role;
ALTER TABLE public.brides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bride self" ON public.brides FOR ALL TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (id = auth.uid());

-- VENDORS
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  slug text UNIQUE NOT NULL,
  company_name text NOT NULL,
  owner_name text,
  primary_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  description text,
  city text,
  state text,
  address text,
  whatsapp text,
  email text,
  instagram text,
  website text,
  price_from numeric,
  price_to numeric,
  logo_url text,
  cover_url text,
  rating numeric NOT NULL DEFAULT 0,
  reviews_count int NOT NULL DEFAULT 0,
  views int NOT NULL DEFAULT 0,
  whatsapp_clicks int NOT NULL DEFAULT 0,
  status public.vendor_status NOT NULL DEFAULT 'pendente',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors public read approved" ON public.vendors FOR SELECT TO anon, authenticated USING (status = 'aprovado');
CREATE POLICY "vendors owner read" ON public.vendors FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "vendors owner insert" ON public.vendors FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "vendors owner update" ON public.vendors FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "vendors admin delete" ON public.vendors FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.vendor_categories (
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (vendor_id, category_id)
);
GRANT SELECT ON public.vendor_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_categories TO authenticated;
GRANT ALL ON public.vendor_categories TO service_role;
ALTER TABLE public.vendor_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vc public read" ON public.vendor_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "vc owner write" ON public.vendor_categories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND (v.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()));

CREATE TABLE public.vendor_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendor_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_services TO authenticated;
GRANT ALL ON public.vendor_services TO service_role;
ALTER TABLE public.vendor_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vs public read" ON public.vendor_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "vs owner write" ON public.vendor_services FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND (v.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()));

CREATE TABLE public.vendor_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.vendor_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_photos TO authenticated;
GRANT ALL ON public.vendor_photos TO service_role;
ALTER TABLE public.vendor_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vp public read" ON public.vendor_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "vp owner write" ON public.vendor_photos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND (v.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()));

-- FAVORITES
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, vendor_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fav self" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- WEDDING TASKS
CREATE TABLE public.wedding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bride_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  status public.task_status NOT NULL DEFAULT 'nao_iniciado',
  planned_budget numeric,
  contracted_value numeric,
  paid_value numeric,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bride_id, category_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wedding_tasks TO authenticated;
GRANT ALL ON public.wedding_tasks TO service_role;
ALTER TABLE public.wedding_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks self" ON public.wedding_tasks FOR ALL TO authenticated USING (bride_id = auth.uid()) WITH CHECK (bride_id = auth.uid());

-- LEADS
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  bride_id uuid NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  bride_name text,
  city text,
  state text,
  wedding_date date,
  message text,
  status public.lead_status NOT NULL DEFAULT 'novo',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads bride insert" ON public.leads FOR INSERT TO authenticated WITH CHECK (bride_id = auth.uid());
CREATE POLICY "leads bride read" ON public.leads FOR SELECT TO authenticated USING (bride_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()));
CREATE POLICY "leads vendor update" ON public.leads FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vendor_id, user_id)
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (approved = true OR user_id = auth.uid());
CREATE POLICY "reviews self write" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews self update" ON public.reviews FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reviews admin delete" ON public.reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') OR user_id = auth.uid());

-- SUBSCRIPTIONS / PAYMENTS
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan public.user_type NOT NULL,
  status public.sub_status NOT NULL DEFAULT 'none',
  provider text,
  provider_subscription_id text,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs self read" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "subs self insert" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "subs admin update" ON public.subscriptions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL,
  provider text,
  provider_payment_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments self read" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif self" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- APP SETTINGS
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings read" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.app_settings (key, value) VALUES ('trial', '{"enabled": false, "days": 7}'::jsonb);

-- CATEGORIES SEED
INSERT INTO public.categories (slug, name, emoji, sort_order) VALUES
('espaco','Espaço','🏛️',1),
('cerimonial','Cerimonial','💍',2),
('fotografia','Fotografia','📸',3),
('filmagem','Filmagem','🎥',4),
('buffet','Buffet','🍽️',5),
('decoracao','Decoração','🌸',6),
('dj','DJ','🎧',7),
('banda','Banda','🎸',8),
('maquiagem','Maquiagem','💄',9),
('cabelo','Cabelo','💇',10),
('vestido','Vestido','👗',11),
('terno','Terno','🤵',12),
('bolo','Bolo','🍰',13),
('doces','Doces','🍬',14),
('bebidas','Bebidas','🥂',15),
('flores','Flores','🌷',16),
('convites','Convites','💌',17),
('lembrancinhas','Lembrancinhas','🎁',18),
('transporte','Transporte','🚗',19),
('seguranca','Segurança','🛡️',20),
('bartender','Bartender','🍸',21),
('food-truck','Food Truck','🚚',22),
('fondue','Fondue','🍫',23),
('milk-shake','Milk-shake','🥤',24),
('iluminacao','Iluminação','💡',25),
('som','Som','🔊',26),
('mobiliario','Mobiliário','🪑',27),
('outros','Outros','✨',28);

-- DEMO VENDORS (fictional data)
INSERT INTO public.vendors (slug, company_name, owner_name, primary_category_id, description, city, state, whatsapp, email, instagram, price_from, price_to, cover_url, logo_url, rating, reviews_count, status, is_demo) VALUES
('studio-amor-fotografia','Studio Amor Fotografia','Marina Lopes',(SELECT id FROM public.categories WHERE slug='fotografia'),'Fotografia de casamento com olhar documental e luz natural. Cobertura completa do making of à festa. (Dados fictícios de demonstração)','Rio de Janeiro','RJ','5521999990001','contato@studioamor.demo','@studioamor',1500,6000,'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200','https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=300',4.9,42,'aprovado',true),
('makeup-da-noiva','Makeup da Noiva','Carla Ferreira',(SELECT id FROM public.categories WHERE slug='maquiagem'),'Maquiagem e beleza para noivas, madrinhas e mães. Atendimento a domicílio. (Dados fictícios de demonstração)','São Paulo','SP','5511999990002','contato@makeupdanoiva.demo','@makeupdanoiva',450,1800,'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300',4.8,31,'aprovado',true),
('dj-celebration','DJ Celebration','Rafael Souza',(SELECT id FROM public.categories WHERE slug='dj'),'DJ, som e pista de dança para casamentos inesquecíveis. (Dados fictícios de demonstração)','Belo Horizonte','MG','5531999990003','contato@djcelebration.demo','@djcelebration',1200,4000,'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200','https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',4.7,18,'aprovado',true),
('eventos-e-sonhos','Eventos & Sonhos Cerimonial','Patrícia Nunes',(SELECT id FROM public.categories WHERE slug='cerimonial'),'Assessoria e cerimonial completo, do planejamento ao grande dia. (Dados fictícios de demonstração)','Curitiba','PR','5541999990004','contato@eventosesonhos.demo','@eventosesonhos',2500,9000,'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200','https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300',5.0,24,'aprovado',true),
('fondue-gourmet-eventos','Fondue Gourmet Eventos','Bruno Martins',(SELECT id FROM public.categories WHERE slug='fondue'),'Estação de fondue gourmet com chocolates nobres e frutas frescas. (Dados fictícios de demonstração)','Porto Alegre','RS','5551999990005','contato@fonduegourmet.demo','@fonduegourmet',900,2500,'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=1200','https://images.unsplash.com/photo-1511381939415-e44015466834?w=300',4.6,12,'aprovado',true),
('milk-shake-fest','Milk Shake Fest','Juliana Reis',(SELECT id FROM public.categories WHERE slug='milk-shake'),'Carrinho de milk-shakes artesanais para a festa. (Dados fictícios de demonstração)','Salvador','BA','5571999990006','contato@milkshakefest.demo','@milkshakefest',700,1900,'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=1200','https://images.unsplash.com/photo-1553787499-6f9133860278?w=300',4.5,9,'aprovado',true),
('doce-encanto','Doce Encanto','Fernanda Lima',(SELECT id FROM public.categories WHERE slug='doces'),'Doces finos e mesa de sobremesas personalizada. (Dados fictícios de demonstração)','Recife','PE','5581999990007','contato@doceencanto.demo','@doceencanto',800,3200,'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1200','https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=300',4.9,27,'aprovado',true),
('buffet-jardim','Buffet Jardim','Antônio Prado',(SELECT id FROM public.categories WHERE slug='buffet'),'Buffet completo com menu autoral e serviço de equipe. (Dados fictícios de demonstração)','São Paulo','SP','5511999990008','contato@buffetjardim.demo','@buffetjardim',9000,35000,'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300',4.7,35,'aprovado',true),
('flores-e-amor','Flores & Amor','Helena Castro',(SELECT id FROM public.categories WHERE slug='flores'),'Projetos florais românticos para cerimônia e recepção. (Dados fictícios de demonstração)','Florianópolis','SC','5548999990009','contato@floresamor.demo','@floresamor',1100,7000,'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=1200','https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=300',4.8,21,'aprovado',true),
('cine-casamento-filmes','Cine Casamento Filmes','Diego Alves',(SELECT id FROM public.categories WHERE slug='filmagem'),'Filmes de casamento com estética cinematográfica. (Dados fictícios de demonstração)','Rio de Janeiro','RJ','5521999990010','contato@cinecasamento.demo','@cinecasamento',2000,8000,'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200','https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300',4.6,14,'aprovado',true),
('villa-das-oliveiras','Villa das Oliveiras','Ricardo Menezes',(SELECT id FROM public.categories WHERE slug='espaco'),'Espaço ao ar livre com vista para a serra e estrutura completa. (Dados fictícios de demonstração)','Campinas','SP','5519999990011','contato@villaoliveiras.demo','@villaoliveiras',12000,40000,'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200','https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=300',4.9,38,'aprovado',true),
('ateliê-bolo-de-noiva','Ateliê Bolo de Noiva','Sonia Mendes',(SELECT id FROM public.categories WHERE slug='bolo'),'Bolos de casamento artesanais e personalizados. (Dados fictícios de demonstração)','Goiânia','GO','5562999990012','contato@bolodenoiva.demo','@bolodenoiva',600,2800,'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1200','https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=300',4.7,16,'aprovado',true);

INSERT INTO public.vendor_categories (vendor_id, category_id)
SELECT id, primary_category_id FROM public.vendors WHERE primary_category_id IS NOT NULL;

INSERT INTO public.vendor_services (vendor_id, name, description, price)
SELECT v.id, 'Pacote Essencial', 'Cobertura básica com entrega digital.', v.price_from FROM public.vendors v WHERE v.is_demo;
INSERT INTO public.vendor_services (vendor_id, name, description, price)
SELECT v.id, 'Pacote Completo', 'Serviço completo com equipe e extras.', v.price_to FROM public.vendors v WHERE v.is_demo;

INSERT INTO public.vendor_photos (vendor_id, url, sort_order)
SELECT v.id, v.cover_url, 0 FROM public.vendors v WHERE v.is_demo;
INSERT INTO public.vendor_photos (vendor_id, url, sort_order)
SELECT v.id, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900', 1 FROM public.vendors v WHERE v.is_demo;
INSERT INTO public.vendor_photos (vendor_id, url, sort_order)
SELECT v.id, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900', 2 FROM public.vendors v WHERE v.is_demo;
