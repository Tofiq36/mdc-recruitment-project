export interface SkillDefinition {
  canonical: string;
  category:
    | 'Language'
    | 'Frontend'
    | 'Backend'
    | 'Database'
    | 'Cloud & DevOps'
    | 'Data & AI'
    | 'Mobile'
    | 'Testing & Tools'
    | 'Security & Architecture'
    | 'Domain & Soft';
  aliases: string[];
  implies?: string[];
  strictBoundaryOnly?: boolean;
}

export interface RoleBlueprint {
  title: string;
  coreSkills: string[];
  supportingSkills: string[];
  description: string;
}

export interface StackBundle {
  pattern: RegExp;
  skills: string[];
}

// Automatically expands high-level stack or role phrases when written in a Job Description
export const STACK_BUNDLES: StackBundle[] = [
  { pattern: /\bmern\s*(?:stack|developer|engineer)?\b/i, skills: ['MongoDB', 'Express.js', 'React', 'Node.js'] },
  { pattern: /\bmean\s*(?:stack|developer|engineer)?\b/i, skills: ['MongoDB', 'Express.js', 'Angular', 'Node.js'] },
  { pattern: /\bpern\s*(?:stack|developer|engineer)?\b/i, skills: ['PostgreSQL', 'Express.js', 'React', 'Node.js'] },
  { pattern: /\blamp\s*(?:stack|developer|engineer)?\b/i, skills: ['Linux', 'MySQL', 'PHP'] },
  { pattern: /\bjamstack\b/i, skills: ['JavaScript', 'React', 'Next.js', 'REST API'] },
  { pattern: /\bfull\s*-?\s*stack\b/i, skills: ['JavaScript', 'React', 'Node.js', 'SQL'] },
  { pattern: /\bfront\s*-?\s*end\b/i, skills: ['HTML', 'CSS', 'JavaScript', 'React'] },
  { pattern: /\bback\s*-?\s*end\b/i, skills: ['Node.js', 'SQL', 'REST API'] },
  { pattern: /\bdevops\b/i, skills: ['Docker', 'Linux', 'CI/CD', 'AWS'] },
  { pattern: /\bdata\s*scien(?:ce|tist)\b/i, skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL'] },
  { pattern: /\bqa\s*(?:automation|engineer|tester)?\b/i, skills: ['Playwright', 'Jest', 'Postman', 'Git'] },
  { pattern: /\bmobile\s*(?:app)?\s*(?:developer|engineer)\b/i, skills: ['React Native', 'Flutter', 'Android', 'iOS'] }
];

export const SKILL_TAXONOMY: SkillDefinition[] = [
  // --- PROGRAMMING, QUERY, MARKUP & STYLE LANGUAGES ---
  { canonical: 'JavaScript', category: 'Language', aliases: ['javascript', 'js', 'ecmascript', 'es6', 'es2015', 'es2020', 'vanilla js'] },
  { canonical: 'TypeScript', category: 'Language', aliases: ['typescript', 'ts', 'tsx'] },
  { canonical: 'Python', category: 'Language', aliases: ['python', 'python3', 'py', 'python 3'] },
  { canonical: 'Java', category: 'Language', aliases: ['java', 'core java', 'java 8', 'java 11', 'java 17', 'java 21', 'jdk', 'j2ee', 'jakarta ee'] },
  { canonical: 'C', category: 'Language', aliases: ['c', 'c language', 'ansi c', 'c11', 'c17', 'clang', 'embedded c', 'c programming'], strictBoundaryOnly: true },
  { canonical: 'C++', category: 'Language', aliases: ['c++', 'cpp', 'cplusplus', 'c plus plus', 'modern c++', 'c++11', 'c++17', 'c++20'], strictBoundaryOnly: true },
  { canonical: 'C#', category: 'Language', aliases: ['c#', 'csharp', 'c sharp', '.net c#'], strictBoundaryOnly: true },
  { canonical: 'Go', category: 'Language', aliases: ['golang', 'go lang', 'go programming', 'go-lang'], strictBoundaryOnly: true },
  { canonical: 'Rust', category: 'Language', aliases: ['rust', 'rustlang', 'rust lang', 'cargo'] },
  { canonical: 'PHP', category: 'Language', aliases: ['php', 'php7', 'php8', 'core php'] },
  { canonical: 'Ruby', category: 'Language', aliases: ['ruby', 'ruby on rails', 'ror', 'rails'] },
  { canonical: 'Swift', category: 'Language', aliases: ['swift', 'swiftui', 'swift ui'] },
  { canonical: 'Kotlin', category: 'Language', aliases: ['kotlin', 'kotlin multiplatform', 'kmp'] },
  { canonical: 'Dart', category: 'Language', aliases: ['dart', 'dart lang'] },
  { canonical: 'Scala', category: 'Language', aliases: ['scala'] },
  { canonical: 'R', category: 'Language', aliases: ['r programming', 'rlang', 'r language', 'rstudio', 'r studio'], strictBoundaryOnly: true },
  { canonical: 'MATLAB', category: 'Language', aliases: ['matlab', 'simulink'] },
  { canonical: 'SQL', category: 'Language', aliases: ['sql', 't-sql', 'tsql', 'pl/sql', 'plsql', 'ansi sql', 'structured query language'] },
  { canonical: 'HTML', category: 'Language', aliases: ['html', 'html5', 'hypertext markup language', 'semantic html'] },
  { canonical: 'CSS', category: 'Language', aliases: ['css', 'css3', 'cascading style sheets', 'scss', 'sass', 'less', 'stylus'] },
  { canonical: 'Bash', category: 'Language', aliases: ['bash', 'shell', 'shell scripting', 'zsh', 'sh', 'unix shell'] },
  { canonical: 'PowerShell', category: 'Language', aliases: ['powershell', 'power shell', 'ps1'] },

  // --- FRONTEND FRAMEWORKS & LIBRARIES ---
  { canonical: 'React', category: 'Frontend', aliases: ['react', 'reactjs', 'react.js', 'react js', 'react 18', 'react 19'], implies: ['JavaScript', 'HTML', 'CSS'] },
  { canonical: 'Next.js', category: 'Frontend', aliases: ['nextjs', 'next.js', 'next js', 'next-js'], implies: ['React', 'JavaScript'] },
  { canonical: 'Angular', category: 'Frontend', aliases: ['angular', 'angularjs', 'angular.js', 'angular 2+'], implies: ['TypeScript', 'HTML', 'CSS'] },
  { canonical: 'Vue.js', category: 'Frontend', aliases: ['vue', 'vuejs', 'vue.js', 'vue js', 'vue3', 'nuxt', 'nuxtjs', 'nuxt.js'], implies: ['JavaScript', 'HTML', 'CSS'] },
  { canonical: 'Svelte', category: 'Frontend', aliases: ['svelte', 'sveltekit', 'svelte kit'], implies: ['JavaScript'] },
  { canonical: 'Tailwind CSS', category: 'Frontend', aliases: ['tailwind', 'tailwindcss', 'tailwind css', 'tailwind-css'], implies: ['CSS', 'HTML'] },
  { canonical: 'Bootstrap', category: 'Frontend', aliases: ['bootstrap', 'bootstrap 4', 'bootstrap 5', 'react bootstrap'], implies: ['CSS', 'HTML'] },
  { canonical: 'Material UI', category: 'Frontend', aliases: ['material ui', 'mui', 'material-ui'], implies: ['React'] },
  { canonical: 'Redux', category: 'Frontend', aliases: ['redux', 'redux toolkit', 'rtk', 'zustand', 'mobx'], implies: ['React'] },
  { canonical: 'jQuery', category: 'Frontend', aliases: ['jquery', 'j query'], implies: ['JavaScript'] },

  // --- BACKEND FRAMEWORKS & RUNTIMES ---
  { canonical: 'Node.js', category: 'Backend', aliases: ['node', 'nodejs', 'node.js', 'node js', 'node-js'], implies: ['JavaScript'] },
  { canonical: 'Express.js', category: 'Backend', aliases: ['express', 'expressjs', 'express.js', 'express js'], implies: ['Node.js'] },
  { canonical: 'NestJS', category: 'Backend', aliases: ['nestjs', 'nest.js', 'nest js'], implies: ['Node.js', 'TypeScript'] },
  { canonical: 'Django', category: 'Backend', aliases: ['django', 'django rest framework', 'drf'], implies: ['Python'] },
  { canonical: 'Flask', category: 'Backend', aliases: ['flask'], implies: ['Python'] },
  { canonical: 'FastAPI', category: 'Backend', aliases: ['fastapi', 'fast api', 'fast-api'], implies: ['Python'] },
  { canonical: 'Spring Boot', category: 'Backend', aliases: ['spring', 'spring boot', 'springboot', 'spring-boot', 'spring mvc'], implies: ['Java'] },
  { canonical: '.NET', category: 'Backend', aliases: ['.net', 'dotnet', '.net core', 'asp.net', 'aspnet', 'entity framework'], implies: ['C#'] },
  { canonical: 'Laravel', category: 'Backend', aliases: ['laravel', 'symphony', 'symfony'], implies: ['PHP'] },
  { canonical: 'GraphQL', category: 'Backend', aliases: ['graphql', 'graph ql', 'apollo', 'apollo server'] },
  { canonical: 'REST API', category: 'Backend', aliases: ['rest api', 'restful', 'rest apis', 'restful api', 'api development', 'web api'] },
  { canonical: 'gRPC', category: 'Backend', aliases: ['grpc', 'protobuf', 'protocol buffers'] },

  // --- DATABASES ---
  { canonical: 'MongoDB', category: 'Database', aliases: ['mongodb', 'mongo', 'mongo db', 'mongoose', 'nosql', 'no sql'] },
  { canonical: 'PostgreSQL', category: 'Database', aliases: ['postgresql', 'postgres', 'psql', 'postgre sql'], implies: ['SQL'] },
  { canonical: 'MySQL', category: 'Database', aliases: ['mysql', 'my sql', 'mariadb'], implies: ['SQL'] },
  { canonical: 'SQLite', category: 'Database', aliases: ['sqlite', 'sqlite3', 'sql lite'], implies: ['SQL'] },
  { canonical: 'Oracle DB', category: 'Database', aliases: ['oracle', 'oracle db', 'oracle database'], implies: ['SQL'] },
  { canonical: 'Redis', category: 'Database', aliases: ['redis', 'in-memory cache', 'caching'] },
  { canonical: 'Firebase', category: 'Database', aliases: ['firebase', 'firestore', 'realtime database', 'supabase'] },

  // --- CLOUD & DEVOPS ---
  { canonical: 'Docker', category: 'Cloud & DevOps', aliases: ['docker', 'containerization', 'dockerfile', 'docker compose', 'docker-compose'] },
  { canonical: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['kubernetes', 'k8s', 'helm', 'eks', 'aks', 'gke'], implies: ['Docker'] },
  { canonical: 'AWS', category: 'Cloud & DevOps', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloudfront', 'iam'] },
  { canonical: 'Azure', category: 'Cloud & DevOps', aliases: ['azure', 'microsoft azure', 'azure devops'] },
  { canonical: 'GCP', category: 'Cloud & DevOps', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { canonical: 'Terraform', category: 'Cloud & DevOps', aliases: ['terraform', 'infrastructure as code', 'iac', 'ansible'] },
  { canonical: 'CI/CD', category: 'Cloud & DevOps', aliases: ['ci/cd', 'cicd', 'ci cd', 'github actions', 'jenkins', 'gitlab ci'] },
  { canonical: 'Linux', category: 'Cloud & DevOps', aliases: ['linux', 'ubuntu', 'unix', 'centos', 'debian', 'redhat'] },
  { canonical: 'Nginx', category: 'Cloud & DevOps', aliases: ['nginx', 'apache', 'reverse proxy'] },

  // --- MOBILE ---
  { canonical: 'React Native', category: 'Mobile', aliases: ['react native', 'react-native', 'reactnative', 'expo'], implies: ['React', 'JavaScript'] },
  { canonical: 'Flutter', category: 'Mobile', aliases: ['flutter'], implies: ['Dart'] },
  { canonical: 'Android', category: 'Mobile', aliases: ['android', 'android sdk', 'jetpack compose', 'android studio'] },
  { canonical: 'iOS', category: 'Mobile', aliases: ['ios', 'xcode', 'cocoa touch', 'uikit'] },

  // --- DATA & AI ---
  { canonical: 'Machine Learning', category: 'Data & AI', aliases: ['machine learning', 'ml', 'scikit-learn', 'sklearn', 'scikit learn', 'supervised learning'] },
  { canonical: 'Deep Learning', category: 'Data & AI', aliases: ['deep learning', 'dl', 'tensorflow', 'pytorch', 'keras', 'neural networks', 'cnn', 'rnn'], implies: ['Machine Learning'] },
  { canonical: 'NLP', category: 'Data & AI', aliases: ['nlp', 'natural language processing', 'tf-idf', 'tfidf', 'spacy', 'nltk', 'llm', 'langchain'] },
  { canonical: 'Computer Vision', category: 'Data & AI', aliases: ['computer vision', 'opencv', 'open cv', 'yolo', 'image processing'] },
  { canonical: 'Data Analysis', category: 'Data & AI', aliases: ['data analysis', 'data analytics', 'pandas', 'numpy', 'power bi', 'powerbi', 'tableau', 'matplotlib'] },
  { canonical: 'Apache Spark', category: 'Data & AI', aliases: ['spark', 'pyspark', 'apache spark', 'hadoop', 'big data', 'etl'] },

  // --- TESTING, AUTOMATION & TOOLS ---
  { canonical: 'Git', category: 'Testing & Tools', aliases: ['git', 'github', 'gitlab', 'bitbucket', 'version control'] },
  { canonical: 'Playwright', category: 'Testing & Tools', aliases: ['playwright', 'ms playwright', 'browser automation'] },
  { canonical: 'Selenium', category: 'Testing & Tools', aliases: ['selenium', 'selenium webdriver', 'webdriver'] },
  { canonical: 'Jest', category: 'Testing & Tools', aliases: ['jest', 'vitest', 'cypress', 'mocha', 'unit testing', 'e2e testing', 'qa testing'] },
  { canonical: 'Postman', category: 'Testing & Tools', aliases: ['postman', 'swagger', 'openapi', 'api testing'] },
  { canonical: 'Figma', category: 'Testing & Tools', aliases: ['figma', 'ui/ux', 'ui ux', 'ui-ux', 'wireframing', 'prototyping', 'adobe xd'] },

  // --- SECURITY & ARCHITECTURE ---
  { canonical: 'Microservices', category: 'Security & Architecture', aliases: ['microservices', 'micro services', 'micro-services', 'distributed systems', 'system design'] },
  { canonical: 'Kafka', category: 'Security & Architecture', aliases: ['kafka', 'apache kafka', 'rabbitmq', 'message queue', 'event driven'] },
  { canonical: 'Cybersecurity', category: 'Security & Architecture', aliases: ['cybersecurity', 'cyber security', 'information security', 'infosec', 'owasp', 'penetration testing', 'networking'] },

  // --- DOMAIN & NON-TECH ---
  { canonical: 'Communication', category: 'Domain & Soft', aliases: ['communication', 'presentation', 'stakeholder', 'teamwork', 'collaboration', 'public speaking'] },
  { canonical: 'Project Management', category: 'Domain & Soft', aliases: ['project management', 'agile', 'scrum', 'jira', 'kanban', 'leadership', 'product management'] },
  { canonical: 'Accounting & Finance', category: 'Domain & Soft', aliases: ['accounting', 'finance', 'financial analysis', 'bookkeeping', 'tally', 'excel', 'ms excel', 'audit'] },
  { canonical: 'Marketing & Sales', category: 'Domain & Soft', aliases: ['marketing', 'digital marketing', 'seo', 'sem', 'sales', 'lead generation', 'crm', 'business development'] },
  { canonical: 'HR & Operations', category: 'Domain & Soft', aliases: ['human resources', 'hr', 'recruitment', 'talent acquisition', 'operations', 'supply chain'] },
  { canonical: 'Healthcare & Clinical', category: 'Domain & Soft', aliases: ['nursing', 'clinical', 'patient care', 'healthcare', 'medical'] },
];

export const ROLE_BLUEPRINTS: RoleBlueprint[] = [
  {
    title: 'MERN Stack Developer',
    coreSkills: ['MongoDB', 'Express.js', 'React', 'Node.js'],
    supportingSkills: ['JavaScript', 'TypeScript', 'Redux', 'Tailwind CSS', 'REST API', 'Git'],
    description: 'Builds full-stack JavaScript applications using MongoDB, Express, React, and Node.js.'
  },
  {
    title: 'Frontend Developer',
    coreSkills: ['HTML', 'CSS', 'JavaScript', 'React'],
    supportingSkills: ['TypeScript', 'Tailwind CSS', 'Next.js', 'Angular', 'Vue.js', 'Redux', 'Figma', 'Git'],
    description: 'Builds responsive user interfaces and client-side web applications.'
  },
  {
    title: 'Full-Stack Web Developer',
    coreSkills: ['JavaScript', 'React', 'Node.js', 'SQL'],
    supportingSkills: ['TypeScript', 'Next.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'REST API', 'Git', 'Docker'],
    description: 'Works across frontend interfaces, backend APIs, and databases.'
  },
  {
    title: 'Backend Engineer',
    coreSkills: ['Node.js', 'SQL', 'REST API'],
    supportingSkills: ['Python', 'Java', 'Go', 'Express.js', 'NestJS', 'Spring Boot', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker'],
    description: 'Designs server-side logic, APIs, databases, and scalable services.'
  },
  {
    title: 'QA & Automation Engineer',
    coreSkills: ['Playwright', 'Jest', 'Git'],
    supportingSkills: ['Selenium', 'Postman', 'JavaScript', 'TypeScript', 'Python', 'CI/CD', 'REST API'],
    description: 'Builds automated test suites, API checks, and end-to-end quality pipelines.'
  },
  {
    title: 'Mobile App Developer',
    coreSkills: ['React Native', 'Flutter', 'Android'],
    supportingSkills: ['JavaScript', 'TypeScript', 'Dart', 'Kotlin', 'Swift', 'iOS', 'Firebase', 'Git'],
    description: 'Develops cross-platform or native mobile applications.'
  },
  {
    title: 'Data & AI Engineer',
    coreSkills: ['Python', 'Machine Learning', 'SQL'],
    supportingSkills: ['Data Analysis', 'Deep Learning', 'NLP', 'Computer Vision', 'Apache Spark', 'R'],
    description: 'Analyzes datasets and builds data-driven or machine learning solutions.'
  },
  {
    title: 'DevOps & Cloud Engineer',
    coreSkills: ['Docker', 'Linux', 'AWS'],
    supportingSkills: ['Kubernetes', 'CI/CD', 'Terraform', 'Azure', 'GCP', 'Bash', 'Nginx', 'Git'],
    description: 'Automates deployments, cloud infrastructure, and container workflows.'
  },
  {
    title: 'Software Engineer (General)',
    coreSkills: ['Git', 'SQL'],
    supportingSkills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'REST API'],
    description: 'Applies core programming, problem-solving, and software engineering fundamentals.'
  }
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function expandAliasPermutations(rawAlias: string): string[] {
  const base = rawAlias.trim().toLowerCase();
  if (!base) return [];

  const variants = new Set<string>([base]);

  const normalizedSpace = base.replace(/[.\-_/]+/g, ' ').replace(/\s+/g, ' ').trim();
  const collapsed = base.replace(/[.\-_/ ]+/g, '');
  const hyphenated = normalizedSpace.replace(/\s+/g, '-');
  const dotted = normalizedSpace.replace(/\s+/g, '.');

  variants.add(normalizedSpace);
  if (collapsed.length >= 2) variants.add(collapsed);
  if (hyphenated.length >= 3) variants.add(hyphenated);
  if (dotted.length >= 3) variants.add(dotted);

  if (base.endsWith('.js')) {
    const stem = base.slice(0, -3);
    variants.add(stem);
    variants.add(`${stem}js`);
    variants.add(`${stem} js`);
    variants.add(`${stem}-js`);
  }

  return Array.from(variants).filter(Boolean);
}

function levenshteinDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

export function extractTaxonomySkills(text: string, includeImplied = false): string[] {
  const lower = text.toLowerCase();
  const textTokens = lower
    .split(/[^a-zA-Z0-9+#.]+/)
    .filter(t => t.length >= 5);

  const found = new Set<string>();

  for (const def of SKILL_TAXONOMY) {
    const allPermutations = new Set<string>();
    for (const alias of def.aliases) {
      expandAliasPermutations(alias).forEach(v => allPermutations.add(v));
    }

    let matched = false;

    for (const variant of allPermutations) {
      if (def.strictBoundaryOnly && variant.length <= 2 && variant !== 'c#' && variant !== 'go') {
        const strictPattern = new RegExp(`(?:^|[\\s,;/|()\\[\\]])${escapeRegex(variant)}(?:$|[\\s,;/|()\\[\\]])`, 'i');
        if (strictPattern.test(lower)) {
          matched = true;
          break;
        }
        continue;
      }

      const boundaryPattern = new RegExp(`(^|[^a-zA-Z0-9+#.])${escapeRegex(variant)}([^a-zA-Z0-9+#.]|$)`, 'i');
      if (boundaryPattern.test(lower)) {
        matched = true;
        break;
      }

      if (!variant.includes(' ') && variant.length >= 6) {
        if (textTokens.some(tok => levenshteinDistance(tok, variant) === 1)) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      found.add(def.canonical);
      if (includeImplied && def.implies) {
        def.implies.forEach(imp => found.add(imp));
      }
    }
  }

  // Also expand stack bundles (e.g., "MERN stack", "Full stack", "MEAN", "PERN")
  for (const bundle of STACK_BUNDLES) {
    if (bundle.pattern.test(text)) {
      bundle.skills.forEach(s => found.add(s));
    }
  }

  return Array.from(found);
}

export function normalizeToCanonicalSkill(rawTerm: string): string {
  const cleaned = rawTerm.trim().toLowerCase();
  if (!cleaned) return '';

  const matchedSkills = extractTaxonomySkills(cleaned, false);
  if (matchedSkills.length > 0) {
    return matchedSkills[0];
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function evaluateRoleRecommendations(
  candidateSkills: string[],
  targetRoleTitle: string,
  targetMatchScore: number
): { role: string; matchScore: number; reason: string }[] {
  const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));
  const results: { role: string; matchScore: number; reason: string }[] = [];

  const cleanedTargetTitle = (targetRoleTitle || '').replace(/\.\.\.$/, '').trim();
  if (cleanedTargetTitle && cleanedTargetTitle !== 'Unspecified Role') {
    results.push({
      role: `${cleanedTargetTitle} (Target JD)`,
      matchScore: Math.round(targetMatchScore),
      reason: 'Score against the job description you entered.'
    });
  }

  for (const bp of ROLE_BLUEPRINTS) {
    const coreHits = bp.coreSkills.filter(s => candidateSet.has(s.toLowerCase()));
    const supportHits = bp.supportingSkills.filter(s => candidateSet.has(s.toLowerCase()));
    const totalHits = coreHits.length + supportHits.length;

    if (totalHits === 0) continue;

    const coreRatio = bp.coreSkills.length > 0 ? coreHits.length / bp.coreSkills.length : 0;
    const supportRatio = bp.supportingSkills.length > 0 ? supportHits.length / bp.supportingSkills.length : 0;
    const rawPct = Math.round(coreRatio * 65 + supportRatio * 35);
    const boundedScore = Math.min(96, Math.max(15, rawPct));

    const matchedList = [...coreHits, ...supportHits].slice(0, 4);
    results.push({
      role: bp.title,
      matchScore: boundedScore,
      reason: `Matched ${matchedList.join(', ')} — ${bp.description}`
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}