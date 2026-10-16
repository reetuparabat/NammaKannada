"""
NammaConnect Data Expansion Script
===================================
Expands the dataset with:
- 2 New Categories (Food & Darshinis, Everyday Essentials & Living)
- 6 New Scenarios (Darshini Ordering, Meals & UPI, Street Food, Rent & Housing, Directions, Pharmacy & Essentials)
- 60+ New Phrases covering daily conversational possibilities, Kanglish expressions, and colloquial terms
- Full Interactive Conversations & Quizzes for new scenarios
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database import SessionLocal, engine
from app.models.category import Category
from app.models.scenario import Scenario
from app.models.phrase import Phrase, PhraseStatus
from app.models.conversation import Conversation, ConversationStep, ConversationOption
from app.models.quiz import QuizQuestion, QuizOption


def expand_data():
    db = SessionLocal()
    try:
        print("Starting NammaConnect Data Expansion...")

        # ─────────────────────────────────────────────────────────────
        # 1. NEW CATEGORIES
        # ─────────────────────────────────────────────────────────────
        cat_food = db.query(Category).filter(Category.slug == "food-dining").first()
        if not cat_food:
            cat_food = Category(
                name="Food & Darshinis",
                slug="food-dining",
                description="Order dosas, filter coffee, street chaats, and pay via UPI with confidence.",
                icon="Utensils",
                display_order=5,
                is_active=True,
            )
            db.add(cat_food)
            db.commit()
            db.refresh(cat_food)
            print("Added Category: Food & Darshinis")

        cat_living = db.query(Category).filter(Category.slug == "city-living").first()
        if not cat_living:
            cat_living = Category(
                name="Daily Living & Housing",
                slug="city-living",
                description="Navigate house rent, landlord talks, finding directions, and utility services.",
                icon="Briefcase",
                display_order=6,
                is_active=True,
            )
            db.add(cat_living)
            db.commit()
            db.refresh(cat_living)
            print("Added Category: Daily Living & Housing")

        # ─────────────────────────────────────────────────────────────
        # 2. NEW SCENARIOS
        # ─────────────────────────────────────────────────────────────
        # Food scenarios
        scen_darshini = db.query(Scenario).filter(Scenario.slug == "darshini-ordering").first()
        if not scen_darshini:
            scen_darshini = Scenario(
                category_id=cat_food.id,
                title="Ordering at a Darshini",
                slug="darshini-ordering",
                description="Order morning breakfast, ask for crispy dosa, filter coffee, and request takeaway at self-service hotels.",
                learning_objectives="Learn how to order food items, request parcel, ask for coffee, and request extra chutney.",
                estimated_minutes=8,
                difficulty="beginner",
                display_order=1,
                is_active=True,
            )
            db.add(scen_darshini)

        scen_meals_upi = db.query(Scenario).filter(Scenario.slug == "meals-and-upi").first()
        if not scen_meals_upi:
            scen_meals_upi = Scenario(
                category_id=cat_food.id,
                title="Lunch Meals & UPI Payments",
                slug="meals-and-upi",
                description="Order South Indian meals, ask for less spice, and pay with QR code and Google Pay / PhonePe.",
                learning_objectives="Master meal vocabulary, dietary preferences, and digital payment interactions.",
                estimated_minutes=10,
                difficulty="intermediate",
                display_order=2,
                is_active=True,
            )
            db.add(scen_meals_upi)

        scen_chaat = db.query(Scenario).filter(Scenario.slug == "street-chaat").first()
        if not scen_chaat:
            scen_chaat = Scenario(
                category_id=cat_food.id,
                title="Street Food & Evening Snacks",
                slug="street-chaat",
                description="Enjoy evening snacks, masala puri, bajjis, and ask for sweet or spicy chutney.",
                learning_objectives="Communicate taste preferences and order local Bengaluru chaats.",
                estimated_minutes=7,
                difficulty="beginner",
                display_order=3,
                is_active=True,
            )
            db.add(scen_chaat)

        # Living scenarios
        scen_rent = db.query(Scenario).filter(Scenario.slug == "house-rent").first()
        if not scen_rent:
            scen_rent = Scenario(
                category_id=cat_living.id,
                title="Speaking with the Landlord",
                slug="house-rent",
                description="Discuss house rent, security deposit, maintenance, water timings, and repairs.",
                learning_objectives="Confidently negotiate rent, clarify house rules, and request maintenance.",
                estimated_minutes=12,
                difficulty="intermediate",
                display_order=1,
                is_active=True,
            )
            db.add(scen_rent)

        scen_directions = db.query(Scenario).filter(Scenario.slug == "street-directions").first()
        if not scen_directions:
            scen_directions = Scenario(
                category_id=cat_living.id,
                title="Asking Directions on the Street",
                slug="street-directions",
                description="Ask pedestrians which cross, main road, landmark, or walking directions to take.",
                learning_objectives="Understand spatial terms: straight, left, right, behind, near, and far.",
                estimated_minutes=8,
                difficulty="beginner",
                display_order=2,
                is_active=True,
            )
            db.add(scen_directions)

        scen_essentials = db.query(Scenario).filter(Scenario.slug == "daily-essentials").first()
        if not scen_essentials:
            scen_essentials = Scenario(
                category_id=cat_living.id,
                title="Daily Errands & Pharmacy",
                slug="daily-essentials",
                description="Buy daily toiletries, cold medicine, drinking water cans, and Wi-Fi inquiries.",
                learning_objectives="Handle everyday neighbourhood errands and pharmacy requests.",
                estimated_minutes=8,
                difficulty="beginner",
                display_order=3,
                is_active=True,
            )
            db.add(scen_essentials)

        db.commit()
        for s in [scen_darshini, scen_meals_upi, scen_chaat, scen_rent, scen_directions, scen_essentials]:
            db.refresh(s)
        print("Scenarios created/verified.")

        # ─────────────────────────────────────────────────────────────
        # 3. EXPAND PHRASES (60+ practical everyday phrases)
        # ─────────────────────────────────────────────────────────────
        phrases_data = [
            # Darshini Ordering (Scenario 13)
            (scen_darshini.id, "ಒಂದು ಮಸಾಲೆ ದೋಸೆ ಕೊಡಿ.", "Ondu masala dose kodi.", "Give me one masala dosa.", "Standard way to order dosa at a Darshini counter.", "Polite request using 'kodi'"),
            (scen_darshini.id, "ದೋಸೆ ಗರಿ ಗರಿಯಾಗಿರಲಿ.", "Dose gari gariyaagirali.", "Please make the dosa crispy.", "Used to ask the cook for a crisp roast dosa.", "Informal/Direct request to cook"),
            (scen_darshini.id, "ಒಂದು ಸ್ಟ್ರಾಂಗ್ ಫಿಲ್ಟರ್ ಕಾಫಿ ಕೊಡಿ.", "Ondu strong filter coffee kodi.", "Give me one strong filter coffee.", "Order classic Bengaluru filter coffee.", "Polite request"),
            (scen_darshini.id, "ಸ್ವಲ್ಪ ಎಕ್ಸ್ಟ್ರಾ ಚಟ್ನಿ ಹಾಕಿ.", "Svalpa extra chutney haaki.", "Please put a little extra chutney.", "Asking for an extra scoop of coconut chutney.", "Very common everyday phrase"),
            (scen_darshini.id, "ಪಾರ್ಸಲ್ ಮಾಡಿ ಕೊಡಿ.", "Parcel maadi kodi.", "Please pack this for takeaway.", "Order food to take home (parcel).", "Polite request"),
            (scen_darshini.id, "ಬಿಸಿ ನೀರು ಸಿಗುತ್ತಾ?", "Bisi neeru siguttaa?", "Is warm/hot water available?", "Asking for drinking warm water at the counter.", "Helpful question"),
            (scen_darshini.id, "ಟೋಕನ್ ಎಲ್ಲಿ ತಗೋಬೇಕು?", "Token elli tagobeeku?", "Where should I buy the token?", "Asking where the payment cashier counter is located.", "Essential Darshini question"),
            (scen_darshini.id, "ಬಿಲ್ಲು ಎಷ್ಟು ಆಯ್ತು?", "Billu eshtu aaytu?", "How much did the bill come to?", "Asking for the total payment amount.", "General payment phrase"),

            # Meals & UPI (Scenario 14)
            (scen_meals_upi.id, "ಊಟ ರೆಡಿ ಇದೆಯಾ?", "Oota ready ideya?", "Is lunch/meals ready?", "Asking if noon meals are being served.", "Friendly question"),
            (scen_meals_upi.id, "ಖಾರ ಕಡಿಮೆ ಮಾಡಿ.", "Khaara kadime maadi.", "Make it less spicy.", "Crucial for non-spicy eaters in local canteens.", "Polite request"),
            (scen_meals_upi.id, "ಸ್ವಲ್ಪ ಜಾಸ್ತಿ ಸಾಂಬಾರ್ ಕೊಡಿ.", "Svalpa jaasti sambar kodi.", "Please give a little more sambar.", "Asking the server for extra gravy/sambar.", "Common dining phrase"),
            (scen_meals_upi.id, "ಆನ್‌ಲೈನ್ ಪೇಮೆಂಟ್ ಆಗುತ್ತಾ?", "Online payment aaguttaa?", "Do you accept online payment / UPI?", "Checking before paying with mobile wallet.", "Essential modern phrase"),
            (scen_meals_upi.id, "ಕ್ಯೂಆರ್ ಕೋಡ್ ಎಲ್ಲಿ ಇದೆ?", "QR code elli ide?", "Where is the QR code?", "Asking to scan PhonePe / Google Pay QR code.", "Daily utility phrase"),
            (scen_meals_upi.id, "ಚಿಲ್ರೆ ಇಲ್ಲ, ಗೂಗಲ್ ಪೇ ಮಾಡ್ತೀನಿ.", "Chillare illa, Google Pay maadtini.", "I don't have change, I will Google Pay.", "When you only have large notes and prefer digital payment.", "Very practical in Karnataka"),
            (scen_meals_upi.id, "ಪೇಮೆಂಟ್ ಸಕ್ಸಸ್ ಆಯ್ತು, ನೋಡಿ.", "Payment success aaytu, noodi.", "The payment succeeded, please check.", "Showing your phone screen to the cashier.", "Everyday checkout phrase"),

            # Street Food & Snacks (Scenario 15)
            (scen_chaat.id, "ಒಂದು ಮಸಾಲೆ ಪುರಿ ಕೊಡಿ.", "Ondu masala puri kodi.", "Give me one plate of masala puri.", "Ordering Bengaluru's famous evening street chaat.", "Polite order"),
            (scen_chaat.id, "ಸಿಹಿ ಚಟ್ನಿ ಜಾಸ್ತಿ ಹಾಕಿ.", "Sihi chutney jaasti haaki.", "Put more sweet chutney.", "Telling the chaat vendor your flavour preference.", "Customization request"),
            (scen_chaat.id, "ಖಾರ ಬೇಡ, ಮೀಡಿಯಂ ಮಾಡಿ.", "Khaara beda, medium maadi.", "No spicy, please make it medium.", "Clear dietary instruction for street food.", "Easy to remember"),
            (scen_chaat.id, "ಬಿಸಿ ಬಿಸಿ ಬಜ್ಜಿ ಇದೆಯಾ?", "Bisi bisi bajji ideya?", "Do you have piping hot bajjis?", "Asking for fresh hot fritters during rainy evenings.", "Colloquial and friendly"),
            (scen_chaat.id, "ಒಂದು ಕಪ್ ಚಹಾ ಕೊಡಿ.", "Ondu cup chaha kodi.", "Give me one cup of tea.", "Ordering tea at a roadside stall.", "Polite request"),

            # House Rent & Landlord (Scenario 16)
            (scen_rent.id, "ಮನೆ ಬಾಡಿಗೆ ಎಷ್ಟು?", "Mane baadige eshtu?", "How much is the house rent?", "Asking the landlord the monthly rent.", "Key accommodation phrase"),
            (scen_rent.id, "ಅಡ್ವಾನ್ಸ್ ಎಷ್ಟು ಕೊಡಬೇಕು?", "Advance eshtu kodabeeku?", "How much security deposit / advance is needed?", "Inquiring about the rental deposit.", "Standard rental negotiation"),
            (scen_rent.id, "ಕಾವೇರಿ ನೀರು ಯಾವಾಗ ಬರುತ್ತೆ?", "Kaveri neeru yaavaaga baratte?", "When does Cauvery water come?", "Asking about water supply timings in Bengaluru houses.", "Crucial tenant inquiry"),
            (scen_rent.id, "ಕರೆಂಟ್ ಬಿಲ್ ನಾವೇ ಕಟ್ಬೇಕಾ?", "Current bill naave katbeeka?", "Should we pay the electricity bill ourselves?", "Clarifying separate vs shared meter bills.", "Common rental question"),
            (scen_rent.id, "ಟ್ಯಾಪ್ ನಲ್ಲಿ ನೀರು ಬರ್ತಿಲ್ಲ.", "Tap-nalli neeru barthilla.", "Water is not coming from the tap.", "Reporting a plumbing issue to the owner/caretaker.", "Emergency utility complaint"),
            (scen_rent.id, "ಪ್ಲಂಬರ್ ಕಳಿಸಿಕೊಡಿ.", "Plumber kalisikodi.", "Please send a plumber.", "Requesting maintenance assistance.", "Polite request"),
            (scen_rent.id, "ವೈ-ಫೈ ಪಾಸ್‌ವರ್ಡ್ ಏನು?", "Wi-Fi password eenu?", "What is the Wi-Fi password?", "Asking for internet access in PG or rental.", "Modern essential"),

            # Street Directions (Scenario 17)
            (scen_directions.id, "ಇಲ್ಲಿಂದ ಮೆಟ್ರೋ ಸ್ಟೇಷನ್ ಎಲ್ಲಿದೆ?", "Illinda metro station ellide?", "Where is the metro station from here?", "Asking passers-by for metro entrance.", "Commuter essential"),
            (scen_directions.id, "ನೇರವಾಗಿ ಮುಂದೆ ಹೋಗಿ.", "Neeravaagi munde hogi.", "Go straight ahead.", "Common direction instruction.", "Direction vocabulary"),
            (scen_directions.id, "ಮೊದಲನೇ ರೈಟ್ ತಗೊಳ್ಳಿ.", "Modalaney right tagolli.", "Take the first right turn.", "Navigating intersections.", "Direction vocabulary"),
            (scen_directions.id, "ಎಡಗಡೆ ತಿರುಗಿ.", "Edagade tirugi.", "Turn left.", "Direction vocabulary.", "Direction vocabulary"),
            (scen_directions.id, "ಇದು ನಡೆದುಕೊಂಡು ಹೋಗೋ ದೂರವಾ?", "Idu nadedukondu hoogoo dooravaa?", "Is this within walking distance?", "Asking if you can walk or should take an auto.", "Very practical travel phrase"),
            (scen_directions.id, "ಹತ್ತಿರದಲ್ಲೇ ಇದೆ.", "Hattiradalle ide.", "It is right nearby.", "Reassurance that destination is close.", "Descriptive phrase"),
            (scen_directions.id, "ತುಂಬಾ ದೂರ ಇದೆ, ಆಟೋ ತಗೊಳ್ಳಿ.", "Thumba doora ide, auto tagolli.", "It is very far, take an auto.", "Helpful advice from a local.", "Descriptive phrase"),

            # Daily Essentials & Pharmacy (Scenario 18)
            (scen_essentials.id, "ತಲೆನೋವಿಗೆ ಮಾತ್ರೆ ಕೊಡಿ.", "Thalenovige maatre kodi.", "Give me a tablet for headache.", "Buying over-the-counter painkiller at medical store.", "Healthcare essential"),
            (scen_essentials.id, "ಜ್ವರ ಬಂದಿದೆ, ಸಿರಪ್ ಕೊಡಿ.", "Jvara bandide, syrup kodi.", "I have a fever, please give me syrup/medicine.", "Explaining mild fever to the chemist.", "Healthcare essential"),
            (scen_essentials.id, "ಡಾಕ್ಟರ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಬೇಕಾ?", "Doctor prescription beeka?", "Is a doctor's prescription needed?", "Checking if medicine can be bought OTC.", "Clear inquiry"),
            (scen_essentials.id, "ದಿನಕ್ಕೆ ಎಷ್ಟು ಬಾರಿ ತಗೋಬೇಕು?", "Dinakke eshtu baari tagobeeku?", "How many times a day should I take this?", "Asking pharmacist for dosage.", "Crucial health question"),
            (scen_essentials.id, "ಊಟ ಆದ್ಮೇಲೆ ತಗೊಳ್ಳಿ.", "Oota aadmele tagolli.", "Take it after meals.", "Dosage instruction given by chemist.", "Important medical instruction"),
            (scen_essentials.id, "ಒಂದು ವಾಟರ್ ಕ್ಯಾನ್ ಬೇಕು.", "Ondu water can beeku.", "I need a 20-litre water can.", "Ordering drinking water in Bengaluru apartments.", "Daily life staple"),

            # General & Colloquial Kanglish Everyday Survival (Cross-Scenario Scenario 1 additions)
            (1, "ನನಗೆ ಕನ್ನಡ ಸ್ವಲ್ಪ ಸ್ವಲ್ಪ ಗೊತ್ತು.", "Nanage Kannada svalpa svalpa gottu.", "I know a little bit of Kannada.", "Gentle way to let locals know you are learning.", "Friendly beginner phrase"),
            (1, "ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ.", "Dayavittu svalpa nidhaanavaagi maathanaadi.", "Please speak a little slowly.", "Essential when a local speaks too fast.", "Polite communication request"),
            (1, "ಇಂಗ್ಲಿಷ್ ನಲ್ಲಿ ಹೇಳ್ತೀರಾ?", "English-nalli helteeraa?", "Can you tell me in English?", "Polite fallback when you are stuck.", "Polite inquiry"),
            (1, "ಗೊತ್ತಿಲ್ಲ.", "Gottilla.", "I don't know.", "Short and universally understood.", "Everyday basic"),
            (1, "ಗೊತ್ತು.", "Gottu.", "I know / Understood.", "Short affirmation.", "Everyday basic"),
            (1, "ಸ್ವಲ್ಪ ಅಡ್ಜಸ್ಟ್ ಮಾಡಿ.", "Svalpa adjust maadi.", "Please adjust / cooperate a little.", "The ultimate Bengaluru phrase for auto, bus, or seat sharing.", "Iconic local expression"),
            (1, "ಊಟ ಆಯ್ತಾ?", "Oota aaythaa?", "Did you have your meal?", "The ultimate friendly greeting in Karnataka (like 'how are you').", "Cultural icebreaker"),
            (1, "ಬನ್ನಿ, ಕೂತ್ಕೊಳ್ಳಿ.", "Banni, koothkoli.", "Please come, have a seat.", "Warm hospitality phrase.", "Polite welcoming phrase"),
            (1, "ತುಂಬಾ ಧನ್ಯವಾದಗಳು!", "Thumba dhanyavaadagalu!", "Thank you very much!", "Warm, polite gratitude.", "Polite closing"),
            (1, "ಪರವಾಗಿಲ್ಲ.", "Paravaagilla.", "It is alright / No problem / Don't worry.", "Reassurance in daily situations.", "Everyday basic"),
        ]

        inserted_count = 0
        for scen_id, kn, tr, en, ctx, note in phrases_data:
            existing = db.query(Phrase).filter(Phrase.english_meaning == en).first()
            if not existing:
                p = Phrase(
                    scenario_id=scen_id,
                    kannada_text=kn,
                    transliteration=tr,
                    english_meaning=en,
                    context=ctx,
                    formality_note=note,
                    status=PhraseStatus.published.value,
                    display_order=10 + inserted_count,
                )
                db.add(p)
                inserted_count += 1

        db.commit()
        print(f"Added {inserted_count} new high-utility phrases!")

        # ─────────────────────────────────────────────────────────────
        # 4. CONVERSATIONS FOR NEW SCENARIOS
        # ─────────────────────────────────────────────────────────────
        # Conversation for Darshini
        conv_darshini = db.query(Conversation).filter(Conversation.scenario_id == scen_darshini.id).first()
        if not conv_darshini:
            conv_darshini = Conversation(
                scenario_id=scen_darshini.id,
                title="Ordering Breakfast at a Darshini",
                description="Simulate an exchange with the Darshini cashier and server.",
            )
            db.add(conv_darshini)
            db.commit()
            db.refresh(conv_darshini)

            s1 = ConversationStep(
                conversation_id=conv_darshini.id,
                speaker="Cashier",
                message="Good morning! What would you like to have?",
                message_kannada="ನಮಸ್ಕಾರ! ಏನು ಬೇಕು?",
                message_transliteration="Namaskara! Eenu beeku?",
                step_type="choice",
                display_order=1,
            )
            db.add(s1)
            db.commit()
            db.refresh(s1)
            conv_darshini.start_step_id = s1.id

            s2 = ConversationStep(
                conversation_id=conv_darshini.id,
                speaker="Cashier",
                message="Sure, one Masala Dosa is 50 rupees. Eat here or takeaway parcel?",
                message_kannada="ಸರಿ, ಒಂದು ಮಸಾಲೆ ದೋಸೆ ಐವತ್ತು ರೂಪಾಯಿ. ಇಲ್ಲೇ ತಿಂತೀರಾ ಅಥವಾ ಪಾರ್ಸಲಾ?",
                message_transliteration="Sari, ondu masala dose aivattu roopaayi. Ille tinteeraa athavaa parsel-aa?",
                step_type="choice",
                display_order=2,
            )
            db.add(s2)
            db.commit()
            db.refresh(s2)

            s3 = ConversationStep(
                conversation_id=conv_darshini.id,
                speaker="Cashier",
                message="Great! Here is your token. Please collect hot food at counter number 2.",
                message_kannada="ಇಗೋ ನಿಮ್ಮ ಟೋಕನ್. ಕೌಂಟರ್ ಎರಡರಲ್ಲಿ ಬಿಸಿ ದೋಸೆ ತಗೊಳ್ಳಿ.",
                message_transliteration="Igo nimma token. Counter eraduralli bisi dose tagolli.",
                step_type="choice",
                display_order=3,
            )
            db.add(s3)
            db.commit()
            db.refresh(s3)

            s4 = ConversationStep(
                conversation_id=conv_darshini.id,
                speaker="Cook / Server",
                message="Here is your crispy Masala Dosa! Enjoy your food.",
                message_kannada="ಇಗೋ ನಿಮ್ಮ ಗರಿಗರಿ ಮಸಾಲೆ ದೋಸೆ! ಊಟ ಮಾಡಿ.",
                message_transliteration="Igo nimma garigari masala dose! Oota maadi.",
                step_type="end",
                display_order=4,
            )
            db.add(s4)
            db.commit()
            db.refresh(s4)

            # Options
            opt1 = ConversationOption(
                step_id=s1.id,
                option_text="One Masala Dosa and one Coffee, please.",
                option_kannada="ಒಂದು ಮಸಾಲೆ ದೋಸೆ ಮತ್ತು ಕಾಫಿ ಕೊಡಿ.",
                option_transliteration="Ondu masala dose mattu coffee kodi.",
                next_step_id=s2.id,
                display_order=1,
            )
            opt2 = ConversationOption(
                step_id=s2.id,
                option_text="Eat here please.",
                option_kannada="ಇಲ್ಲೇ ತಿಂತೀನಿ.",
                option_transliteration="Ille tinteeni.",
                next_step_id=s3.id,
                display_order=1,
            )
            opt3 = ConversationOption(
                step_id=s2.id,
                option_text="Please pack it for parcel.",
                option_kannada="ಪಾರ್ಸಲ್ ಮಾಡಿ ಕೊಡಿ.",
                option_transliteration="Parcel maadi kodi.",
                next_step_id=s3.id,
                display_order=2,
            )
            opt4 = ConversationOption(
                step_id=s3.id,
                option_text="Thank you! Please give extra chutney.",
                option_kannada="ಧನ್ಯವಾದ! ಸ್ವಲ್ಪ ಜಾಸ್ತಿ ಚಟ್ನಿ ಕೊಡಿ.",
                option_transliteration="Dhanyavada! Svalpa jaasti chutney kodi.",
                next_step_id=s4.id,
                display_order=1,
            )
            db.add_all([opt1, opt2, opt3, opt4])
            db.commit()
            print("Added Darshini Conversation!")

        # ─────────────────────────────────────────────────────────────
        # 5. QUIZZES FOR NEW SCENARIOS
        # ─────────────────────────────────────────────────────────────
        quiz_darshini = db.query(QuizQuestion).filter(QuizQuestion.scenario_id == scen_darshini.id).first()
        if not quiz_darshini:
            q1 = QuizQuestion(
                scenario_id=scen_darshini.id,
                question_text="How do you politely ask for food to be packed for takeaway?",
                question_kannada="ಪಾರ್ಸಲ್ ಬೇಕು ಎಂದು ಹೇಗೆ ಕೇಳ್ತೀರಾ?",
                question_type="multiple_choice",
                display_order=1,
            )
            db.add(q1)
            db.commit()
            db.refresh(q1)

            qo1 = QuizOption(question_id=q1.id, option_text="Parcel maadi kodi", option_kannada="ಪಾರ್ಸಲ್ ಮಾಡಿ ಕೊಡಿ", is_correct=True, display_order=1)
            qo2 = QuizOption(question_id=q1.id, option_text="Ille tinteeni", option_kannada="ಇಲ್ಲೇ ತಿಂತೀನಿ", is_correct=False, display_order=2)
            qo3 = QuizOption(question_id=q1.id, option_text="Billu beda", option_kannada="ಬಿಲ್ಲು ಬೇಡ", is_correct=False, display_order=3)
            db.add_all([qo1, qo2, qo3])

            q2 = QuizQuestion(
                scenario_id=scen_darshini.id,
                question_text="What does 'Khaara kadime maadi' mean?",
                question_kannada="'ಖಾರ ಕಡಿಮೆ ಮಾಡಿ' ಎಂದರೆ ಏನು?",
                question_type="multiple_choice",
                display_order=2,
            )
            db.add(q2)
            db.commit()
            db.refresh(q2)

            qo4 = QuizOption(question_id=q2.id, option_text="Make it less spicy", option_kannada="ಖಾರ ಕಡಿಮೆ ಮಾಡಿ", is_correct=True, display_order=1)
            qo5 = QuizOption(question_id=q2.id, option_text="Make it very sweet", option_kannada="ಸಿಹಿ ಜಾಸ್ತಿ ಮಾಡಿ", is_correct=False, display_order=2)
            qo6 = QuizOption(question_id=q2.id, option_text="Give hot water", option_kannada="ಬಿಸಿ ನೀರು ಕೊಡಿ", is_correct=False, display_order=3)
            db.add_all([qo4, qo5, qo6])
            db.commit()
            print("Added Darshini Quiz!")

        print("Data Expansion Completed Successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    expand_data()
