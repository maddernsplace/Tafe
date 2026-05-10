// Sample starter data for the TAFE Study Dashboard
// Replace or extend this data via the UI once the app is running.

export const SAMPLE_COURSES = [
  {
    id: 'course-1',
    code: 'CHCEDS049',
    name: 'Support Students with Learning Differences',
    description:
      'Develop skills to support students who have learning differences in educational settings, including understanding diverse learning needs and implementing appropriate strategies.',
    status: 'active',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    colour: '#6366f1',
    createdAt: new Date('2025-02-01').toISOString(),
  },
  {
    id: 'course-2',
    code: 'CHCEDS033',
    name: 'Contribute to Student Education',
    description:
      'Understand the role of an education support worker and contribute effectively to student learning outcomes under the direction of a teacher.',
    status: 'active',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    colour: '#10b981',
    createdAt: new Date('2025-02-01').toISOString(),
  },
  {
    id: 'course-3',
    code: 'CHCDIV001',
    name: 'Work with Diverse People',
    description:
      'Develop skills to work respectfully with people from diverse social, cultural, and religious backgrounds.',
    status: 'active',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    colour: '#f59e0b',
    createdAt: new Date('2025-02-01').toISOString(),
  },
]

export const SAMPLE_ASSESSMENTS = [
  {
    id: 'assess-1',
    title: 'Observation Task – Classroom Support',
    courseId: 'course-1',
    courseCode: 'CHCEDS049',
    dueDate: '2025-06-15',
    status: 'In Progress',
    description:
      'Complete an observation task in a classroom setting, documenting support strategies used for students with learning differences.',
    notes: 'Remember to get supervisor sign-off on observation sheet.',
    linkedFiles: [],
    createdAt: new Date('2025-03-01').toISOString(),
  },
  {
    id: 'assess-2',
    title: 'Legal and Ethical Responsibilities Report',
    courseId: 'course-2',
    courseCode: 'CHCEDS033',
    dueDate: '2025-05-20',
    status: 'Not Started',
    description:
      'Write a report outlining the legal and ethical responsibilities of an education support worker.',
    notes: '',
    linkedFiles: [],
    createdAt: new Date('2025-03-15').toISOString(),
  },
  {
    id: 'assess-3',
    title: 'Diversity Reflection Journal',
    courseId: 'course-3',
    courseCode: 'CHCDIV001',
    dueDate: '2025-05-05',
    status: 'Submitted',
    description:
      'Keep a reflection journal documenting your experiences working with diverse people and cultural groups.',
    notes: 'Submitted via the TAFE portal on 02/05/2025.',
    linkedFiles: [],
    createdAt: new Date('2025-03-10').toISOString(),
  },
  {
    id: 'assess-4',
    title: 'Support Plan Development',
    courseId: 'course-1',
    courseCode: 'CHCEDS049',
    dueDate: '2025-07-30',
    status: 'Not Started',
    description:
      'Develop an individual support plan for a student with identified learning differences.',
    notes: '',
    linkedFiles: [],
    createdAt: new Date('2025-04-01').toISOString(),
  },
  {
    id: 'assess-5',
    title: 'Communication Strategies Portfolio',
    courseId: 'course-2',
    courseCode: 'CHCEDS033',
    dueDate: '2025-04-28',
    status: 'Resubmit Required',
    description:
      'Compile a portfolio demonstrating various communication strategies used in the classroom.',
    notes: 'Feedback received – need to expand section 3.',
    linkedFiles: [],
    createdAt: new Date('2025-03-20').toISOString(),
  },
]

export const SAMPLE_NOTES = [
  {
    id: 'note-1',
    title: 'Understanding Learning Differences – Key Concepts',
    courseId: 'course-1',
    courseCode: 'CHCEDS049',
    assessmentId: 'assess-1',
    tags: ['learning differences', 'dyslexia', 'ADHD', 'key concepts'],
    content: `# Understanding Learning Differences

## What are Learning Differences?

Learning differences refer to a range of conditions that affect how a person processes information. Common learning differences include:

- **Dyslexia** – difficulty with reading and language processing
- **Dyscalculia** – difficulty with numbers and mathematics
- **ADHD** – attention deficit hyperactivity disorder
- **Autism Spectrum Disorder (ASD)** – affects social communication and behaviour

## Key Support Strategies

1. **Universal Design for Learning (UDL)** – design lessons accessible to all students
2. **Differentiated Instruction** – adjust teaching methods to individual needs
3. **Assistive Technology** – text-to-speech, visual timers, spelling tools
4. **Positive Reinforcement** – build confidence through encouragement

## Legal Framework in Australia

Education support workers must follow:
- Disability Discrimination Act 1992
- Disability Standards for Education 2005
- School's individual support policies

> Source: Claude AI study session – verified against TAFE course materials`,
    createdAt: new Date('2025-03-05').toISOString(),
    updatedAt: new Date('2025-03-05').toISOString(),
  },
  {
    id: 'note-2',
    title: 'Cultural Diversity in Australian Classrooms',
    courseId: 'course-3',
    courseCode: 'CHCDIV001',
    assessmentId: 'assess-3',
    tags: ['diversity', 'culture', 'inclusion', 'Australia'],
    content: `# Cultural Diversity in Australian Classrooms

## Why Diversity Matters

Australia is one of the most culturally diverse nations in the world. Schools reflect this diversity with students from:
- Indigenous Australian backgrounds
- Migrant and refugee families
- Various religious traditions
- Diverse language backgrounds

## Working Respectfully with Diverse People

### Key Principles
- **Respect** – acknowledge and value different perspectives
- **Inclusion** – ensure every student feels welcome
- **Non-discrimination** – treat all students equally
- **Cultural safety** – create an environment free from racism

## Practical Strategies

1. Learn about your students' cultural backgrounds
2. Use inclusive language at all times
3. Celebrate cultural events and traditions
4. Challenge your own biases and assumptions
5. Consult with families and communities

## Reflection Prompt

Think about a time when you worked with someone from a different background. What did you learn from that experience?`,
    createdAt: new Date('2025-03-12').toISOString(),
    updatedAt: new Date('2025-03-12').toISOString(),
  },
]

export const SAMPLE_FILES = [
  {
    id: 'file-1',
    name: 'CHCEDS049_Course_Guide.pdf',
    type: 'application/pdf',
    size: 245760,
    courseId: 'course-1',
    courseCode: 'CHCEDS049',
    assessmentId: null,
    tags: ['course guide', 'reference'],
    uploadDate: new Date('2025-02-03').toISOString(),
    dataUrl: null,
  },
  {
    id: 'file-2',
    name: 'Observation_Task_Template.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 32768,
    courseId: 'course-1',
    courseCode: 'CHCEDS049',
    assessmentId: 'assess-1',
    tags: ['template', 'observation'],
    uploadDate: new Date('2025-03-01').toISOString(),
    dataUrl: null,
  },
  {
    id: 'file-3',
    name: 'Diversity_Reflection_Rubric.pdf',
    type: 'application/pdf',
    size: 102400,
    courseId: 'course-3',
    courseCode: 'CHCDIV001',
    assessmentId: 'assess-3',
    tags: ['rubric', 'assessment'],
    uploadDate: new Date('2025-03-10').toISOString(),
    dataUrl: null,
  },
]
