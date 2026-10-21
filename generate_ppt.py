"""
Generate professional, branded PowerPoint presentation for NammaKannada.
Presenter: Reetu Parabat
"""
import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Brand Colors
    C_BG_DARK = RGBColor(15, 23, 42)      # Slate 950 #0f172a
    C_CARD_DARK = RGBColor(30, 41, 59)    # Slate 800 #1e293b
    C_CARD_LIGHT = RGBColor(248, 250, 252) # Slate 50 #f8fafc
    C_CARD_BORDER = RGBColor(51, 65, 85)  # Slate 700 #334155
    C_AMBER = RGBColor(245, 158, 11)      # Amber 500 #f59e0b
    C_AMBER_LIGHT = RGBColor(254, 243, 199) # Amber 100 #fef3c7
    C_WHITE = RGBColor(255, 255, 255)
    C_TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400 #94a3b8
    C_TEXT_DARK = RGBColor(30, 41, 59)    # Slate 800
    C_EMERALD = RGBColor(16, 185, 129)    # Emerald 500
    C_SKY = RGBColor(14, 165, 233)        # Sky 500

    def add_header(slide, title_text, category_text="NAMMAKANNADA"):
        # Category tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        tf_cat.margin_left = tf_cat.margin_right = tf_cat.margin_top = tf_cat.margin_bottom = 0
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = f"{category_text} • ನಮ್ಮ ಕನ್ನಡ"
        p_cat.font.name = "Arial"
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_AMBER

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_right = tf_title.margin_top = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.name = "Arial"
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = C_WHITE

    def add_footer(slide):
        # Divider line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(6.9), Inches(11.733), Inches(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = C_CARD_BORDER
        line.line.color.rgb = C_CARD_BORDER

        # Footer text
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.95), Inches(11.733), Inches(0.35))
        tf = footer_box.text_frame
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = "NammaKannada — Context-Aware Everyday Kannada Learning Platform  |  Presenter: Reetu Parabat"
        p.font.name = "Arial"
        p.font.size = Pt(10)
        p.font.color.rgb = C_TEXT_MUTED

    def set_slide_background(slide, color=C_BG_DARK):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, C_BG_DARK)

    # Accent decorative banner card
    dec_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(11.733), Inches(5.1))
    dec_card.fill.solid()
    dec_card.fill.fore_color.rgb = C_CARD_DARK
    dec_card.line.color.rgb = C_CARD_BORDER
    dec_card.line.width = Pt(1.5)

    # Logo badge
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(1.7), Inches(1.1), Inches(1.1))
    badge.fill.solid()
    badge.fill.fore_color.rgb = C_AMBER
    badge.line.fill.background()
    tf_b = badge.text_frame
    tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_b = tf_b.paragraphs[0]
    p_b.alignment = PP_ALIGN.CENTER
    p_b.text = "NK"
    p_b.font.name = "Arial"
    p_b.font.size = Pt(32)
    p_b.font.bold = True
    p_b.font.color.rgb = C_BG_DARK

    # Title & Subtitle box
    t_box = s1.shapes.add_textbox(Inches(2.7), Inches(1.6), Inches(9.3), Inches(1.4))
    tf = t_box.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "NammaKannada"
    p1.font.name = "Arial"
    p1.font.size = Pt(40)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE

    p2 = tf.add_paragraph()
    p2.text = "ನಮ್ಮ ಕನ್ನಡ • Everyday Kannada Learning & Communication Platform"
    p2.font.name = "Arial"
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = C_AMBER

    # Divider
    div = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.3), Inches(3.2), Inches(10.7), Inches(0.02))
    div.fill.solid()
    div.fill.fore_color.rgb = C_CARD_BORDER
    div.line.fill.background()

    # Description & Details
    desc_box = s1.shapes.add_textbox(Inches(1.3), Inches(3.5), Inches(10.7), Inches(1.4))
    tf_d = desc_box.text_frame
    tf_d.word_wrap = True
    pd1 = tf_d.paragraphs[0]
    pd1.text = "A context-aware, offline-first situational learning platform designed to bridge the linguistic gap for migrants, students, and professionals in Karnataka through interactive dialogues, voice training, and real-world scenarios."
    pd1.font.name = "Arial"
    pd1.font.size = Pt(15)
    pd1.font.color.rgb = C_TEXT_MUTED

    # Meta card for presenter info
    meta_box = s1.shapes.add_textbox(Inches(1.3), Inches(5.1), Inches(10.7), Inches(0.9))
    tf_m = meta_box.text_frame
    pm1 = tf_m.paragraphs[0]
    pm1.text = "Presenter: Reetu Parabat"
    pm1.font.name = "Arial"
    pm1.font.size = Pt(18)
    pm1.font.bold = True
    pm1.font.color.rgb = C_WHITE

    pm2 = tf_m.add_paragraph()
    pm2.text = "Kannada Digital Innovation Hackathon 2026 (HackerRank Campus Crew, NIE Mysuru)\nPrimary: Problem Statement 3 (Kannada in Everyday Life)  •  Aligned with PS 1 & PS 2"
    pm2.font.name = "Arial"
    pm2.font.size = Pt(12.5)
    pm2.font.color.rgb = C_AMBER

    # ==========================================
    # SLIDE 2: PROBLEM STATEMENT
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, C_BG_DARK)
    add_header(s2, "Problem Statement 3: Kannada in Everyday Life", "PROBLEM STATEMENT 3 (PRIMARY) & PS 1")
    add_footer(s2)

    col_w = Inches(3.64)
    h_card = Inches(4.8)
    top_card = Inches(1.8)

    # Card 1: The Problem Chosen
    c1 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top_card, col_w, h_card)
    c1.fill.solid(); c1.fill.fore_color.rgb = C_CARD_DARK; c1.line.color.rgb = C_CARD_BORDER
    tb1 = s2.shapes.add_textbox(Inches(1.05), top_card + Inches(0.25), col_w - Inches(0.5), h_card - Inches(0.5))
    tf1 = tb1.text_frame; tf1.word_wrap = True
    p = tf1.paragraphs[0]; p.text = "1. The Core Problem"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_AMBER
    bullets1 = [
        "Acute language barrier faced by non-Kannada speakers during daily transit, essential services, and healthcare.",
        "Crucial everyday situations (auto meters, BMTC bus stops, clinic visits, vegetable markets) create immediate communication paralysis.",
        "Fear of miscommunication or causing unintentional offense leads to social anxiety and friction."
    ]
    for b in bullets1:
        pb = tf1.add_paragraph(); pb.text = "• " + b; pb.font.size = Pt(13); pb.font.color.rgb = C_WHITE; pb.space_before = Pt(10)

    # Card 2: Who is Affected
    c2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.84), top_card, col_w, h_card)
    c2.fill.solid(); c2.fill.fore_color.rgb = C_CARD_DARK; c2.line.color.rgb = C_CARD_BORDER
    tb2 = s2.shapes.add_textbox(Inches(5.09), top_card + Inches(0.25), col_w - Inches(0.5), h_card - Inches(0.5))
    tf2 = tb2.text_frame; tf2.word_wrap = True
    p = tf2.paragraphs[0]; p.text = "2. Target Population"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_AMBER
    bullets2 = [
        "15M+ Migrants & Tech Professionals relocating to Bengaluru and Karnataka's industrial hubs.",
        "Out-of-state College Students navigating campuses, PG accommodations, and local transit.",
        "Healthcare Seekers & Elders who need immediate, accurate translation during medical visits.",
        "Local Drivers & Vendors who experience operational friction and misinterpretation daily."
    ]
    for b in bullets2:
        pb = tf2.add_paragraph(); pb.text = "• " + b; pb.font.size = Pt(13); pb.font.color.rgb = C_WHITE; pb.space_before = Pt(10)

    # Card 3: Why It Matters
    c3 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.88), top_card, col_w, h_card)
    c3.fill.solid(); c3.fill.fore_color.rgb = C_CARD_DARK; c3.line.color.rgb = C_CARD_BORDER
    tb3 = s2.shapes.add_textbox(Inches(9.13), top_card + Inches(0.25), col_w - Inches(0.5), h_card - Inches(0.5))
    tf3 = tb3.text_frame; tf3.word_wrap = True
    p = tf3.paragraphs[0]; p.text = "3. Why It Truly Matters"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_AMBER
    bullets3 = [
        "Cultural Respect & Harmony: Speaking even basic conversational Kannada demonstrates respect and fosters community integration.",
        "Daily Safety & Autonomy: Essential for negotiating fair fares, understanding bus stages, and describing physical health symptoms.",
        "Preserving Heritage: Revitalizes Kannada usage by making it accessible and welcoming to new residents."
    ]
    for b in bullets3:
        pb = tf3.add_paragraph(); pb.text = "• " + b; pb.font.size = Pt(13); pb.font.color.rgb = C_WHITE; pb.space_before = Pt(10)

    # ==========================================
    # SLIDE 3: EXISTING SYSTEM & LIMITATIONS
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, C_BG_DARK)
    add_header(s3, "Existing System: Current Landscape vs Critical Gaps")
    add_footer(s3)

    col2_w = Inches(5.66)
    # Left Card: Existing Solutions
    left_c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), col2_w, Inches(4.8))
    left_c.fill.solid(); left_c.fill.fore_color.rgb = C_CARD_DARK; left_c.line.color.rgb = C_CARD_BORDER
    ltb = s3.shapes.add_textbox(Inches(1.1), Inches(2.05), col2_w - Inches(0.6), Inches(4.3))
    ltf = ltb.text_frame; ltf.word_wrap = True
    p = ltf.paragraphs[0]; p.text = "How the Problem is Handled Today"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_SKY
    ex_items = [
        ("Generic Language Apps (Duolingo, etc.):", "Focus heavily on European languages; Kannada content is virtually absent or strictly academic."),
        ("Traditional Grammar Textbooks:", "Teach formal, literary Kannada ('The cow grazes in the meadow') rather than street-smart colloquial phrases."),
        ("Google Translate / General MT:", "Produces robotic, overly literal translations devoid of local Bengaluru idioms ('Adjust maadi', 'Meter haaki')."),
        ("Scattered YouTube / Instagram Reels:", "Fragmented, non-interactive, passive video consumption with zero retention testing or offline support.")
    ]
    for title, desc in ex_items:
        pt = ltf.add_paragraph(); pt.text = title; pt.font.bold = True; pt.font.size = Pt(13); pt.font.color.rgb = C_WHITE; pt.space_before = Pt(8)
        pd = ltf.add_paragraph(); pd.text = desc; pd.font.size = Pt(12); pd.font.color.rgb = C_TEXT_MUTED

    # Right Card: Limitations & Gaps
    right_c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.86), Inches(1.8), col2_w, Inches(4.8))
    right_c.fill.solid(); right_c.fill.fore_color.rgb = C_CARD_DARK; right_c.line.color.rgb = C_CARD_BORDER
    rtb = s3.shapes.add_textbox(Inches(7.16), Inches(2.05), col2_w - Inches(0.6), Inches(4.3))
    rtf = rtb.text_frame; rtf.word_wrap = True
    p = rtf.paragraphs[0]; p.text = "Critical Limitations & Market Gaps"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = RGBColor(239, 68, 68)
    gaps = [
        ("Zero Situational Context:", "Learners know random words ('Mane' = house) but cannot form a sentence to ask a bus conductor for a ticket."),
        ("Connectivity Dependence:", "Translation tools fail when most needed: basement metro concourses, remote highways, or crowded vegetable mandis."),
        ("No Phonetic Guidance:", "Kannada script is intimidating for beginners; tools lack romanized phonetic transliteration and spoken feedback."),
        ("No Editorial Verification:", "Crowdsourced forums frequently contain incorrect grammar, offensive slang, or outdated regional dialects.")
    ]
    for title, desc in gaps:
        pt = rtf.add_paragraph(); pt.text = title; pt.font.bold = True; pt.font.size = Pt(13); pt.font.color.rgb = C_WHITE; pt.space_before = Pt(8)
        pd = rtf.add_paragraph(); pd.text = desc; pd.font.size = Pt(12); pd.font.color.rgb = C_TEXT_MUTED

    # ==========================================
    # SLIDE 4: HOW YOUR SOLUTION IS DIFFERENT
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, C_BG_DARK)
    add_header(s4, "How NammaKannada Is Different: 4 Core Innovations")
    add_footer(s4)

    # 4 distinct value prop cards in 2x2 grid
    card_w = Inches(5.66)
    card_h = Inches(2.3)
    coords = [
        (Inches(0.8), Inches(1.8)),
        (Inches(6.86), Inches(1.8)),
        (Inches(0.8), Inches(4.35)),
        (Inches(6.86), Inches(4.35))
    ]

    innovations = [
        {
            "num": "01",
            "title": "Hyper-Contextual Life Scenarios",
            "bullets": [
                "Organized strictly by daily situations: Auto Booking, BMTC Bus, Clinic, Darshini Dining, College Admin, House Rental.",
                "Real spoken colloquial dialect: 'Eshtu aagutte?', 'Meter haaki', 'Adjust maadi'."
            ],
            "accent": C_AMBER
        },
        {
            "num": "02",
            "title": "Offline-First PWA & WebAPK",
            "bullets": [
                "Full situational phrasebook and audio manifests cached locally via IndexedDB and Service Workers.",
                "Zero connectivity required in basement metros, crowded buses, or remote highway stops."
            ],
            "accent": C_EMERALD
        },
        {
            "num": "03",
            "title": "Speech Recognition & Voice Coach",
            "bullets": [
                "Built-in Web Speech API integration: listen to authentic native pronunciation with adjustable playback rate.",
                "Real-time voice recognition compares user's spoken Kannada against expected phonetics with immediate score."
            ],
            "accent": C_SKY
        },
        {
            "num": "04",
            "title": "Curated Multi-Tier Editorial Governance",
            "bullets": [
                "Multi-stage content lifecycle: Draft -> Under Review -> Approved -> Published.",
                "Modifications to live content automatically revert to draft, guaranteeing 100% verified linguistic quality."
            ],
            "accent": RGBColor(168, 85, 247) # Purple
        }
    ]

    for i, item in enumerate(innovations):
        x, y = coords[i]
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, card_w, card_h)
        card.fill.solid(); card.fill.fore_color.rgb = C_CARD_DARK; card.line.color.rgb = C_CARD_BORDER

        # Number badge
        nb = s4.shapes.add_textbox(x + Inches(0.25), y + Inches(0.2), Inches(0.8), Inches(0.4))
        pnb = nb.text_frame.paragraphs[0]; pnb.text = item["num"]; pnb.font.bold = True; pnb.font.size = Pt(20); pnb.font.color.rgb = item["accent"]

        # Content
        tb = s4.shapes.add_textbox(x + Inches(1.0), y + Inches(0.18), card_w - Inches(1.2), card_h - Inches(0.35))
        tf = tb.text_frame; tf.word_wrap = True
        pt = tf.paragraphs[0]; pt.text = item["title"]; pt.font.bold = True; pt.font.size = Pt(16); pt.font.color.rgb = C_WHITE
        for b in item["bullets"]:
            pb = tf.add_paragraph(); pb.text = "• " + b; pb.font.size = Pt(11.5); pb.font.color.rgb = C_TEXT_MUTED; pb.space_before = Pt(4)

    # ==========================================
    # SLIDE 5: APPROACH & WORKFLOW
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, C_BG_DARK)
    add_header(s5, "Methodology & Approach: The 5-Step Learner Workflow")
    add_footer(s5)

    # 5 horizontal workflow stages
    step_w = Inches(2.18)
    step_gap = Inches(0.2)
    start_x = Inches(0.8)
    y_step = Inches(1.8)
    h_step = Inches(4.8)

    steps = [
        ("Step 1", "Explore", "Select Real-World Need", [
            "User browses 6 core life categories.",
            "Selects hyper-specific scenario (e.g. 'Taking a City Bus').",
            "Filters by beginner, intermediate, or advanced difficulty."
        ], C_AMBER),
        ("Step 2", "Absorb", "Vocabulary & Phonetics", [
            "View Kannada script with clean English transliteration.",
            "Listen to native TTS audio pronunciation.",
            "Study formality notes and contextual usage guidelines."
        ], C_SKY),
        ("Step 3", "Practice", "Simulated Roleplay", [
            "Bilingual branching conversation dialogue.",
            "Practice both asking and responding to conductor/vendor.",
            "Instant contextual hint system for confidence."
        ], C_EMERALD),
        ("Step 4", "Assess", "Active Recall Quizzes", [
            "Scenario-based multiple choice challenges.",
            "Audio identification and meaning matching.",
            "Server-side scoring ensures verified mastery."
        ], RGBColor(236, 72, 153)),
        ("Step 5", "Retain", "Offline Sync & Progress", [
            "Bookmark crucial phrases into personal pocket phrasebook.",
            "1-click offline sync into client IndexedDB.",
            "Visual completion bars and mastery streaks."
        ], RGBColor(168, 85, 247)),
    ]

    for i, (tag, action, subtitle, details, color) in enumerate(steps):
        x = start_x + i * (step_w + step_gap)
        sc = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y_step, step_w, h_step)
        sc.fill.solid(); sc.fill.fore_color.rgb = C_CARD_DARK; sc.line.color.rgb = C_CARD_BORDER

        # Header tag in card
        tag_b = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x + Inches(0.15), y_step + Inches(0.15), step_w - Inches(0.3), Inches(0.55))
        tag_b.fill.solid(); tag_b.fill.fore_color.rgb = color; tag_b.line.fill.background()
        ptag = tag_b.text_frame.paragraphs[0]; ptag.text = f"{tag}: {action}"; ptag.font.bold = True; ptag.font.size = Pt(13); ptag.font.color.rgb = C_BG_DARK; ptag.alignment = PP_ALIGN.CENTER

        # Subtitle and details
        tb = s5.shapes.add_textbox(x + Inches(0.15), y_step + Inches(0.8), step_w - Inches(0.3), h_step - Inches(0.95))
        tf = tb.text_frame; tf.word_wrap = True
        ps = tf.paragraphs[0]; ps.text = subtitle; ps.font.bold = True; ps.font.size = Pt(12); ps.font.color.rgb = C_WHITE
        for d in details:
            pd = tf.add_paragraph(); pd.text = "• " + d; pd.font.size = Pt(10.5); pd.font.color.rgb = C_TEXT_MUTED; pd.space_before = Pt(6)

    # ==========================================
    # SLIDE 6: TECH STACK & ARCHITECTURE DIAGRAM
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, C_BG_DARK)
    add_header(s6, "Full-Stack Technology Stack & System Architecture")
    add_footer(s6)

    # Left Column: Tech Stack Summary
    stack_w = Inches(4.0)
    sc_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), stack_w, Inches(4.8))
    sc_box.fill.solid(); sc_box.fill.fore_color.rgb = C_CARD_DARK; sc_box.line.color.rgb = C_CARD_BORDER
    sctb = s6.shapes.add_textbox(Inches(1.0), Inches(2.0), stack_w - Inches(0.4), Inches(4.4))
    sctf = sctb.text_frame; sctf.word_wrap = True
    p = sctf.paragraphs[0]; p.text = "Technology Stack"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_AMBER

    stack_items = [
        ("Frontend Application", "Next.js 14 (App Router), TypeScript, Tailwind CSS, SWR, Lucide Icons"),
        ("Native Mobile App", "Capacitor 8 Android wrapper, PWA WebAPK with adaptive icons"),
        ("Backend Services", "Python 3.13, FastAPI (High-performance Async REST), Uvicorn"),
        ("Database & ORM", "SQLAlchemy ORM, SQLite for dev, PostgreSQL ready, Alembic migrations"),
        ("Offline & Audio APIs", "IndexedDB + LocalStorage fallback, Service Worker Cache API, Web Speech API (TTS/STT)"),
        ("Quality & Testing", "Pytest (23 unit tests), Jest (frontend), Playwright (E2E browser tests)")
    ]
    for cat, tech in stack_items:
        pt = sctf.add_paragraph(); pt.text = cat; pt.font.bold = True; pt.font.size = Pt(11.5); pt.font.color.rgb = C_WHITE; pt.space_before = Pt(6)
        pd = sctf.add_paragraph(); pd.text = tech; pd.font.size = Pt(10); pd.font.color.rgb = C_TEXT_MUTED

    # Right Column: Architecture Diagram Components
    diag_w = Inches(7.533)
    diag_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.0), Inches(1.8), diag_w, Inches(4.8))
    diag_box.fill.solid(); diag_box.fill.fore_color.rgb = C_CARD_DARK; diag_box.line.color.rgb = C_CARD_BORDER

    dtb = s6.shapes.add_textbox(Inches(5.2), Inches(2.0), diag_w - Inches(0.4), Inches(0.4))
    dtf = dtb.text_frame
    p = dtf.paragraphs[0]; p.text = "System Architecture & Data Flow"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_SKY

    # 4 Architecture Horizontal Layers inside Diagram Box
    layers = [
        ("1. CLIENT PRESENTATION LAYER", "Next.js 14 Responsive UI  •  Capacitor Android WebAPK  •  Service Worker & PWA Shell", C_AMBER),
        ("2. CLIENT DATA & CACHE LAYER", "IndexedDB Offline Storage  •  SWR Client Cache  •  Web Speech TTS/STT Engine", C_EMERALD),
        ("3. REVERSE PROXY & API ROUTING", "Next.js /api/v1 Proxy  •  CORS & IPv6 Resolver  •  Edge Static Site Generation (SSG)", C_SKY),
        ("4. BACKEND & PERSISTENCE LAYER", "FastAPI Core (Auth, Phrases, Scenarios, Quizzes)  •  SQLAlchemy Models  •  SQLite / PostgreSQL", RGBColor(168, 85, 247))
    ]

    ly_start = Inches(2.55)
    ly_h = Inches(0.85)
    ly_gap = Inches(0.18)

    for i, (title, details, col) in enumerate(layers):
        y = ly_start + i * (ly_h + ly_gap)
        l_shape = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.2), y, diag_w - Inches(0.4), ly_h)
        l_shape.fill.solid(); l_shape.fill.fore_color.rgb = RGBColor(15, 23, 42); l_shape.line.color.rgb = col; l_shape.line.width = Pt(1.5)
        
        lt = s6.shapes.add_textbox(Inches(5.4), y + Inches(0.08), diag_w - Inches(0.8), ly_h - Inches(0.16))
        tf = lt.text_frame; tf.word_wrap = True
        p1 = tf.paragraphs[0]; p1.text = title; p1.font.bold = True; p1.font.size = Pt(11.5); p1.font.color.rgb = col
        p2 = tf.add_paragraph(); p2.text = details; p2.font.size = Pt(10.5); p2.font.color.rgb = C_WHITE; p2.space_before = Pt(2)

    # ==========================================
    # SLIDE 7: LIVE VERIFICATION & IMPACT
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, C_BG_DARK)
    add_header(s7, "Execution, Live Deployment & Quality Metrics")
    add_footer(s7)

    # 3 Metrics & Validation Cards
    mc_w = Inches(3.64)
    mc_h = Inches(4.8)

    # Metric 1: Automated QA
    m1 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), mc_w, mc_h)
    m1.fill.solid(); m1.fill.fore_color.rgb = C_CARD_DARK; m1.line.color.rgb = C_CARD_BORDER
    tb = s7.shapes.add_textbox(Inches(1.05), Inches(2.05), mc_w - Inches(0.5), mc_h - Inches(0.5))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Rigorous Test Suite"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_AMBER
    pts = [
        ("23 Backend Pytest Cases:", "100% pass rate across endpoints, quiz scoring algorithms, and security policies."),
        ("4 Jest Test Suites:", "Full coverage of UI empty/error states and IndexedDB sync fallback."),
        ("Playwright E2E Suite:", "Complete headless Chrome simulation of user learning journey and admin protection.")
    ]
    for t, d in pts:
        p1 = tf.add_paragraph(); p1.text = t; p1.font.bold = True; p1.font.size = Pt(12.5); p1.font.color.rgb = C_WHITE; p1.space_before = Pt(10)
        p2 = tf.add_paragraph(); p2.text = d; p2.font.size = Pt(11); p2.font.color.rgb = C_TEXT_MUTED

    # Metric 2: Live Cloud Deployment
    m2 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.84), Inches(1.8), mc_w, mc_h)
    m2.fill.solid(); m2.fill.fore_color.rgb = C_CARD_DARK; m2.line.color.rgb = C_CARD_BORDER
    tb = s7.shapes.add_textbox(Inches(5.09), Inches(2.05), mc_w - Inches(0.5), mc_h - Inches(0.5))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Live Deployments"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_EMERALD
    pts = [
        ("Live Backend API:", "https://nammakannada.onrender.com (Render Cloud, PostgreSQL-ready, Swagger docs active)."),
        ("Live Web & PWA Frontend:", "https://namma-kannada-sigma.vercel.app (Vercel Global Edge Network)."),
        ("1-Tap Android App:", "Installable WebAPK PWA with high-contrast amber/slate NK adaptive branding.")
    ]
    for t, d in pts:
        p1 = tf.add_paragraph(); p1.text = t; p1.font.bold = True; p1.font.size = Pt(12.5); p1.font.color.rgb = C_WHITE; p1.space_before = Pt(10)
        p2 = tf.add_paragraph(); p2.text = d; p2.font.size = Pt(11); p2.font.color.rgb = C_TEXT_MUTED

    # Metric 3: User Impact
    m3 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.88), Inches(1.8), mc_w, mc_h)
    m3.fill.solid(); m3.fill.fore_color.rgb = C_CARD_DARK; m3.line.color.rgb = C_CARD_BORDER
    tb = s7.shapes.add_textbox(Inches(9.13), Inches(2.05), mc_w - Inches(0.5), mc_h - Inches(0.5))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Measurable Impact"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_SKY
    pts = [
        ("Sub-100ms API Latency:", "Optimized SQLite/FastAPI indexing guarantees snappy real-time lookups."),
        ("Zero Friction Access:", "No mandatory paywalls, intrusive ads, or complex registrations."),
        ("Social Harmony:", "Dismantles misunderstandings by turning hesitation into confident communication.")
    ]
    for t, d in pts:
        p1 = tf.add_paragraph(); p1.text = t; p1.font.bold = True; p1.font.size = Pt(12.5); p1.font.color.rgb = C_WHITE; p1.space_before = Pt(10)
        p2 = tf.add_paragraph(); p2.text = d; p2.font.size = Pt(11); p2.font.color.rgb = C_TEXT_MUTED

    # ==========================================
    # SLIDE 8: CONCLUSION & FUTURE SCOPE
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, C_BG_DARK)
    add_header(s8, "Conclusion: Summary, Impact & Roadmap")
    add_footer(s8)

    # Left: Summary & Impact
    c_left = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.66), Inches(4.8))
    c_left.fill.solid(); c_left.fill.fore_color.rgb = C_CARD_DARK; c_left.line.color.rgb = C_CARD_BORDER
    tb = s8.shapes.add_textbox(Inches(1.1), Inches(2.05), Inches(5.06), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Summary of Solution & Impact"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_AMBER
    bullets_concl = [
        "NammaKannada replaces obsolete grammar-first language learning with practical, scenario-based conversational mastery.",
        "Empowers non-native citizens, students, and workers to communicate respectfully and assertively in daily life.",
        "Delivers true resilience with an offline-first architecture that functions everywhere across Karnataka without internet.",
        "Fosters cultural inclusion and linguistic appreciation without shame or intimidation."
    ]
    for b in bullets_concl:
        pb = tf.add_paragraph(); pb.text = "• " + b; pb.font.size = Pt(12.5); pb.font.color.rgb = C_WHITE; pb.space_before = Pt(8)

    # Right: Future Scope
    c_right = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.86), Inches(1.8), Inches(5.66), Inches(4.8))
    c_right.fill.solid(); c_right.fill.fore_color.rgb = C_CARD_DARK; c_right.line.color.rgb = C_CARD_BORDER
    tb = s8.shapes.add_textbox(Inches(7.16), Inches(2.05), Inches(5.06), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Future Scope & Evolution"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = C_EMERALD
    roadmap = [
        ("AI Conversational Roleplay Agent:", "Integrate localized LLMs for dynamic voice conversations simulating real-time street haggling."),
        ("Regional Dialect Packs:", "Expand beyond Bengaluru to Mysuru, Mangaluru (Coastal Tulu-Kannada), and North Karnataka (Uttara Kannada) accents."),
        ("Gamified Community Challenges:", "Introduce peer-to-peer audio challenges, badges, and real-world verified practice tokens."),
        ("Crowdsourced Verified Slang:", "Community-suggested modern colloquialisms curated by native linguistic moderators.")
    ]
    for t, d in roadmap:
        p1 = tf.add_paragraph(); p1.text = t; p1.font.bold = True; p1.font.size = Pt(12.5); p1.font.color.rgb = C_WHITE; p1.space_before = Pt(8)
        p2 = tf.add_paragraph(); p2.text = d; p2.font.size = Pt(11); p2.font.color.rgb = C_TEXT_MUTED

    # Save presentation
    output_path = r"c:\hackathon\NammaKannada_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully at: {output_path}")

if __name__ == "__main__":
    create_presentation()
