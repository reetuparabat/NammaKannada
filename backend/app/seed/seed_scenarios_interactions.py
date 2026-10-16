"""
Seed Interactive Conversations and Quizzes for Additional Real-World Scenarios
- Scenario 3: Booking an Auto-Rickshaw (booking-auto)
- Scenario 4: Asking for Prices in Markets (asking-prices)
- Scenario 7: Finding a Classroom on Campus (finding-classroom)
- Scenario 10: Describing Symptoms to a Doctor (describing-symptom)
- Scenario 14: Lunch Meals & UPI Payments (meals-and-upi)
- Scenario 16: Speaking with the Landlord (house-rent)
- Scenario 18: Daily Errands & Pharmacy (daily-essentials)
"""
import sys
import logging
from app.database import SessionLocal
from app.models.scenario import Scenario
from app.models.conversation import Conversation, ConversationStep, ConversationOption
from app.models.quiz import QuizQuestion, QuizOption, QuestionType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_interactions")


def seed_interactions():
    db = SessionLocal()
    try:
        logger.info("Starting conversation and quiz seeding for key scenarios...")

        # =========================================================================
        # 1. SCENARIO 3: Booking an Auto-Rickshaw (booking-auto)
        # =========================================================================
        scen_auto = db.query(Scenario).filter(Scenario.slug == "booking-auto").first()
        if scen_auto:
            existing_conv = db.query(Conversation).filter(Conversation.scenario_id == scen_auto.id).first()
            if not existing_conv:
                conv = Conversation(
                    scenario_id=scen_auto.id,
                    title="Auto Rickshaw to Metro Station",
                    description="Flag down an auto-rickshaw, confirm destination, request meter fare, and navigate the drop point.",
                    is_published=True,
                )
                db.add(conv)
                db.commit()
                db.refresh(conv)

                s1 = ConversationStep(
                    conversation_id=conv.id,
                    speaker="Auto Driver",
                    message="Where do you want to go?",
                    message_kannada="ಎಲ್ಲಿಗೆ ಹೋಗ್ಬೇಕು?",
                    message_transliteration="Ellige hoogbeeku?",
                    step_type="choice",
                    display_order=1,
                )
                db.add(s1)
                db.commit()
                db.refresh(s1)
                conv.start_step_id = s1.id

                s2 = ConversationStep(
                    conversation_id=conv.id,
                    speaker="Auto Driver",
                    message="Okay, get in. Will you pay meter or fixed thirty extra?",
                    message_kannada="ಸರಿ ಬನ್ನಿ, ಮೀಟರ್ ಹಾಕ್ತೀನಿ, ಹತ್ತಿ.",
                    message_transliteration="Sari banni, meter haaktini, hatti.",
                    step_type="choice",
                    display_order=2,
                )
                db.add(s2)
                db.commit()
                db.refresh(s2)

                s3 = ConversationStep(
                    conversation_id=conv.id,
                    speaker="Auto Driver",
                    message="We have reached near the station. Which side should I stop?",
                    message_kannada="ಸ್ಟೇಷನ್ ಹತ್ರ ಬಂದ್ವಿ. ಯಾವ ಕಡೆ ನಿಲ್ಲಿಸಲಿ?",
                    message_transliteration="Station hatra bandvi. Yaava kade nillisali?",
                    step_type="choice",
                    display_order=3,
                )
                db.add(s3)
                db.commit()
                db.refresh(s3)

                s4 = ConversationStep(
                    conversation_id=conv.id,
                    speaker="Auto Driver",
                    message="Bill is 50 rupees. You can pay cash or scan the QR code.",
                    message_kannada="ಐವತ್ತು ರೂಪಾಯಿ ಆಯ್ತು. ಕ್ಯಾಶ್ ಅಥವಾ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
                    message_transliteration="Aivattu roopaayi aaytu. Cash athava QR code scan maadi.",
                    step_type="end",
                    display_order=4,
                )
                db.add(s4)
                db.commit()
                db.refresh(s4)

                # Options for s1
                opt1 = ConversationOption(
                    step_id=s1.id,
                    option_text="Will you come to Indiranagar Metro Station?",
                    option_kannada="ಇಂದಿರಾನಗರ ಮೆಟ್ರೋ ಸ್ಟೇಷನ್‌ಗೆ ಬರ್ತೀರಾ?",
                    option_transliteration="Indiranagar Metro station-ge barteera?",
                    next_step_id=s2.id,
                    display_order=1,
                )
                opt2 = ConversationOption(
                    step_id=s1.id,
                    option_text="How much to Koramangala?",
                    option_kannada="ಕೋರಮಂಗಲಕ್ಕೆ ಎಷ್ಟು?",
                    option_transliteration="Koramangala-kke eshtu?",
                    next_step_id=s2.id,
                    display_order=2,
                )
                # Options for s2
                opt3 = ConversationOption(
                    step_id=s2.id,
                    option_text="Please put the meter, sir.",
                    option_kannada="ಮೀಟರ್ ಹಾಕಿ ಸರ್, ಪ್ಲೀಸ್.",
                    option_transliteration="Meter haaki sir, please.",
                    next_step_id=s3.id,
                    display_order=1,
                )
                opt4 = ConversationOption(
                    step_id=s2.id,
                    option_text="Please adjust a little.",
                    option_kannada="ಸ್ವಲ್ಪ ಅಡ್ಜಸ್ಟ್ ಮಾಡಿ.",
                    option_transliteration="Svalpa adjust maadi.",
                    next_step_id=s3.id,
                    display_order=2,
                )
                # Options for s3
                opt5 = ConversationOption(
                    step_id=s3.id,
                    option_text="Please stop near the entrance on the left side.",
                    option_kannada="ಎಡಗಡೆ ಎಂಟ್ರೆನ್ಸ್ ಹತ್ತಿರ ನಿಲ್ಲಿಸಿ.",
                    option_transliteration="Edagade entrance hatthira nillisi.",
                    next_step_id=s4.id,
                    display_order=1,
                )
                opt6 = ConversationOption(
                    step_id=s3.id,
                    option_text="Stop right here, thank you.",
                    option_kannada="ಇಲ್ಲೇ ನಿಲ್ಲಿಸಿ, ಧನ್ಯವಾದ.",
                    option_transliteration="Ille nillisi, dhanyavada.",
                    next_step_id=s4.id,
                    display_order=2,
                )
                db.add_all([opt1, opt2, opt3, opt4, opt5, opt6])
                db.commit()
                logger.info("Added Conversation for Scenario 3: Booking an Auto")

            # Quizzes for Scenario 3
            if db.query(QuizQuestion).filter(QuizQuestion.scenario_id == scen_auto.id).count() == 0:
                q1 = QuizQuestion(
                    scenario_id=scen_auto.id,
                    question_text="How do you politely ask an auto driver if they will go to a destination?",
                    question_kannada="ಆಟೋ ಚಾಲಕರನ್ನು 'ಬರ್ತೀರಾ?' ಎಂದು ಕೇಳುವುದು ಹೇಗೆ?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Barteera?' is the respectful second-person plural form used to address drivers and elders.",
                    display_order=1,
                )
                db.add(q1)
                db.commit()
                db.refresh(q1)
                qo1 = QuizOption(question_id=q1.id, option_text="Metro-ge barteera?", option_kannada="ಮೆಟ್ರೋಗೆ ಬರ್ತೀರಾ?", is_correct=True, display_order=1)
                qo2 = QuizOption(question_id=q1.id, option_text="Metro-ge hoogu!", option_kannada="ಮೆಟ್ರೋಗೆ ಹೋಗು!", is_correct=False, display_order=2)
                qo3 = QuizOption(question_id=q1.id, option_text="Auto beda", option_kannada="ಆಟೋ ಬೇಡ", is_correct=False, display_order=3)
                db.add_all([qo1, qo2, qo3])

                q2 = QuizQuestion(
                    scenario_id=scen_auto.id,
                    question_text="What does 'Meter haaki' mean?",
                    question_kannada="'ಮೀಟರ್ ಹಾಕಿ' ಅಂದರೆ ಏನು?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Meter haaki' instructs the driver to turn on the fare meter.",
                    display_order=2,
                )
                db.add(q2)
                db.commit()
                db.refresh(q2)
                qo4 = QuizOption(question_id=q2.id, option_text="Please turn on the meter", option_kannada="ಮೀಟರ್ ಆನ್ ಮಾಡಿ", is_correct=True, display_order=1)
                qo5 = QuizOption(question_id=q2.id, option_text="Drive faster", option_kannada="ಬೇಗ ಓಡಿಸಿ", is_correct=False, display_order=2)
                qo6 = QuizOption(question_id=q2.id, option_text="Stop here", option_kannada="ಇಲ್ಲೇ ನಿಲ್ಲಿಸಿ", is_correct=False, display_order=3)
                db.add_all([qo4, qo5, qo6])
                db.commit()
                logger.info("Added Quiz for Scenario 3: Booking an Auto")

        # =========================================================================
        # 2. SCENARIO 4: Asking for Prices in Markets (asking-prices)
        # =========================================================================
        scen_market = db.query(Scenario).filter(Scenario.slug == "asking-prices").first()
        if scen_market:
            if db.query(Conversation).filter(Conversation.scenario_id == scen_market.id).count() == 0:
                conv_market = Conversation(
                    scenario_id=scen_market.id,
                    title="Buying Vegetables at KR Market",
                    description="Ask vegetable vendor prices per kilo, bargain courteously, and check freshness.",
                    is_published=True,
                )
                db.add(conv_market)
                db.commit()
                db.refresh(conv_market)

                ms1 = ConversationStep(
                    conversation_id=conv_market.id,
                    speaker="Vendor",
                    message="Welcome! Fresh tomatoes and onions just arrived from Kolar. What do you need?",
                    message_kannada="ಬನ್ನಿ ಅಮ್ಮಾ/ಸರ್, ಫ್ರೆಶ್ ಟೊಮ್ಯಾಟೋ ಮತ್ತು ಈರುಳ್ಳಿ ಇದೆ. ಏನು ಬೇಕು?",
                    message_transliteration="Banni, fresh tomato mattu eerulli ide. Eenu beeku?",
                    step_type="choice",
                    display_order=1,
                )
                db.add(ms1)
                db.commit()
                db.refresh(ms1)
                conv_market.start_step_id = ms1.id

                ms2 = ConversationStep(
                    conversation_id=conv_market.id,
                    speaker="Vendor",
                    message="Tomatoes are forty rupees per kilo.",
                    message_kannada="ಟೊಮ್ಯಾಟೋ ಕೆಜಿಗೆ ನಲವತ್ತು ರೂಪಾಯಿ.",
                    message_transliteration="Tomato KG-ge nalavattu roopaayi.",
                    step_type="choice",
                    display_order=2,
                )
                db.add(ms2)
                db.commit()
                db.refresh(ms2)

                ms3 = ConversationStep(
                    conversation_id=conv_market.id,
                    speaker="Vendor",
                    message="Okay, take it for thirty-five rupees. How many kilos should I weigh?",
                    message_kannada="ಸರಿ, ಮೂವತ್ತೈದು ರೂಪಾಯಿಗೆ ತಗೊಳ್ಳಿ. ಎಷ್ಟು ಕೆಜಿ ತೂಕ ಮಾಡ್ಲಿ?",
                    message_transliteration="Sari, moovattaidu roopaayige tagolli. Eshtu KG tooka maadli?",
                    step_type="choice",
                    display_order=3,
                )
                db.add(ms3)
                db.commit()
                db.refresh(ms3)

                ms4 = ConversationStep(
                    conversation_id=conv_market.id,
                    speaker="Vendor",
                    message="Here are your two kilos of tomatoes. Total seventy rupees.",
                    message_kannada="ಇಗೋ ಎರಡು ಕೆಜಿ ಟೊಮ್ಯಾಟೋ. ಒಟ್ಟು ಎಪ್ಪತ್ತು ರೂಪಾಯಿ.",
                    message_transliteration="Igo eradu KG tomato. Ottu eppattu roopaayi.",
                    step_type="end",
                    display_order=4,
                )
                db.add(ms4)
                db.commit()
                db.refresh(ms4)

                # Options
                mopt1 = ConversationOption(
                    step_id=ms1.id,
                    option_text="How much per kilo for tomatoes?",
                    option_kannada="ಟೊಮ್ಯಾಟೋ ಕೆಜಿಗೆ ಎಷ್ಟು?",
                    option_transliteration="Tomato KG-ge eshtu?",
                    next_step_id=ms2.id,
                    display_order=1,
                )
                mopt2 = ConversationOption(
                    step_id=ms2.id,
                    option_text="Forty is too expensive, reduce it a little please.",
                    option_kannada="ನಲವತ್ತು ತುಂಬಾ ಜಾಸ್ತಿ, ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.",
                    option_transliteration="Nalavattu thumba jaasti, svalpa kadime maadi.",
                    next_step_id=ms3.id,
                    display_order=1,
                )
                mopt3 = ConversationOption(
                    step_id=ms3.id,
                    option_text="Please pack two kilos.",
                    option_kannada="ಎರಡು ಕೆಜಿ ಹಾಕಿ ಕೊಡಿ.",
                    option_transliteration="Eradu KG haaki kodi.",
                    next_step_id=ms4.id,
                    display_order=1,
                )
                db.add_all([mopt1, mopt2, mopt3])
                db.commit()
                logger.info("Added Conversation for Scenario 4: Asking Prices")

            # Quizzes for Scenario 4
            if db.query(QuizQuestion).filter(QuizQuestion.scenario_id == scen_market.id).count() == 0:
                mq1 = QuizQuestion(
                    scenario_id=scen_market.id,
                    question_text="How do you say 'How much is it per kilo?' in Kannada?",
                    question_kannada="'ಕೆಜಿಗೆ ಎಷ್ಟು?' ಎಂದು ಕೇಳುವುದು ಹೇಗೆ?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'KG-ge eshtu?' is the standard and most common question in vegetable and fruit markets.",
                    display_order=1,
                )
                db.add(mq1)
                db.commit()
                db.refresh(mq1)
                mqo1 = QuizOption(question_id=mq1.id, option_text="KG-ge eshtu?", option_kannada="ಕೆಜಿಗೆ ಎಷ್ಟು?", is_correct=True, display_order=1)
                mqo2 = QuizOption(question_id=mq1.id, option_text="KG ellide?", option_kannada="ಕೆಜಿ ಎಲ್ಲಿದೆ?", is_correct=False, display_order=2)
                mqo3 = QuizOption(question_id=mq1.id, option_text="KG beka?", option_kannada="ಕೆಜಿ ಬೇಕಾ?", is_correct=False, display_order=3)
                db.add_all([mqo1, mqo2, mqo3])

                mq2 = QuizQuestion(
                    scenario_id=scen_market.id,
                    question_text="Which phrase politely asks a seller to reduce the price?",
                    question_kannada="ಬೆಲೆ ಕಡಿಮೆ ಮಾಡಲು ವಿನಂತಿಸುವ ವಾಕ್ಯ ಯಾವುದು?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Svalpa kadime maadi' means 'Please lower/reduce the price a little bit'.",
                    display_order=2,
                )
                db.add(mq2)
                db.commit()
                db.refresh(mq2)
                mqo4 = QuizOption(question_id=mq2.id, option_text="Svalpa kadime maadi", option_kannada="ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ", is_correct=True, display_order=1)
                mqo5 = QuizOption(question_id=mq2.id, option_text="Jaasti kodi", option_kannada="ಜಾಸ್ತಿ ಕೊಡಿ", is_correct=False, display_order=2)
                mqo6 = QuizOption(question_id=mq2.id, option_text="Bega maadi", option_kannada="ಬೇಗ ಮಾಡಿ", is_correct=False, display_order=3)
                db.add_all([mqo4, mqo5, mqo6])
                db.commit()
                logger.info("Added Quiz for Scenario 4: Asking Prices")

        # =========================================================================
        # 3. SCENARIO 7: Finding a Classroom on Campus (finding-classroom)
        # =========================================================================
        scen_college = db.query(Scenario).filter(Scenario.slug == "finding-classroom").first()
        if scen_college:
            if db.query(Conversation).filter(Conversation.scenario_id == scen_college.id).count() == 0:
                conv_coll = Conversation(
                    scenario_id=scen_college.id,
                    title="Navigating the College Campus",
                    description="Ask a senior student or college peon for seminar hall, library, or administrative block.",
                    is_published=True,
                )
                db.add(conv_coll)
                db.commit()
                db.refresh(conv_coll)

                cs1 = ConversationStep(
                    conversation_id=conv_coll.id,
                    speaker="College Staff / Senior",
                    message="Hello! You look new here. Can I help you with anything?",
                    message_kannada="ನಮಸ್ಕಾರ! ನೀವು ಹೊಸಬರಾ? ಏನಾದ್ರೂ ಸಹಾಯ ಬೇಕಾ?",
                    message_transliteration="Namaskara! Neevu hosabaraa? Eenaadru sahaaya beeka?",
                    step_type="choice",
                    display_order=1,
                )
                db.add(cs1)
                db.commit()
                db.refresh(cs1)
                conv_coll.start_step_id = cs1.id

                cs2 = ConversationStep(
                    conversation_id=conv_coll.id,
                    speaker="College Staff / Senior",
                    message="Go straight, take the stairs to the second floor. Room 204 is on the right.",
                    message_kannada="ನೇರವಾಗಿ ಹೋಗಿ, ಮೆಟ್ಟಿಲು ಹತ್ತಿ ಎರಡನೇ ಮಹಡಿಗೆ ಹೋಗಿ. ಬಲಗಡೆ ಇದೆ.",
                    message_transliteration="Neeravaagi hoogi, mettilu hatti eradane mahadige hoogi. Balagade ide.",
                    step_type="choice",
                    display_order=2,
                )
                db.add(cs2)
                db.commit()
                db.refresh(cs2)

                cs3 = ConversationStep(
                    conversation_id=conv_coll.id,
                    speaker="College Staff / Senior",
                    message="You are welcome! All the best with your classes.",
                    message_kannada="ಪರವಾಗಿಲ್ಲ! ನಿಮ್ಮ ತರಗತಿಗಳಿಗೆ ಆಲ್‌ ದ ಬೆಸ್ಟ್.",
                    message_transliteration="Paravaagilla! Nimma taragatigalige all the best.",
                    step_type="end",
                    display_order=3,
                )
                db.add(cs3)
                db.commit()
                db.refresh(cs3)

                copt1 = ConversationOption(
                    step_id=cs1.id,
                    option_text="Where is Computer Science Seminar Hall, sir?",
                    option_kannada="ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಸೆಮಿನಾರ್ ಹಾಲ್ ಎಲ್ಲಿದೆ, ಸರ್?",
                    option_transliteration="Computer science seminar hall ellide, sir?",
                    next_step_id=cs2.id,
                    display_order=1,
                )
                copt2 = ConversationOption(
                    step_id=cs2.id,
                    option_text="Thank you very much for your guidance!",
                    option_kannada="ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ತುಂಬಾ ಧನ್ಯವಾದ!",
                    option_transliteration="Maargadarshanakkaagi thumba dhanyavada!",
                    next_step_id=cs3.id,
                    display_order=1,
                )
                db.add_all([copt1, copt2])
                db.commit()
                logger.info("Added Conversation for Scenario 7: Finding Classroom")

            # Quizzes for Scenario 7
            if db.query(QuizQuestion).filter(QuizQuestion.scenario_id == scen_college.id).count() == 0:
                cq1 = QuizQuestion(
                    scenario_id=scen_college.id,
                    question_text="How do you ask 'Where is the library?' in Kannada?",
                    question_kannada="'ಗ್ರಂಥಾಲಯ ಎಲ್ಲಿದೆ?' ಎಂದು ಹೇಗೆ ಕೇಳ್ತೀರಾ?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Library ellide?' or 'Granthaalaya ellide?' asks for the location.",
                    display_order=1,
                )
                db.add(cq1)
                db.commit()
                db.refresh(cq1)
                cqo1 = QuizOption(question_id=cq1.id, option_text="Library ellide?", option_kannada="ಲೈಬ್ರರಿ ಎಲ್ಲಿದೆ?", is_correct=True, display_order=1)
                cqo2 = QuizOption(question_id=cq1.id, option_text="Library yaavaga?", option_kannada="ಲೈಬ್ರರಿ ಯಾವಾಗ?", is_correct=False, display_order=2)
                cqo3 = QuizOption(question_id=cq1.id, option_text="Library eshtu?", option_kannada="ಲೈಬ್ರರಿ ಎಷ್ಟು?", is_correct=False, display_order=3)
                db.add_all([cqo1, cqo2, cqo3])

                cq2 = QuizQuestion(
                    scenario_id=scen_college.id,
                    question_text="What does 'Balagade' mean?",
                    question_kannada="'ಬಲಗಡೆ' ಎಂದರೆ ಏನು?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Balagade' means Right side. 'Edagade' means Left side.",
                    display_order=2,
                )
                db.add(cq2)
                db.commit()
                db.refresh(cq2)
                cqo4 = QuizOption(question_id=cq2.id, option_text="Right side", option_kannada="ಬಲಗಡೆ", is_correct=True, display_order=1)
                cqo5 = QuizOption(question_id=cq2.id, option_text="Left side", option_kannada="ಎಡಗಡೆ", is_correct=False, display_order=2)
                cqo6 = QuizOption(question_id=cq2.id, option_text="Straight ahead", option_kannada="ನೇರವಾಗಿ", is_correct=False, display_order=3)
                db.add_all([cqo4, cqo5, cqo6])
                db.commit()
                logger.info("Added Quiz for Scenario 7: Finding Classroom")

        # =========================================================================
        # 4. SCENARIO 10: Describing Symptoms to a Doctor (describing-symptom)
        # =========================================================================
        scen_doc = db.query(Scenario).filter(Scenario.slug == "describing-symptom").first()
        if scen_doc:
            if db.query(Conversation).filter(Conversation.scenario_id == scen_doc.id).count() == 0:
                conv_doc = Conversation(
                    scenario_id=scen_doc.id,
                    title="Consulting a Clinic Doctor",
                    description="Explain fever and headache to the physician, answer how long you have had pain, and understand medicine dosage.",
                    is_published=True,
                )
                db.add(conv_doc)
                db.commit()
                db.refresh(conv_doc)

                ds1 = ConversationStep(
                    conversation_id=conv_doc.id,
                    speaker="Doctor",
                    message="Hello, please sit down. What problem are you experiencing?",
                    message_kannada="ನಮಸ್ಕಾರ, ಕೂತ್ಕೊಳ್ಳಿ. ನಿಮಗೆ ಏನು ತೊಂದರೆ ಆಗಿದೆ?",
                    message_transliteration="Namaskara, kootkolli. Nimage eenu thondare aagide?",
                    step_type="choice",
                    display_order=1,
                )
                db.add(ds1)
                db.commit()
                db.refresh(ds1)
                conv_doc.start_step_id = ds1.id

                ds2 = ConversationStep(
                    conversation_id=conv_doc.id,
                    speaker="Doctor",
                    message="Since how many days have you had this fever and severe headache?",
                    message_kannada="ಎಷ್ಟು ದಿನದಿಂದ ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ?",
                    message_transliteration="Eshtu dinadinda jvara mattu thalenovu ide?",
                    step_type="choice",
                    display_order=2,
                )
                db.add(ds2)
                db.commit()
                db.refresh(ds2)

                ds3 = ConversationStep(
                    conversation_id=conv_doc.id,
                    speaker="Doctor",
                    message="I have written a prescription for three days. Take one tablet morning and night after food.",
                    message_kannada="ಮೂರು ದಿನಕ್ಕೆ ಮಾತ್ರೆ ಬರೆದಿದ್ದೇನೆ. ಊಟ ಆದಮೇಲೆ ಬೆಳಗ್ಗೆ ಮತ್ತು ರಾತ್ರಿ ತಗೊಳ್ಳಿ.",
                    message_transliteration="Mooru dinakke maatre barediddene. Oota aadmele belagge mattu raatri tagolli.",
                    step_type="end",
                    display_order=3,
                )
                db.add(ds3)
                db.commit()
                db.refresh(ds3)

                dopt1 = ConversationOption(
                    step_id=ds1.id,
                    option_text="Doctor, I have high fever and severe headache.",
                    option_kannada="ಡಾಕ್ಟರ್, ನನಗೆ ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ.",
                    option_transliteration="Doctor, nanage jvara mattu thalenovu ide.",
                    next_step_id=ds2.id,
                    display_order=1,
                )
                dopt2 = ConversationOption(
                    step_id=ds2.id,
                    option_text="Since two days, doctor.",
                    option_kannada="ಎರಡು ದಿನದಿಂದ, ಡಾಕ್ಟರ್.",
                    option_transliteration="Eradu dinadinda, doctor.",
                    next_step_id=ds3.id,
                    display_order=1,
                )
                db.add_all([dopt1, dopt2])
                db.commit()
                logger.info("Added Conversation for Scenario 10: Describing Symptom")

            # Quizzes for Scenario 10
            if db.query(QuizQuestion).filter(QuizQuestion.scenario_id == scen_doc.id).count() == 0:
                dq1 = QuizQuestion(
                    scenario_id=scen_doc.id,
                    question_text="How do you tell a doctor 'I have a fever' in Kannada?",
                    question_kannada="'ನನಗೆ ಜ್ವರ ಇದೆ' ಎಂದು ಹೇಳುವುದು ಹೇಗೆ?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Nanage jvara ide' directly translates to 'I have a fever'.",
                    display_order=1,
                )
                db.add(dq1)
                db.commit()
                db.refresh(dq1)
                dqo1 = QuizOption(question_id=dq1.id, option_text="Nanage jvara ide", option_kannada="ನನಗೆ ಜ್ವರ ಇದೆ", is_correct=True, display_order=1)
                dqo2 = QuizOption(question_id=dq1.id, option_text="Nanage hasivu aagide", option_kannada="ನನಗೆ ಹಸಿವು ಆಗಿದೆ", is_correct=False, display_order=2)
                dqo3 = QuizOption(question_id=dq1.id, option_text="Nanage nidde bandide", option_kannada="ನನಗೆ ನಿದ್ದೆ ಬಂದಿದೆ", is_correct=False, display_order=3)
                db.add_all([dqo1, dqo2, dqo3])

                dq2 = QuizQuestion(
                    scenario_id=scen_doc.id,
                    question_text="What does 'Oota aadmele tagolli' mean on a prescription?",
                    question_kannada="'ಊಟ ಆದಮೇಲೆ ತಗೊಳ್ಳಿ' ಎಂದರೆ ಏನು?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Oota aadmele tagolli' means 'Take it after eating meals'.",
                    display_order=2,
                )
                db.add(dq2)
                db.commit()
                db.refresh(dq2)
                dqo4 = QuizOption(question_id=dq2.id, option_text="Take after food", option_kannada="ಊಟದ ನಂತರ ತಗೊಳ್ಳಿ", is_correct=True, display_order=1)
                dqo5 = QuizOption(question_id=dq2.id, option_text="Take on empty stomach", option_kannada="ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ", is_correct=False, display_order=2)
                dqo6 = QuizOption(question_id=dq2.id, option_text="Do not take water", option_kannada="ನೀರು ಕುಡಿಯಬೇಡಿ", is_correct=False, display_order=3)
                db.add_all([dqo4, dqo5, dqo6])
                db.commit()
                logger.info("Added Quiz for Scenario 10: Describing Symptom")

        # =========================================================================
        # 5. SCENARIO 16: Speaking with the Landlord (house-rent)
        # =========================================================================
        scen_landlord = db.query(Scenario).filter(Scenario.slug == "house-rent").first()
        if scen_landlord:
            if db.query(Conversation).filter(Conversation.scenario_id == scen_landlord.id).count() == 0:
                conv_ll = Conversation(
                    scenario_id=scen_landlord.id,
                    title="Enquiring About House Rent and Deposit",
                    description="Speak with the house owner regarding monthly rent, Cauvery water timings, electricity bills, and maintenance.",
                    is_published=True,
                )
                db.add(conv_ll)
                db.commit()
                db.refresh(conv_ll)

                ls1 = ConversationStep(
                    conversation_id=conv_ll.id,
                    speaker="Landlord",
                    message="Yes, the 1BHK on the first floor is available. Are you working or studying?",
                    message_kannada="ಹೌದು, ಮೊದಲನೇ ಮಹಡಿಯಲ್ಲಿ 1BHK ಖಾಲಿ ಇದೆ. ನೀವು ಕೆಲಸ ಮಾಡ್ತಿದ್ದೀರಾ ಅಥವಾ ಓದ್ತಿದ್ದೀರಾ?",
                    message_transliteration="Haudu, modalaney mahadiyalli 1BHK khaali ide. Neevu kelasa maadtiddeera athava odtiddeera?",
                    step_type="choice",
                    display_order=1,
                )
                db.add(ls1)
                db.commit()
                db.refresh(ls1)
                conv_ll.start_step_id = ls1.id

                ls2 = ConversationStep(
                    conversation_id=conv_ll.id,
                    speaker="Landlord",
                    message="Rent is twelve thousand rupees per month. Water and maintenance included.",
                    message_kannada="ತಿಂಗಳಿಗೆ ಹನ್ನೆರಡು ಸಾವಿರ ಬಾಡಿಗೆ. ನೀರು ಮತ್ತು ಮೇಂಟೆನೆನ್ಸ್ ಸೇರಿದೆ.",
                    message_transliteration="Thingalige hanneradu saavira baadige. Neeru mattu maintenance seride.",
                    step_type="choice",
                    display_order=2,
                )
                db.add(ls2)
                db.commit()
                db.refresh(ls2)

                ls3 = ConversationStep(
                    conversation_id=conv_ll.id,
                    speaker="Landlord",
                    message="Advance is fifty thousand. You can pay via bank transfer or Google Pay.",
                    message_kannada="ಅಡ್ವಾನ್ಸ್ ಐವತ್ತು ಸಾವಿರ. ಬ್ಯಾಂಕ್ ಅಥವಾ ಗೂಗಲ್ ಪೇ ಮೂಲಕ ಕೊಡಬಹುದು.",
                    message_transliteration="Advance aivattu saavira. Bank athava Google Pay moolaka kodabahudu.",
                    step_type="end",
                    display_order=3,
                )
                db.add(ls3)
                db.commit()
                db.refresh(ls3)

                lopt1 = ConversationOption(
                    step_id=ls1.id,
                    option_text="I am working in IT. How much is the house rent per month?",
                    option_kannada="ನಾನು ಐಟಿಯಲ್ಲಿ ಕೆಲಸ ಮಾಡ್ತಿದ್ದೀನಿ. ಮನೆ ಬಾಡಿಗೆ ಎಷ್ಟು?",
                    option_transliteration="Naanu IT-yalli kelasa maadtiddini. Mane baadige eshtu?",
                    next_step_id=ls2.id,
                    display_order=1,
                )
                lopt2 = ConversationOption(
                    step_id=ls2.id,
                    option_text="How much is the security deposit / advance?",
                    option_kannada="ಅಡ್ವಾನ್ಸ್ ಎಷ್ಟು ಕೊಡಬೇಕು?",
                    option_transliteration="Advance eshtu kodabeeku?",
                    next_step_id=ls3.id,
                    display_order=1,
                )
                db.add_all([lopt1, lopt2])
                db.commit()
                logger.info("Added Conversation for Scenario 16: Speaking with Landlord")

            # Quizzes for Scenario 16
            if db.query(QuizQuestion).filter(QuizQuestion.scenario_id == scen_landlord.id).count() == 0:
                lq1 = QuizQuestion(
                    scenario_id=scen_landlord.id,
                    question_text="What does 'Mane baadige eshtu?' mean?",
                    question_kannada="'ಮನೆ ಬಾಡಿಗೆ ಎಷ್ಟು?' ಎಂದರೆ ಏನು?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Mane' means house, 'baadige' means rent, 'eshtu' means how much.",
                    display_order=1,
                )
                db.add(lq1)
                db.commit()
                db.refresh(lq1)
                lqo1 = QuizOption(question_id=lq1.id, option_text="How much is the house rent?", option_kannada="ಮನೆ ಬಾಡಿಗೆ ಎಷ್ಟು?", is_correct=True, display_order=1)
                lqo2 = QuizOption(question_id=lq1.id, option_text="Where is the house located?", option_kannada="ಮನೆ ಎಲ್ಲಿದೆ?", is_correct=False, display_order=2)
                lqo3 = QuizOption(question_id=lq1.id, option_text="Who is living in the house?", option_kannada="ಮನೆಯಲ್ಲಿ ಯಾರು ಇದ್ದಾರೆ?", is_correct=False, display_order=3)
                db.add_all([lqo1, lqo2, lqo3])

                lq2 = QuizQuestion(
                    scenario_id=scen_landlord.id,
                    question_text="How do you ask if Cauvery drinking water is available?",
                    question_kannada="ಕಾವೇರಿ ಕುಡಿಯುವ ನೀರು ಇದೆಯಾ ಎಂದು ಹೇಗೆ ಕೇಳ್ತೀರಾ?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Cauvery neeru baruttaa?' asks if Cauvery water supply comes regularly.",
                    display_order=2,
                )
                db.add(lq2)
                db.commit()
                db.refresh(lq2)
                lqo4 = QuizOption(question_id=lq2.id, option_text="Cauvery neeru baruttaa?", option_kannada="ಕಾವೇರಿ ನೀರು ಬರುತ್ತಾ?", is_correct=True, display_order=1)
                lqo5 = QuizOption(question_id=lq2.id, option_text="Current bill eshtu?", option_kannada="ಕರೆಂಟ್ ಬಿಲ್ ಎಷ್ಟು?", is_correct=False, display_order=2)
                lqo6 = QuizOption(question_id=lq2.id, option_text="Wi-Fi ideya?", option_kannada="ವೈಫೈ ಇದೆಯಾ?", is_correct=False, display_order=3)
                db.add_all([lqo4, lqo5, lqo6])
                db.commit()
                logger.info("Added Quiz for Scenario 16: Speaking with Landlord")

        # =========================================================================
        # 6. SCENARIO 18: Daily Errands & Pharmacy (daily-essentials)
        # =========================================================================
        scen_pharmacy = db.query(Scenario).filter(Scenario.slug == "daily-essentials").first()
        if scen_pharmacy:
            if db.query(Conversation).filter(Conversation.scenario_id == scen_pharmacy.id).count() == 0:
                conv_ph = Conversation(
                    scenario_id=scen_pharmacy.id,
                    title="Buying Medicine at a Local Medical Store",
                    description="Request paracetamol, ask the chemist for dosage instructions, and pay using UPI.",
                    is_published=True,
                )
                db.add(conv_ph)
                db.commit()
                db.refresh(conv_ph)

                ps1 = ConversationStep(
                    conversation_id=conv_ph.id,
                    speaker="Chemist",
                    message="Welcome! Which tablet or syrup do you need?",
                    message_kannada="ಬನ್ನಿ! ಯಾವ ಮಾತ್ರೆ ಅಥವಾ ಸಿರಪ್ ಬೇಕು?",
                    message_transliteration="Banni! Yaava maatre athava syrup beeku?",
                    step_type="choice",
                    display_order=1,
                )
                db.add(ps1)
                db.commit()
                db.refresh(ps1)
                conv_ph.start_step_id = ps1.id

                ps2 = ConversationStep(
                    conversation_id=conv_ph.id,
                    speaker="Chemist",
                    message="Here is Paracetamol 650. Take one tablet twice daily after meals if you have fever.",
                    message_kannada="ಇಗೋ ಪ್ಯಾರಸಿಟಮಾಲ್. ಜ್ವರ ಇದ್ರೆ ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ಊಟ ಆದ್ಮೇಲೆ ತಗೊಳ್ಳಿ.",
                    message_transliteration="Igo paracetamol. Jvara idre dinakke eradu baari oota aadmele tagolli.",
                    step_type="choice",
                    display_order=2,
                )
                db.add(ps2)
                db.commit()
                db.refresh(ps2)

                ps3 = ConversationStep(
                    conversation_id=conv_ph.id,
                    speaker="Chemist",
                    message="Total is thirty rupees. The Google Pay QR code is placed on the glass counter.",
                    message_kannada="ಮೂವತ್ತು ರೂಪಾಯಿ. ಕ್ಯೂಆರ್ ಕೋಡ್ ಕೌಂಟರ್ ಮೇಲಿದೆ.",
                    message_transliteration="Moovattu roopaayi. QR code counter melide.",
                    step_type="end",
                    display_order=3,
                )
                db.add(ps3)
                db.commit()
                db.refresh(ps3)

                popt1 = ConversationOption(
                    step_id=ps1.id,
                    option_text="Please give tablets for fever and headache.",
                    option_kannada="ಜ್ವರ ಮತ್ತು ತಲೆನೋವಿಗೆ ಮಾತ್ರೆ ಕೊಡಿ.",
                    option_transliteration="Jvara mattu thalenovige maatre kodi.",
                    next_step_id=ps2.id,
                    display_order=1,
                )
                popt2 = ConversationOption(
                    step_id=ps2.id,
                    option_text="Okay, does online payment work?",
                    option_kannada="ಸರಿ, ಆನ್‌ಲೈನ್ ಪೇಮೆಂಟ್ ಆಗುತ್ತಾ?",
                    option_transliteration="Sari, online payment aaguttaa?",
                    next_step_id=ps3.id,
                    display_order=1,
                )
                db.add_all([popt1, popt2])
                db.commit()
                logger.info("Added Conversation for Scenario 18: Pharmacy")

            # Quizzes for Scenario 18
            if db.query(QuizQuestion).filter(QuizQuestion.scenario_id == scen_pharmacy.id).count() == 0:
                pq1 = QuizQuestion(
                    scenario_id=scen_pharmacy.id,
                    question_text="What does 'Thalenovige maatre kodi' mean at a pharmacy?",
                    question_kannada="'ತಲೆನೋವಿಗೆ ಮಾತ್ರೆ ಕೊಡಿ' ಎಂದರೆ ಏನು?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Thalenovu' means headache, 'maatre' means tablet, 'kodi' means give.",
                    display_order=1,
                )
                db.add(pq1)
                db.commit()
                db.refresh(pq1)
                pqo1 = QuizOption(question_id=pq1.id, option_text="Give me a tablet for headache", option_kannada="ತಲೆನೋವಿಗೆ ಮಾತ್ರೆ ಕೊಡಿ", is_correct=True, display_order=1)
                pqo2 = QuizOption(question_id=pq1.id, option_text="Give me cough syrup", option_kannada="ಕೆಮ್ಮಿಗೆ ಸಿರಪ್ ಕೊಡಿ", is_correct=False, display_order=2)
                pqo3 = QuizOption(question_id=pq1.id, option_text="Give me bandage", option_kannada="ಪಟ್ಟಿ ಕೊಡಿ", is_correct=False, display_order=3)
                db.add_all([pqo1, pqo2, pqo3])

                pq2 = QuizQuestion(
                    scenario_id=scen_pharmacy.id,
                    question_text="How do you ask 'How many times a day should I take this?'",
                    question_kannada="'ದಿನಕ್ಕೆ ಎಷ್ಟು ಬಾರಿ ತಗೋಬೇಕು?' ಎಂದು ಕೇಳುವುದು ಹೇಗೆ?",
                    question_type=QuestionType.multiple_choice.value,
                    explanation="'Dinakke' (per day) 'eshtu baari' (how many times) 'tagobeeku' (should take).",
                    display_order=2,
                )
                db.add(pq2)
                db.commit()
                db.refresh(pq2)
                pqo4 = QuizOption(question_id=pq2.id, option_text="Dinakke eshtu baari tagobeeku?", option_kannada="ದಿನಕ್ಕೆ ಎಷ್ಟು ಬಾರಿ ತಗೋಬೇಕು?", is_correct=True, display_order=1)
                pqo5 = QuizOption(question_id=pq2.id, option_text="Maatre beda", option_kannada="ಮಾತ್ರೆ ಬೇಡ", is_correct=False, display_order=2)
                pqo6 = QuizOption(question_id=pq2.id, option_text="Elli ide?", option_kannada="ಎಲ್ಲಿ ಇದೆ?", is_correct=False, display_order=3)
                db.add_all([pqo4, pqo5, pqo6])
                db.commit()
                logger.info("Added Quiz for Scenario 18: Pharmacy")

        logger.info("Interactions seeding successfully finished!")
    except Exception as e:
        logger.error(f"Error seeding interactions: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_interactions()
