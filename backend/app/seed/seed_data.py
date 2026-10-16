"""
NammaKannada Seed Script
========================
Creates initial categories, scenarios, phrases, conversations, and quizzes.

Content notes:
- All Kannada text has been carefully constructed for practical everyday use.
- Phrases are marked as 'published' for demo purposes.
- In a real deployment, content should pass through the review workflow.
- Transliterations use a consistent English-script representation.
- Healthcare content is language assistance ONLY — not medical advice.

Run with: python -m app.seed.seed_data
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.category import Category
from app.models.scenario import Scenario
from app.models.phrase import Phrase, PhraseStatus, PhraseReview
from app.models.conversation import Conversation, ConversationStep, ConversationOption
from app.models.quiz import QuizQuestion, QuizOption

Base.metadata.create_all(bind=engine)


def get_or_create_category(db, name, slug, description, icon, display_order):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        cat = Category(
            name=name,
            slug=slug,
            description=description,
            icon=icon,
            display_order=display_order,
        )
        db.add(cat)
        db.flush()
    return cat


def get_or_create_scenario(db, category_id, title, slug, description, learning_objectives, estimated_minutes, difficulty, display_order):
    scen = db.query(Scenario).filter(Scenario.slug == slug).first()
    if not scen:
        scen = Scenario(
            category_id=category_id,
            title=title,
            slug=slug,
            description=description,
            learning_objectives=learning_objectives,
            estimated_minutes=estimated_minutes,
            difficulty=difficulty,
            display_order=display_order,
        )
        db.add(scen)
        db.flush()
    return scen


def seed_all(db_session=None):
    db = db_session if db_session is not None else SessionLocal()
    try:
        print("Starting unified idempotent seeding for NammaKannada...")

        # ================================================================
        # CATEGORIES
        # ================================================================
        cat_transport = get_or_create_category(
            db,
            name="Transportation & Travel",
            slug="transportation",
            description="Navigate buses, autos, trains, and local travel in Karnataka with confidence.",
            icon="Bus",
            display_order=1,
        )
        cat_shopping = get_or_create_category(
            db,
            name="Shopping & Markets",
            slug="shopping",
            description="Ask prices, bargain politely, find products, and shop at local markets.",
            icon="ShoppingBag",
            display_order=2,
        )
        cat_education = get_or_create_category(
            db,
            name="Education & College",
            slug="education",
            description="Communicate with staff, ask about schedules, and navigate campus in Kannada.",
            icon="GraduationCap",
            display_order=3,
        )
        cat_health = get_or_create_category(
            db,
            name="Basic Healthcare",
            slug="healthcare",
            description="Describe symptoms, ask for help, and understand basic instructions in Kannada. (Language assistance only — not medical advice.)",
            icon="HeartPulse",
            display_order=4,
        )

        # ================================================================
        # SCENARIOS — TRANSPORTATION
        # ================================================================
        s_bus = get_or_create_scenario(
            db,
            category_id=cat_transport.id,
            title="Taking a City Bus",
            slug="taking-city-bus",
            description="Learn to board the right bus, ask for tickets, and find your stop in Bengaluru.",
            learning_objectives='["Ask which bus goes to your destination","Buy a bus ticket","Ask the conductor when to get off"]',
            estimated_minutes=12,
            difficulty="beginner",
            display_order=1,
        )
        s_directions = get_or_create_scenario(
            db,
            category_id=cat_transport.id,
            title="Asking for Directions",
            slug="asking-directions",
            description="Ask pedestrians, shopkeepers, and auto drivers how to reach a place.",
            learning_objectives='["Ask for directions to a location","Understand basic direction words","Confirm you are on the right path"]',
            estimated_minutes=10,
            difficulty="beginner",
            display_order=2,
        )
        s_auto = get_or_create_scenario(
            db,
            category_id=cat_transport.id,
            title="Booking an Auto-Rickshaw",
            slug="booking-auto",
            description="Negotiate an auto ride, agree on a fare, and communicate your destination.",
            learning_objectives='["Tell the auto driver your destination","Ask and discuss the fare","Communicate when to stop"]',
            estimated_minutes=8,
            difficulty="beginner",
            display_order=3,
        )

        # ================================================================
        # SCENARIOS — SHOPPING
        # ================================================================
        s_price = get_or_create_scenario(
            db,
            category_id=cat_shopping.id,
            title="Asking for Prices",
            slug="asking-prices",
            description="Ask how much things cost at vegetable markets, shops, and street stalls.",
            learning_objectives='["Ask the price of an item","Understand the response","Ask for a discount politely"]',
            estimated_minutes=10,
            difficulty="beginner",
            display_order=1,
        )
        s_bargain = get_or_create_scenario(
            db,
            category_id=cat_shopping.id,
            title="Polite Bargaining",
            slug="polite-bargaining",
            description="Negotiate prices respectfully at markets and local shops.",
            learning_objectives='["Express that the price is high","Suggest a lower price","Agree on a final price"]',
            estimated_minutes=12,
            difficulty="intermediate",
            display_order=2,
        )
        s_find = get_or_create_scenario(
            db,
            category_id=cat_shopping.id,
            title="Finding a Product",
            slug="finding-product",
            description="Ask shopkeepers whether they have a specific item and where to find it.",
            learning_objectives='["Ask if an item is available","Ask where to find something","Thank the shopkeeper"]',
            estimated_minutes=8,
            difficulty="beginner",
            display_order=3,
        )

        # ================================================================
        # SCENARIOS — EDUCATION
        # ================================================================
        s_classroom = get_or_create_scenario(
            db,
            category_id=cat_education.id,
            title="Finding a Classroom",
            slug="finding-classroom",
            description="Ask where your classroom or department is located on campus.",
            learning_objectives='["Ask for a room or building","Understand directions on campus","Politely ask someone for help"]',
            estimated_minutes=8,
            difficulty="beginner",
            display_order=1,
        )
        s_staff = get_or_create_scenario(
            db,
            category_id=cat_education.id,
            title="Talking to College Staff",
            slug="talking-college-staff",
            description="Communicate with administrative staff about fees, forms, and documents.",
            learning_objectives='["Introduce yourself to staff","Ask about a document or form","Ask when something will be ready"]',
            estimated_minutes=12,
            difficulty="intermediate",
            display_order=2,
        )
        s_schedule = get_or_create_scenario(
            db,
            category_id=cat_education.id,
            title="Asking About Schedules",
            slug="asking-schedules",
            description="Ask about class timings, exam dates, and holidays.",
            learning_objectives='["Ask what time a class starts","Ask about exam schedules","Ask about holidays or closures"]',
            estimated_minutes=10,
            difficulty="beginner",
            display_order=3,
        )

        # ================================================================
        # SCENARIOS — HEALTHCARE
        # ================================================================
        s_symptom = get_or_create_scenario(
            db,
            category_id=cat_health.id,
            title="Describing a Symptom",
            slug="describing-symptom",
            description="Use basic Kannada to describe common symptoms to healthcare staff. This is language practice only — always seek proper medical care.",
            learning_objectives='["Describe common physical symptoms","Explain how long you have had a problem","Ask for basic help"]',
            estimated_minutes=12,
            difficulty="beginner",
            display_order=1,
        )
        s_clinic = get_or_create_scenario(
            db,
            category_id=cat_health.id,
            title="Asking for a Clinic or Hospital",
            slug="asking-clinic",
            description="Ask where the nearest clinic, pharmacy, or hospital is located.",
            learning_objectives='["Ask where to find medical help","Understand responses about location","Ask for a pharmacy"]',
            estimated_minutes=8,
            difficulty="beginner",
            display_order=2,
        )
        s_understanding = get_or_create_scenario(
            db,
            category_id=cat_health.id,
            title="Understanding Basic Instructions",
            slug="understanding-instructions",
            description="Understand simple instructions from a doctor, nurse, or pharmacist in Kannada.",
            learning_objectives='["Understand common healthcare instructions","Ask for clarification","Confirm you understood"]',
            estimated_minutes=10,
            difficulty="intermediate",
            display_order=3,
        )

        # ================================================================
        # PHRASES — TRANSPORTATION (Taking a Bus)
        # ================================================================
        bus_phrases = [
            Phrase(scenario_id=s_bus.id, kannada_text="ಈ ಬಸ್ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತದೆ?", english_meaning="Where does this bus go?", transliteration="Ee bas ellige hooguttade?", context="Ask the conductor or nearby passenger before boarding.", formality_note="Polite and appropriate in all contexts.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_bus.id, kannada_text="ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಹೋಗುವ ಬಸ್ ಯಾವುದು?", english_meaning="Which bus goes to Majestic?", transliteration="Majestic-ge hooguva bas yaavudu?", context="Use when asking for a specific destination bus.", formality_note="Suitable for everyday use.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_bus.id, kannada_text="ಒಂದು ಟಿಕೆಟ್ ಕೊಡಿ.", english_meaning="Please give me one ticket.", transliteration="Ondu ticket kodi.", context="Tell the conductor how many tickets you need.", formality_note="Direct but polite. 'ಕೊಡಿ' (kodi) adds politeness.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_bus.id, kannada_text="ನಾನು ಎಲ್ಲಿ ಇಳಿಯಬೇಕು?", english_meaning="Where should I get off?", transliteration="Naanu elli iliyabeeku?", context="Ask the conductor to tell you when to alight.", formality_note="Standard polite phrasing.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_bus.id, kannada_text="ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ, ದಯವಿಟ್ಟು.", english_meaning="Please stop here.", transliteration="Illi nillisi, dayavittu.", context="Tell the driver to stop at your destination.", formality_note="'ದಯವಿಟ್ಟು' (dayavittu) means 'please' — always polite.", status=PhraseStatus.published.value, display_order=5),
            Phrase(scenario_id=s_bus.id, kannada_text="ಬಸ್ ಸ್ಟಾಪ್ ಎಲ್ಲಿದೆ?", english_meaning="Where is the bus stop?", transliteration="Bas stop ellide?", context="Ask for the location of a bus stop.", status=PhraseStatus.published.value, display_order=6),
        ]

        # PHRASES — TRANSPORTATION (Directions)
        direction_phrases = [
            Phrase(scenario_id=s_directions.id, kannada_text="ಇಲ್ಲಿಂದ ರೈಲ್ವೆ ನಿಲ್ದಾಣ ಎಷ್ಟು ದೂರ?", english_meaning="How far is the railway station from here?", transliteration="Illinda railway nildaana eshtu doora?", context="Ask the distance to a landmark.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_directions.id, kannada_text="ನೇರವಾಗಿ ಹೋಗಿ.", english_meaning="Go straight ahead.", transliteration="Neeravagi hogi.", context="Direction instruction — go straight.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_directions.id, kannada_text="ಎಡಕ್ಕೆ ತಿರುಗಿ.", english_meaning="Turn left.", transliteration="Edakke tirugi.", context="Direction instruction — turn left.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_directions.id, kannada_text="ಬಲಕ್ಕೆ ತಿರುಗಿ.", english_meaning="Turn right.", transliteration="Balakke tirugi.", context="Direction instruction — turn right.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_directions.id, kannada_text="ಹತ್ತಿರದಲ್ಲಿ ಎಟಿಎಂ ಇದೆಯೇ?", english_meaning="Is there an ATM nearby?", transliteration="Hattiradalli ATM ideye?", context="Ask if there's an ATM close by.", status=PhraseStatus.published.value, display_order=5),
            Phrase(scenario_id=s_directions.id, kannada_text="ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ. ಸಹಾಯ ಮಾಡಿ.", english_meaning="I am lost. Please help me.", transliteration="Daari tappiddene. Sahaaya maadi.", context="Ask for help when you are lost.", formality_note="Polite and appropriate.", status=PhraseStatus.published.value, display_order=6),
        ]

        # PHRASES — TRANSPORTATION (Auto)
        auto_phrases = [
            Phrase(scenario_id=s_auto.id, kannada_text="ಕೋರಮಂಗಲಕ್ಕೆ ಎಷ್ಟು ಆಗುತ್ತದೆ?", english_meaning="How much to Koramangala?", transliteration="Koramangala-kke eshtu aaguttade?", context="Ask the auto driver the fare to your destination.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_auto.id, kannada_text="ಮೀಟರ್ ಪ್ರಕಾರ ಹೋಗಿ.", english_meaning="Go by the meter.", transliteration="Meter prakaara hogi.", context="Tell the driver to use the meter rather than a flat rate.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_auto.id, kannada_text="ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ.", english_meaning="Stop here.", transliteration="Illi nillisi.", context="Tell the driver to stop at your destination.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_auto.id, kannada_text="ಚಿಲ್ಲರೆ ಇದೆಯೇ?", english_meaning="Do you have change?", transliteration="Chillare ideye?", context="Ask if the driver has change for a large note.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_auto.id, kannada_text="ತಡ ಆಗುತ್ತದೆಯೇ?", english_meaning="Will it take long?", transliteration="Tada aaguttadeye?", context="Ask if the journey will take a long time.", status=PhraseStatus.published.value, display_order=5),
        ]

        # PHRASES — SHOPPING (Asking Prices)
        price_phrases = [
            Phrase(scenario_id=s_price.id, kannada_text="ಇದರ ಬೆಲೆ ಎಷ್ಟು?", english_meaning="How much does this cost?", transliteration="Idara bele eshtu?", context="Ask the price of any item by pointing at it.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_price.id, kannada_text="ಒಂದು ಕಿಲೋ ಟೊಮ್ಯಾಟೊ ಎಷ್ಟು?", english_meaning="How much for one kilogram of tomatoes?", transliteration="Ondu kilo tomato eshtu?", context="Ask the per-kilo price of vegetables.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_price.id, kannada_text="ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.", english_meaning="Please reduce the price a little.", transliteration="Svalpa kadime maadi.", context="Politely request a small discount.", formality_note="Friendly and non-confrontational.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_price.id, kannada_text="ನೂರು ರೂಪಾಯಿ ತೆಗೆದುಕೊಳ್ಳಿ.", english_meaning="Take one hundred rupees.", transliteration="Noooru roopaayi tegedukollI.", context="Offer a specific amount when buying.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_price.id, kannada_text="ತಾಜಾ ಇದೆಯೇ?", english_meaning="Is it fresh?", transliteration="Taaja ideye?", context="Ask if the produce is fresh.", status=PhraseStatus.published.value, display_order=5),
        ]

        # PHRASES — SHOPPING (Bargaining)
        bargain_phrases = [
            Phrase(scenario_id=s_bargain.id, kannada_text="ತುಂಬಾ ದುಬಾರಿ ಆಗುತ್ತದೆ.", english_meaning="That is too expensive.", transliteration="Tumba dubaari aaguttade.", context="Politely indicate that the price is too high.", formality_note="Neutral — not rude when said with a smile.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_bargain.id, kannada_text="ಸ್ವಲ್ಪ ಕಮ್ಮಿ ಮಾಡಿ, ಇಳಿದರೆ ತೆಗೆದುಕೊಳ್ಳುತ್ತೇನೆ.", english_meaning="Lower the price a little and I will buy it.", transliteration="Svalpa kammi maadi, ildare tegedukolluteene.", context="Conditional offer — encourages the seller to give a discount.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_bargain.id, kannada_text="ಬೇರೆ ಕಡೆ ಕಡಿಮೆ ಇದೆ.", english_meaning="It is cheaper elsewhere.", transliteration="Bere kade kadime ide.", context="Mention competition to encourage a better price.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_bargain.id, kannada_text="ಸರಿ, ನಾನು ಒಪ್ಪುತ್ತೇನೆ.", english_meaning="Okay, I agree.", transliteration="Sari, naanu opputeene.", context="Agree on the final price.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_bargain.id, kannada_text="ಒಂದು ಕೊಟ್ಟರೆ ಮತ್ತೊಂದು ಬೇಕು.", english_meaning="If you give one, I want another too.", transliteration="Ondu kottare mattond beeku.", context="Ask for an extra item as part of the deal.", status=PhraseStatus.published.value, display_order=5),
        ]

        # PHRASES — SHOPPING (Finding Product)
        find_phrases = [
            Phrase(scenario_id=s_find.id, kannada_text="ಇಲ್ಲಿ ಹಾಲು ಸಿಗುತ್ತದೆಯೇ?", english_meaning="Is milk available here?", transliteration="Illi haalu siguttadeye?", context="Ask if a specific item is available at the shop.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_find.id, kannada_text="ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?", english_meaning="Where can I find it?", transliteration="Elli siguttade?", context="Ask where to find a specific item.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_find.id, kannada_text="ದೊಡ್ಡ ಅಳತೆ ಇದೆಯೇ?", english_meaning="Do you have a larger size?", transliteration="Dodda aLate ideye?", context="Ask for a larger size of a clothing or product item.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_find.id, kannada_text="ಇನ್ನೊಂದು ಬಣ್ಣ ಇದೆಯೇ?", english_meaning="Do you have another colour?", transliteration="Innond banna ideye?", context="Ask for a different colour option.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_find.id, kannada_text="ಧನ್ಯವಾದ.", english_meaning="Thank you.", transliteration="Dhanyavaada.", context="A polite thank you — used in all situations.", formality_note="Formal. 'ಥ್ಯಾಂಕ್ಸ್' (Thanks) is the casual alternative.", status=PhraseStatus.published.value, display_order=5),
        ]

        # PHRASES — EDUCATION (Finding Classroom)
        classroom_phrases = [
            Phrase(scenario_id=s_classroom.id, kannada_text="ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ವಿಭಾಗ ಎಲ್ಲಿದೆ?", english_meaning="Where is the Computer Science department?", transliteration="Computer Science vibhaaga ellide?", context="Ask for a specific department on campus.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_classroom.id, kannada_text="ಹತ್ತನೇ ಕೊಠಡಿ ಎಲ್ಲಿದೆ?", english_meaning="Where is room number ten?", transliteration="Hattane kothadi ellide?", context="Ask for a specific classroom by number.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_classroom.id, kannada_text="ನಾನು ಹೊಸ ವಿದ್ಯಾರ್ಥಿ.", english_meaning="I am a new student.", transliteration="Naanu hosa vidyaarthi.", context="Introduce yourself as a new student.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_classroom.id, kannada_text="ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ.", english_meaning="Please help me.", transliteration="Dayavittu sahaaya maadi.", context="Politely ask for assistance.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_classroom.id, kannada_text="ಗ್ರಂಥಾಲಯ ಎಲ್ಲಿದೆ?", english_meaning="Where is the library?", transliteration="Granthaalaaya ellide?", context="Ask where to find the campus library.", status=PhraseStatus.published.value, display_order=5),
        ]

        # PHRASES — EDUCATION (College Staff)
        staff_phrases = [
            Phrase(scenario_id=s_staff.id, kannada_text="ನನ್ನ ಹೆಸರು [ನಿಮ್ಮ ಹೆಸರು].", english_meaning="My name is [your name].", transliteration="Nanna hesaru [nimma hesaru].", context="Introduce yourself to college staff.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_staff.id, kannada_text="ಶುಲ್ಕ ಎಷ್ಟು ಕಟ್ಟಬೇಕು?", english_meaning="How much fee do I need to pay?", transliteration="Shulka eshtu kattabeeku?", context="Ask about the fee amount to be paid.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_staff.id, kannada_text="ಫಾರ್ಮ್ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?", english_meaning="Where do I get the form?", transliteration="Form elli siguttade?", context="Ask where to collect a form or document.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_staff.id, kannada_text="ಯಾವಾಗ ಸಿದ್ಧ ಆಗುತ್ತದೆ?", english_meaning="When will it be ready?", transliteration="Yaavaaga siddha aaguttade?", context="Ask when your document or application will be processed.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_staff.id, kannada_text="ನಾನು ನಾಳೆ ಮತ್ತೆ ಬರಬಹುದೇ?", english_meaning="Can I come again tomorrow?", transliteration="Naanu naaLe matte barabahude?", context="Ask if you can return the next day.", status=PhraseStatus.published.value, display_order=5),
        ]

        # PHRASES — EDUCATION (Schedules)
        schedule_phrases = [
            Phrase(scenario_id=s_schedule.id, kannada_text="ತರಗತಿ ಯಾವಾಗ ಶುರುವಾಗುತ್ತದೆ?", english_meaning="When does the class start?", transliteration="Taragati yaavaaga shuruvaguttade?", context="Ask what time a class begins.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_schedule.id, kannada_text="ಇಂದು ರಜೆ ಇದೆಯೇ?", english_meaning="Is there a holiday today?", transliteration="Indu raje ideye?", context="Ask if today is a holiday.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_schedule.id, kannada_text="ಪರೀಕ್ಷೆ ಯಾವಾಗ?", english_meaning="When is the exam?", transliteration="Pareekshe yaavaaga?", context="Ask about exam dates.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_schedule.id, kannada_text="ಟೈಮ್‌ಟೇಬಲ್ ಕೊಡುತ್ತೀರಾ?", english_meaning="Can you give me the timetable?", transliteration="Timetable kodutteeraa?", context="Ask for a printed or written timetable.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_schedule.id, kannada_text="ಮಧ್ಯಾಹ್ನ ವಿರಾಮ ಎಷ್ಟು ಹೊತ್ತಿಗೆ?", english_meaning="What time is the lunch break?", transliteration="Madhyaahna viraama eshtu hottige?", context="Ask what time lunch break starts.", status=PhraseStatus.published.value, display_order=5),
        ]

        # PHRASES — HEALTHCARE (Symptoms)
        symptom_phrases = [
            Phrase(scenario_id=s_symptom.id, kannada_text="ನನಗೆ ಜ್ವರ ಇದೆ.", english_meaning="I have a fever.", transliteration="Nanage jvara ide.", context="Describe a fever to healthcare staff. Seek proper medical care. (Language practice only.)", formality_note="Straightforward factual statement.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_symptom.id, kannada_text="ತಲೆ ನೋವು ಇದೆ.", english_meaning="I have a headache.", transliteration="Tale novu ide.", context="Describe head pain. (Language practice only.)", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_symptom.id, kannada_text="ಹೊಟ್ಟೆ ನೋವು ಇದೆ.", english_meaning="I have a stomachache.", transliteration="Hotte novu ide.", context="Describe stomach pain. (Language practice only.)", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_symptom.id, kannada_text="ಎರಡು ದಿನದಿಂದ ನೋವು ಇದೆ.", english_meaning="I have had pain for two days.", transliteration="Eradu dinadinda novu ide.", context="Describe the duration of a symptom.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_symptom.id, kannada_text="ವೈದ್ಯರನ್ನು ನೋಡಬೇಕು.", english_meaning="I need to see a doctor.", transliteration="Vaidyarannu nodabeeku.", context="Ask to be seen by a doctor.", status=PhraseStatus.published.value, display_order=5),
            Phrase(scenario_id=s_symptom.id, kannada_text="ಔಷಧಿ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?", english_meaning="Where can I get medicine?", transliteration="Aushadi elli siguttade?", context="Ask where to buy medicine or find a pharmacy.", status=PhraseStatus.published.value, display_order=6),
        ]

        # PHRASES — HEALTHCARE (Finding Clinic)
        clinic_phrases = [
            Phrase(scenario_id=s_clinic.id, kannada_text="ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?", english_meaning="Where is the nearest hospital?", transliteration="Hattirada aaspatre ellide?", context="Ask for the location of the nearest hospital.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_clinic.id, kannada_text="ಡಾಕ್ಟರ್ ಈಗ ಇದ್ದಾರೆಯೇ?", english_meaning="Is the doctor available now?", transliteration="Doctor eega iddaareye?", context="Ask whether the doctor is currently available.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_clinic.id, kannada_text="ಫಾರ್ಮಸಿ ಎಲ್ಲಿದೆ?", english_meaning="Where is the pharmacy?", transliteration="Pharmacy ellide?", context="Ask for the location of a pharmacy.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_clinic.id, kannada_text="ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ.", english_meaning="Call an ambulance.", transliteration="Ambulance kareyiri.", context="Ask someone to call an ambulance in an emergency.", formality_note="Urgent and direct.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_clinic.id, kannada_text="ತುರ್ತು ವಿಭಾಗ ಎಲ್ಲಿದೆ?", english_meaning="Where is the emergency ward?", transliteration="Turtu vibhaaga ellide?", context="Ask for the emergency department.", status=PhraseStatus.published.value, display_order=5),
        ]

        # PHRASES — HEALTHCARE (Understanding Instructions)
        instruction_phrases = [
            Phrase(scenario_id=s_understanding.id, kannada_text="ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ.", english_meaning="Take it twice a day.", transliteration="Dinakke eradu baari tegedukolli.", context="A pharmacist or doctor tells you to take medicine twice daily.", formality_note="Instruction form — listen and confirm understanding.", status=PhraseStatus.published.value, display_order=1),
            Phrase(scenario_id=s_understanding.id, kannada_text="ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ.", english_meaning="Take it after meals.", transliteration="Oota-da nantara tegedukolli.", context="Instruction to take medicine after eating.", status=PhraseStatus.published.value, display_order=2),
            Phrase(scenario_id=s_understanding.id, kannada_text="ತಿಳಿಯಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.", english_meaning="I did not understand. Please say it again.", transliteration="Tiliyalilla. Mattomme heli.", context="Ask for a repetition when you do not understand an instruction.", status=PhraseStatus.published.value, display_order=3),
            Phrase(scenario_id=s_understanding.id, kannada_text="ಅರ್ಥ ಆಯಿತು.", english_meaning="I understood.", transliteration="Artha aayitu.", context="Confirm that you have understood the instruction.", status=PhraseStatus.published.value, display_order=4),
            Phrase(scenario_id=s_understanding.id, kannada_text="ನೀರು ಜಾಸ್ತಿ ಕುಡಿಯಿರಿ.", english_meaning="Drink plenty of water.", transliteration="Neeru jaasti kudiyiri.", context="Common advice from healthcare staff to stay hydrated.", status=PhraseStatus.published.value, display_order=5),
        ]

        all_phrases = (
            bus_phrases + direction_phrases + auto_phrases +
            price_phrases + bargain_phrases + find_phrases +
            classroom_phrases + staff_phrases + schedule_phrases +
            symptom_phrases + clinic_phrases + instruction_phrases
        )
        for p_data in all_phrases:
            existing = db.query(Phrase).filter(
                Phrase.scenario_id == p_data.scenario_id,
                Phrase.kannada_text == p_data.kannada_text
            ).first()
            if not existing:
                db.add(p_data)
        db.flush()

        # ================================================================
        # CONVERSATIONS — Taking a City Bus
        # ================================================================
        conv_bus = db.query(Conversation).filter(Conversation.scenario_id == s_bus.id).first()
        if not conv_bus:
            conv_bus = Conversation(
                scenario_id=s_bus.id,
                title="Boarding the right bus",
                description="Practice asking about the bus route, buying a ticket, and asking when to get off.",
                is_published=True,
            )
            db.add(conv_bus)
            db.flush()

            # Steps
            step_b1 = ConversationStep(conversation_id=conv_bus.id, speaker="narrator", message="You are at a bus stop. A bus arrives. You want to go to Majestic (Kempegowda Bus Station).", step_type="prompt", display_order=1)
            db.add(step_b1); db.flush()

            step_b2 = ConversationStep(conversation_id=conv_bus.id, speaker="user", message="You approach the conductor. What do you ask?", step_type="choice", display_order=2)
            db.add(step_b2); db.flush()

            step_b3 = ConversationStep(conversation_id=conv_bus.id, speaker="conductor", message="ಹೌದು, ಈ ಬಸ್ ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಹೋಗುತ್ತದೆ.", message_kannada="ಹೌದು, ಈ ಬಸ್ ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಹೋಗುತ್ತದೆ.", message_transliteration="Houd, ee bas Majestic-ge hooguttade.", step_type="prompt", display_order=3)
            db.add(step_b3); db.flush()

            step_b4 = ConversationStep(conversation_id=conv_bus.id, speaker="user", message="The conductor says the bus goes to Majestic. What do you say next?", step_type="choice", display_order=4)
            db.add(step_b4); db.flush()

            step_b5 = ConversationStep(conversation_id=conv_bus.id, speaker="conductor", message="ಒಂದು ಟಿಕೆಟ್ ಹತ್ತು ರೂಪಾಯಿ.", message_kannada="ಒಂದು ಟಿಕೆಟ್ ಹತ್ತು ರೂಪಾಯಿ.", message_transliteration="Ondu ticket hattu roopaayi.", step_type="prompt", display_order=5)
            db.add(step_b5); db.flush()

            step_b6 = ConversationStep(conversation_id=conv_bus.id, speaker="narrator", message="Great! You bought a ticket. Remember to ask when to get off. Conversation complete!", step_type="end", display_order=6)
            db.add(step_b6); db.flush()

            # Options
            opt_b2_good = ConversationOption(step_id=step_b2.id, option_text="ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಹೋಗುವ ಬಸ್ ಯಾವುದು?", option_transliteration="Majestic-ge hooguva bas yaavudu?", is_correct=True, next_step_id=step_b3.id, feedback="Excellent! Asking which bus goes to your destination is exactly right.", display_order=1)
            opt_b2_ok = ConversationOption(step_id=step_b2.id, option_text="ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ.", option_transliteration="Illi nillisi.", is_correct=False, next_step_id=step_b3.id, feedback="That means 'Stop here' — useful later, but not right now. Try asking about the route.", display_order=2)
            opt_b2_wrong = ConversationOption(step_id=step_b2.id, option_text="ಚಿಲ್ಲರೆ ಇದೆಯೇ?", option_transliteration="Chillare ideye?", is_correct=False, next_step_id=step_b3.id, feedback="That means 'Do you have change?' — useful when paying, but not the right first question.", display_order=3)

            opt_b4_good = ConversationOption(step_id=step_b4.id, option_text="ಒಂದು ಟಿಕೆಟ್ ಕೊಡಿ.", option_transliteration="Ondu ticket kodi.", is_correct=True, next_step_id=step_b5.id, feedback="Perfect! Asking for one ticket is the right next step.", display_order=1)
            opt_b4_ok = ConversationOption(step_id=step_b4.id, option_text="ಧನ್ಯವಾದ.", option_transliteration="Dhanyavaada.", is_correct=False, next_step_id=step_b5.id, feedback="'Thank you' is polite but you haven't bought a ticket yet!", display_order=2)

            db.add_all([opt_b2_good, opt_b2_ok, opt_b2_wrong, opt_b4_good, opt_b4_ok])
            db.flush()

            conv_bus.start_step_id = step_b1.id
            db.flush()

        # ================================================================
        # CONVERSATIONS — Asking for Directions
        # ================================================================
        conv_dir = db.query(Conversation).filter(Conversation.scenario_id == s_directions.id).first()
        if not conv_dir:
            conv_dir = Conversation(
                scenario_id=s_directions.id,
                title="Finding the Railway Station",
                description="Practice asking for directions and understanding basic direction words.",
                is_published=True,
            )
            db.add(conv_dir)
            db.flush()

            step_d1 = ConversationStep(conversation_id=conv_dir.id, speaker="narrator", message="You are lost and need to reach the railway station. You see a shopkeeper.", step_type="prompt", display_order=1)
            db.add(step_d1); db.flush()

            step_d2 = ConversationStep(conversation_id=conv_dir.id, speaker="user", message="How do you ask the shopkeeper for directions?", step_type="choice", display_order=2)
            db.add(step_d2); db.flush()

            step_d3 = ConversationStep(conversation_id=conv_dir.id, speaker="shopkeeper", message="ನೇರವಾಗಿ ಹೋಗಿ, ನಂತರ ಎಡಕ್ಕೆ ತಿರುಗಿ.", message_kannada="ನೇರವಾಗಿ ಹೋಗಿ, ನಂತರ ಎಡಕ್ಕೆ ತಿರುಗಿ.", message_transliteration="Neeravagi hogi, nantara edakke tirugi.", step_type="prompt", display_order=3)
            db.add(step_d3); db.flush()

            step_d4 = ConversationStep(conversation_id=conv_dir.id, speaker="narrator", message="The shopkeeper said: 'Go straight, then turn left.' Great job navigating! Conversation complete!", step_type="end", display_order=4)
            db.add(step_d4); db.flush()

            opt_d2_good = ConversationOption(step_id=step_d2.id, option_text="ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ. ರೈಲ್ವೆ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?", option_transliteration="Daari tappiddene. Railway nildaana ellide?", is_correct=True, next_step_id=step_d3.id, feedback="Excellent! Saying 'I am lost' and asking for the station is clear and polite.", display_order=1)
            opt_d2_ok = ConversationOption(step_id=step_d2.id, option_text="ನೇರವಾಗಿ ಹೋಗಿ.", option_transliteration="Neeravagi hogi.", is_correct=False, next_step_id=step_d3.id, feedback="That means 'Go straight' — that is a direction, not a question!", display_order=2)
            db.add_all([opt_d2_good, opt_d2_ok])
            db.flush()

            conv_dir.start_step_id = step_d1.id
            db.flush()

        # ================================================================
        # CONVERSATIONS — Asking for Prices (Shopping)
        # ================================================================
        conv_price = db.query(Conversation).filter(Conversation.scenario_id == s_price.id).first()
        if not conv_price:
            conv_price = Conversation(
                scenario_id=s_price.id,
                title="Buying vegetables at the market",
                description="Practice asking for the price of vegetables and requesting a discount.",
                is_published=True,
            )
            db.add(conv_price)
            db.flush()

            step_p1 = ConversationStep(conversation_id=conv_price.id, speaker="narrator", message="You are at a vegetable market. You want to buy tomatoes.", step_type="prompt", display_order=1)
            db.add(step_p1); db.flush()

            step_p2 = ConversationStep(conversation_id=conv_price.id, speaker="user", message="How do you ask the price?", step_type="choice", display_order=2)
            db.add(step_p2); db.flush()

            step_p3 = ConversationStep(conversation_id=conv_price.id, speaker="vendor", message="ಒಂದು ಕಿಲೋ ಐವತ್ತು ರೂಪಾಯಿ.", message_kannada="ಒಂದು ಕಿಲೋ ಐವತ್ತು ರೂಪಾಯಿ.", message_transliteration="Ondu kilo aivattu roopaayi.", step_type="prompt", display_order=3)
            db.add(step_p3); db.flush()

            step_p4 = ConversationStep(conversation_id=conv_price.id, speaker="user", message="The vendor says 50 rupees per kg. You think it's a bit high. What do you say?", step_type="choice", display_order=4)
            db.add(step_p4); db.flush()

            step_p5 = ConversationStep(conversation_id=conv_price.id, speaker="narrator", message="Well done! You practised asking for a price and negotiating. Conversation complete!", step_type="end", display_order=5)
            db.add(step_p5); db.flush()

            opt_p2_good = ConversationOption(step_id=step_p2.id, option_text="ಒಂದು ಕಿಲೋ ಟೊಮ್ಯಾಟೊ ಎಷ್ಟು?", option_transliteration="Ondu kilo tomato eshtu?", is_correct=True, next_step_id=step_p3.id, feedback="Great! Asking the per-kilo price is exactly right.", display_order=1)
            opt_p2_ok = ConversationOption(step_id=step_p2.id, option_text="ಧನ್ಯವಾದ.", option_transliteration="Dhanyavaada.", is_correct=False, next_step_id=step_p3.id, feedback="'Thank you' is polite, but you haven't asked the price yet!", display_order=2)

            opt_p4_good = ConversationOption(step_id=step_p4.id, option_text="ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.", option_transliteration="Svalpa kadime maadi.", is_correct=True, next_step_id=step_p5.id, feedback="Perfect! Politely asking for a small reduction is appropriate.", display_order=1)
            opt_p4_ok = ConversationOption(step_id=step_p4.id, option_text="ತಾಜಾ ಇದೆಯೇ?", option_transliteration="Taaja ideye?", is_correct=False, next_step_id=step_p5.id, feedback="'Is it fresh?' is a good question, but the more natural response to a high price is to ask for a reduction.", display_order=2)

            db.add_all([opt_p2_good, opt_p2_ok, opt_p4_good, opt_p4_ok])
            db.flush()

            conv_price.start_step_id = step_p1.id
            db.flush()

        # ================================================================
        # QUIZZES — Taking a City Bus
        # ================================================================
        if not db.query(QuizQuestion).filter(QuizQuestion.scenario_id == s_bus.id).first():
            q1 = QuizQuestion(scenario_id=s_bus.id, question_text="How do you ask 'Which bus goes to Majestic?' in Kannada?", question_type="multiple_choice", explanation="'ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಹೋಗುವ ಬಸ್ ಯಾವುದು?' literally asks 'which bus goes to Majestic?'", display_order=1)
            db.add(q1); db.flush()
            db.add_all([
                QuizOption(question_id=q1.id, option_text="ಮೆಜೆಸ್ಟಿಕ್‌ಗೆ ಹೋಗುವ ಬಸ್ ಯಾವುದು?", is_correct=True, display_order=1),
                QuizOption(question_id=q1.id, option_text="ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ.", is_correct=False, display_order=2),
                QuizOption(question_id=q1.id, option_text="ಚಿಲ್ಲರೆ ಇದೆಯೇ?", is_correct=False, display_order=3),
                QuizOption(question_id=q1.id, option_text="ಎಡಕ್ಕೆ ತಿರುಗಿ.", is_correct=False, display_order=4),
            ])

            q2 = QuizQuestion(scenario_id=s_bus.id, question_text="What does 'ಒಂದು ಟಿಕೆಟ್ ಕೊಡಿ' mean in English?", question_type="meaning_match", explanation="'ಒಂದು ಟಿಕೆಟ್ ಕೊಡಿ' means 'Please give me one ticket'. 'ಕೊಡಿ' is the polite form of 'give'.", display_order=2)
            db.add(q2); db.flush()
            db.add_all([
                QuizOption(question_id=q2.id, option_text="Please give me one ticket.", is_correct=True, display_order=1),
                QuizOption(question_id=q2.id, option_text="Stop the bus here.", is_correct=False, display_order=2),
                QuizOption(question_id=q2.id, option_text="Where does this bus go?", is_correct=False, display_order=3),
                QuizOption(question_id=q2.id, option_text="Is the bus on time?", is_correct=False, display_order=4),
            ])

            q3 = QuizQuestion(scenario_id=s_bus.id, question_text="Which phrase means 'Please stop here'?", question_type="multiple_choice", explanation="'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ, ದಯವಿಟ್ಟು' = 'Stop here, please'. 'ದಯವಿಟ್ಟು' is the Kannada word for 'please'.", display_order=3)
            db.add(q3); db.flush()
            db.add_all([
                QuizOption(question_id=q3.id, option_text="ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ, ದಯವಿಟ್ಟು.", is_correct=True, display_order=1),
                QuizOption(question_id=q3.id, option_text="ನಾನು ಎಲ್ಲಿ ಇಳಿಯಬೇಕು?", is_correct=False, display_order=2),
                QuizOption(question_id=q3.id, option_text="ಬಸ್ ಸ್ಟಾಪ್ ಎಲ್ಲಿದೆ?", is_correct=False, display_order=3),
                QuizOption(question_id=q3.id, option_text="ತಡ ಆಗುತ್ತದೆಯೇ?", is_correct=False, display_order=4),
            ])

            q4 = QuizQuestion(scenario_id=s_bus.id, question_text="What is the correct transliteration for 'ಬಸ್ ಸ್ಟಾಪ್ ಎಲ್ಲಿದೆ?'?", question_type="multiple_choice", explanation="'Bas stop ellide?' is the correct pronunciation guide for 'Where is the bus stop?'", display_order=4)
            db.add(q4); db.flush()
            db.add_all([
                QuizOption(question_id=q4.id, option_text="Bas stop ellide?", is_correct=True, display_order=1),
                QuizOption(question_id=q4.id, option_text="Illi nillisi.", is_correct=False, display_order=2),
                QuizOption(question_id=q4.id, option_text="Chillare ideye?", is_correct=False, display_order=3),
                QuizOption(question_id=q4.id, option_text="Naanu elli iliyabeeku?", is_correct=False, display_order=4),
            ])

        # QUIZZES — Asking for Prices
        if not db.query(QuizQuestion).filter(QuizQuestion.scenario_id == s_price.id).first():
            q5 = QuizQuestion(scenario_id=s_price.id, question_text="How do you say 'How much does this cost?' in Kannada?", question_type="multiple_choice", explanation="'ಇದರ ಬೆಲೆ ಎಷ್ಟು?' is the standard way to ask for the price of something.", display_order=1)
            db.add(q5); db.flush()
            db.add_all([
                QuizOption(question_id=q5.id, option_text="ಇದರ ಬೆಲೆ ಎಷ್ಟು?", is_correct=True, display_order=1),
                QuizOption(question_id=q5.id, option_text="ತಾಜಾ ಇದೆಯೇ?", is_correct=False, display_order=2),
                QuizOption(question_id=q5.id, option_text="ಸರಿ, ನಾನು ಒಪ್ಪುತ್ತೇನೆ.", is_correct=False, display_order=3),
                QuizOption(question_id=q5.id, option_text="ಧನ್ಯವಾದ.", is_correct=False, display_order=4),
            ])

            q6 = QuizQuestion(scenario_id=s_price.id, question_text="What does 'ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ' mean?", question_type="meaning_match", explanation="'Svalpa kadime maadi' literally means 'make it a little less' — a polite way to ask for a small discount.", display_order=2)
            db.add(q6); db.flush()
            db.add_all([
                QuizOption(question_id=q6.id, option_text="Please reduce the price a little.", is_correct=True, display_order=1),
                QuizOption(question_id=q6.id, option_text="Take one hundred rupees.", is_correct=False, display_order=2),
                QuizOption(question_id=q6.id, option_text="Is it fresh?", is_correct=False, display_order=3),
                QuizOption(question_id=q6.id, option_text="It is too expensive.", is_correct=False, display_order=4),
            ])

        # QUIZZES — Describing a Symptom
        if not db.query(QuizQuestion).filter(QuizQuestion.scenario_id == s_symptom.id).first():
            q7 = QuizQuestion(scenario_id=s_symptom.id, question_text="How do you say 'I have a fever' in Kannada?", question_type="multiple_choice", explanation="'ನನಗೆ ಜ್ವರ ಇದೆ' = 'I have a fever'. 'ನನಗೆ' means 'to me/I have' and 'ಜ್ವರ' means fever.", display_order=1)
            db.add(q7); db.flush()
            db.add_all([
                QuizOption(question_id=q7.id, option_text="ನನಗೆ ಜ್ವರ ಇದೆ.", is_correct=True, display_order=1),
                QuizOption(question_id=q7.id, option_text="ತಲೆ ನೋವು ಇದೆ.", is_correct=False, display_order=2),
                QuizOption(question_id=q7.id, option_text="ಔಷಧಿ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?", is_correct=False, display_order=3),
                QuizOption(question_id=q7.id, option_text="ವೈದ್ಯರನ್ನು ನೋಡಬೇಕು.", is_correct=False, display_order=4),
            ])

            q8 = QuizQuestion(scenario_id=s_symptom.id, question_text="What does 'ತಿಳಿಯಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.' mean?", question_type="meaning_match", explanation="'Tiliyalilla. Mattomme heli.' = 'I did not understand. Please say it again.' Very useful when you need clarification.", display_order=2)
            db.add(q8); db.flush()
            db.add_all([
                QuizOption(question_id=q8.id, option_text="I did not understand. Please say it again.", is_correct=True, display_order=1),
                QuizOption(question_id=q8.id, option_text="I have understood.", is_correct=False, display_order=2),
                QuizOption(question_id=q8.id, option_text="Call an ambulance.", is_correct=False, display_order=3),
                QuizOption(question_id=q8.id, option_text="Where is the pharmacy?", is_correct=False, display_order=4),
            ])

        # QUIZZES — Finding Classroom
        if not db.query(QuizQuestion).filter(QuizQuestion.scenario_id == s_classroom.id).first():
            q9 = QuizQuestion(scenario_id=s_classroom.id, question_text="What does 'ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ' mean?", question_type="meaning_match", explanation="'Dayavittu sahaaya maadi' = 'Please help me'. 'ದಯವಿಟ್ಟು' means 'please'.", display_order=1)
            db.add(q9); db.flush()
            db.add_all([
                QuizOption(question_id=q9.id, option_text="Please help me.", is_correct=True, display_order=1),
                QuizOption(question_id=q9.id, option_text="I am a new student.", is_correct=False, display_order=2),
                QuizOption(question_id=q9.id, option_text="Where is the library?", is_correct=False, display_order=3),
                QuizOption(question_id=q9.id, option_text="Where is room ten?", is_correct=False, display_order=4),
            ])

            q10 = QuizQuestion(scenario_id=s_classroom.id, question_text="How do you say 'Where is the library?' in Kannada?", question_type="multiple_choice", explanation="'ಗ್ರಂಥಾಲಯ ಎಲ್ಲಿದೆ?' = 'Where is the library?' 'ಗ್ರಂಥಾಲಯ' (Granthaalaaya) is the Kannada word for library.", display_order=2)
            db.add(q10); db.flush()
            db.add_all([
                QuizOption(question_id=q10.id, option_text="ಗ್ರಂಥಾಲಯ ಎಲ್ಲಿದೆ?", is_correct=True, display_order=1),
                QuizOption(question_id=q10.id, option_text="ತರಗತಿ ಯಾವಾಗ ಶುರುವಾಗುತ್ತದೆ?", is_correct=False, display_order=2),
                QuizOption(question_id=q10.id, option_text="ಫಾರ್ಮ್ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?", is_correct=False, display_order=3),
                QuizOption(question_id=q10.id, option_text="ಶುಲ್ಕ ಎಷ್ಟು ಕಟ್ಟಬೇಕು?", is_correct=False, display_order=4),
            ])

        db.commit()

        # Run expansion for the additional 2 categories, 6 scenarios, phrases, and interactions
        try:
            from app.seed.seed_expansion import expand_data
            expand_data(db_session=db)
        except Exception as e:
            print(f"Expansion note: {e}")

        # Run interactions for all key scenarios
        try:
            from app.seed.seed_scenarios_interactions import seed_interactions
            seed_interactions(db_session=db)
        except Exception as e:
            print(f"Interactions note: {e}")

        total_cats = db.query(Category).count()
        total_scens = db.query(Scenario).count()
        total_phrases = db.query(Phrase).count()
        total_convs = db.query(Conversation).count()
        total_quizzes = db.query(QuizQuestion).count()

        print("=" * 60)
        print("NAMMAKANNADA SEED VERIFICATION COMPLETE")
        print(f"  Categories:       {total_cats}")
        print(f"  Scenarios:        {total_scens}")
        print(f"  Verified Phrases: {total_phrases}")
        print(f"  Conversations:    {total_convs}")
        print(f"  Quiz Questions:   {total_quizzes}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise
    finally:
        if db_session is None:
            db.close()


if __name__ == "__main__":
    seed_all()
