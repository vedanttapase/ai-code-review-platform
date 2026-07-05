export interface LanguageDef {
  id: string
  label: string
  monacoId: string
  extensions: string[]
}

export const LANGUAGES: LanguageDef[] = [
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript', extensions: ['.js', '.mjs', '.cjs', '.jsx'] },
  { id: 'typescript', label: 'TypeScript', monacoId: 'typescript', extensions: ['.ts', '.tsx', '.mts'] },
  { id: 'python', label: 'Python', monacoId: 'python', extensions: ['.py', '.pyw'] },
  { id: 'java', label: 'Java', monacoId: 'java', extensions: ['.java'] },
  { id: 'c', label: 'C', monacoId: 'c', extensions: ['.c', '.h'] },
  { id: 'cpp', label: 'C++', monacoId: 'cpp', extensions: ['.cpp', '.cc', '.cxx', '.hpp'] },
  { id: 'csharp', label: 'C#', monacoId: 'csharp', extensions: ['.cs'] },
  { id: 'go', label: 'Go', monacoId: 'go', extensions: ['.go'] },
  { id: 'rust', label: 'Rust', monacoId: 'rust', extensions: ['.rs'] },
  { id: 'ruby', label: 'Ruby', monacoId: 'ruby', extensions: ['.rb'] },
  { id: 'php', label: 'PHP', monacoId: 'php', extensions: ['.php'] },
  { id: 'swift', label: 'Swift', monacoId: 'swift', extensions: ['.swift'] },
  { id: 'kotlin', label: 'Kotlin', monacoId: 'kotlin', extensions: ['.kt', '.kts'] },
  { id: 'scala', label: 'Scala', monacoId: 'scala', extensions: ['.scala'] },
  { id: 'dart', label: 'Dart', monacoId: 'dart', extensions: ['.dart'] },
  { id: 'r', label: 'R', monacoId: 'r', extensions: ['.r', '.R'] },
  { id: 'sql', label: 'SQL', monacoId: 'sql', extensions: ['.sql'] },
  { id: 'shell', label: 'Shell / Bash', monacoId: 'shell', extensions: ['.sh', '.bash', '.zsh'] },
  { id: 'html', label: 'HTML', monacoId: 'html', extensions: ['.html', '.htm'] },
  { id: 'css', label: 'CSS', monacoId: 'css', extensions: ['.css', '.scss', '.less'] },
  { id: 'perl', label: 'Perl', monacoId: 'perl', extensions: ['.pl', '.pm'] },
  { id: 'lua', label: 'Lua', monacoId: 'lua', extensions: ['.lua'] },
  { id: 'haskell', label: 'Haskell', monacoId: 'haskell', extensions: ['.hs'] },
  { id: 'elixir', label: 'Elixir', monacoId: 'elixir', extensions: ['.ex', '.exs'] },
  { id: 'objective-c', label: 'Objective-C', monacoId: 'objective-c', extensions: ['.m', '.mm'] },
  { id: 'matlab', label: 'MATLAB', monacoId: 'matlab', extensions: ['.mat'] },
  { id: 'julia', label: 'Julia', monacoId: 'julia', extensions: ['.jl'] },
  { id: 'solidity', label: 'Solidity', monacoId: 'sol', extensions: ['.sol'] },
]

export function detectLanguageFromFilename(filename: string): LanguageDef | undefined {
  const lower = filename.toLowerCase()
  return LANGUAGES.find((l) => l.extensions.some((ext) => lower.endsWith(ext)))
}

export function getLanguage(id: string): LanguageDef | undefined {
  return LANGUAGES.find((l) => l.id === id)
}

export type ReviewMode = 'detect' | 'explain' | 'fix'

export const MODES: { id: ReviewMode; label: string; description: string }[] = [
  {
    id: 'detect',
    label: 'Detect',
    description: 'Find bugs, security vulnerabilities, and code smells',
  },
  {
    id: 'explain',
    label: 'Explain',
    description: 'Line-by-line explanation of what the code does',
  },
  {
    id: 'fix',
    label: 'Fix',
    description: 'Auto-fix issues and return corrected code with a diff',
  },
]
