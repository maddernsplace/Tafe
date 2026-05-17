const STOP_WORDS = new Set([
  'the','a','an','and','or','in','of','with','to','for','is','are','was','were',
  'be','been','as','at','on','by','from','that','this','it','its','not','i','me',
  'my','we','our','you','your','they','their','he','she','his','her','do','did',
  'have','had','will','would','can','could','should','may','might','must','shall',
  'when','where','how','what','who','which','if','then','than','but','so','yet',
  'both','either','neither','each','every','all','any','few','more','most','some',
  'such','no','only','same','just','because','about','after','before','during',
  'through','across','between','against','without','within','along','following',
  'behind','beyond','plus','except','up','down','out','off','over','under','again',
  'further','once','into','onto','upon','per','via','own','other','another',
  'need','use','using','used','make','making','made','take','taking','taken',
  'give','giving','given','ensure','also','today','got','went','was','were',
  'then','there','here','their','them','these','those','her','his','its',
  'two','one','three','four','five','six','seven','eight','nine','ten',
])

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

// Pull top-level bullet skills out of a skills-list note's markdown
export function parseSkillsFromNote(note) {
  const skills = []
  for (const raw of note.content.split('\n')) {
    const line = raw.trim()
    // Only top-level bullets (not sub-bullets that are examples)
    if (/^-\s/.test(line) && !/^\s{2,}/.test(raw)) {
      // Strip markdown bold/italic, remove example sub-text after the bullet
      const text = line.slice(2).replace(/\*[^*]+\*/g, '').replace(/\s*\(.*?\)/g, '').trim()
      // Skip task-style lines (locate, complete, arrange, find out, print, etc.)
      if (
        text.length > 30 &&
        !/^(locate|complete|arrange|find out|print|submit|record|read|consult|access|assess|engage|list|collaborate|answer|write|document|conduct)/i.test(text)
      ) {
        skills.push(text)
      }
    }
  }
  return skills
}

// Match reflection text against all skills-list notes.
// Returns [{ noteId, courseCode, matchedSkills: [{ text, score, matchedWords }] }]
export function matchReflectionToSkills(reflectionText, skillsListNotes) {
  if (!reflectionText?.trim() || !skillsListNotes?.length) return []

  const reflTokens = new Set(tokenize(reflectionText))
  const results = []

  for (const note of skillsListNotes) {
    const skills = parseSkillsFromNote(note)
    const matchedSkills = []

    for (const skill of skills) {
      const skillTokens = tokenize(skill)
      if (!skillTokens.length) continue
      const matchedWords = skillTokens.filter(t => reflTokens.has(t))
      if (matchedWords.length > 0) {
        matchedSkills.push({
          text: skill,
          score: matchedWords.length / skillTokens.length,
          matchedWords,
        })
      }
    }

    if (matchedSkills.length > 0) {
      results.push({
        noteId: note.id,
        courseCode: note.courseCode,
        matchedSkills: matchedSkills.sort((a, b) => b.score - a.score),
      })
    }
  }

  return results.sort((a, b) => {
    const sa = a.matchedSkills.reduce((s, sk) => s + sk.score, 0)
    const sb = b.matchedSkills.reduce((s, sk) => s + sk.score, 0)
    return sb - sa
  })
}
