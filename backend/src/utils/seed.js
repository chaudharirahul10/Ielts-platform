require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Admin
  const adminExists = await User.findOne({ email: 'admin@ieltspro.com' });
  if (!adminExists) {
    await User.create({ name:'Platform Admin', email:'admin@ieltspro.com', password:'AdminPass123!', role:'admin', isEmailVerified:true });
    console.log('✅ Admin: admin@ieltspro.com / AdminPass123!');
  }

  // Demo student
  const studentExists = await User.findOne({ email: 'student@ieltspro.com' });
  if (!studentExists) {
    await User.create({
      name:'Arjun Sharma', email:'student@ieltspro.com', password:'Student123!',
      role:'student', isEmailVerified:true, targetBand:7.5, currentLevel:6.0, examType:'academic',
      scores:{ overall:6.5, listening:6.5, reading:7.0, writing:6.0, speaking:6.5 },
      streak:14, totalStudyTimeMin:2820, testsCompleted:8, totalQuestionsAnswered:342,
    });
    console.log('✅ Student: student@ieltspro.com / Student123!');
  }

  // Questions
  const questions = [
    { module:'listening', audioSection:2, questionText:'According to the speaker, what is the main purpose of the new guided tour system?', questionType:'mcq', options:['To reduce staff','To allow self-paced exploration','To provide detailed exhibit information','To attract younger visitors'], correctAnswer:'To provide detailed exhibit information', explanation:'The speaker says the system provides comprehensive contextual information.', difficulty:'intermediate', tags:['section2','museum'] },
    { module:'listening', audioSection:1, questionText:'What time does the swimming pool open on weekends?', questionType:'fill_blank', correctAnswer:'8:30 am', explanation:'The receptionist states the pool opens at 8:30 am on Saturday and Sunday.', difficulty:'beginner', tags:['section1','facilities'] },
    { module:'reading', passageTitle:'The Science of Sleep', passage:'Sleep is one of the most fundamental biological processes...', questionText:'Sleep was traditionally understood primarily as a restorative process.', questionType:'true_false_ng', correctAnswer:'TRUE', explanation:'The passage states scientists believed sleep was "primarily a period of rest."', difficulty:'intermediate', examType:'academic', tags:['true-false-ng','science'] },
    { module:'reading', passageTitle:'Urban Planning', passage:'Modern cities face unprecedented challenges...', questionText:'The author suggests that green spaces improve mental health in urban areas.', questionType:'true_false_ng', correctAnswer:'NOT GIVEN', explanation:'The passage mentions green spaces but does not discuss mental health specifically.', difficulty:'advanced', examType:'academic', tags:['true-false-ng','urban'] },
    { module:'writing', taskType:'task2', taskSubtype:'discussion', questionText:'Some people believe the best way to improve public health is through increasing sports facilities. Others believe other measures are required. Discuss both views and give your opinion.', questionType:'essay', difficulty:'intermediate', tags:['health','discussion'] },
    { module:'writing', taskType:'task1', taskSubtype:'bar_chart', questionText:'The bar chart shows the percentage of people aged 65+ in three countries between 1940 and 2040. Summarise the information and make comparisons where relevant.', questionType:'essay', difficulty:'intermediate', tags:['graphs','demographics'] },
    { module:'speaking', speakingPart:1, questionText:'Tell me about your hometown. What do you like about it?', questionType:'short_answer', difficulty:'beginner', tags:['part1','hometown'] },
    { module:'speaking', speakingPart:2, cueCard:'Describe a person who has had a great influence on your life.\n\nYou should say:\n• who this person is\n• how you know them\n• how they influenced you\n\nAnd explain why their influence has been important.', questionText:'Describe a person who has had a great influence on your life.', questionType:'cue_card', difficulty:'intermediate', tags:['part2','people'] },
    { module:'speaking', speakingPart:3, questionText:'Do you think it is important for governments to invest in public arts and culture? Why?', questionType:'short_answer', difficulty:'advanced', tags:['part3','culture','government'] },
    { module:'listening', audioSection:3, questionText:'Both students agree that the most challenging aspect of their project is:', questionType:'mcq', options:['Finding sources','Structuring the methodology','Interpreting results','Working with supervisor'], correctAnswer:'Structuring the methodology', explanation:'Both say "methodology was the hardest part to write up."', difficulty:'advanced', tags:['section3','academic'] },
  ];

  let seeded = 0;
  for (const q of questions) {
    await Question.updateOne({ questionText: q.questionText }, { $set: q }, { upsert: true });
    seeded++;
  }
  console.log(`✅ Seeded ${seeded} questions`);
  console.log('🎉 Seed complete!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
