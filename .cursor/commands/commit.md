---
description: Generate conventional commit messages and run git commit with them
alwaysApply: true
---

# Commit Message Rule

Rules:

1. For every code change, generate a **commit message** following [Conventional Commits](https://www.conventionalcommits.org/) format.  
2. Commit messages must be **clear, concise, and descriptive**; summarize the change in **50 characters or less**.  
3. Include an optional longer description (72 characters per line) if needed for clarity.  
4. Prefix must indicate type of change:  
   - `feat:` for new features  
   - `fix:` for bug fixes  
   - `chore:` for routine tasks or refactoring  
   - `docs:` for documentation changes  
   - `test:` for adding or modifying tests  
5. Avoid emojis, unless explicitly requested.  
6. Do **not** include implementation details in the commit title; reserve those for the body.  
7. Apply this rule to all languages, file types, and project folders.  

## Commit execution

When the user invokes this command or asks for a commit in this context:

1. After producing the message, **run** `git commit` in the correct repository using that message. Use the title as the first `-m` argument; for a multi-line body, use additional `-m` arguments (one per logical paragraph or bullet block), or a heredoc where the shell supports it safely.
2. **Staging**: If nothing is staged, do **not** run `git add -A` unless the user explicitly asked to stage and commit everything. Show `git status`, then either ask what to stage or stage only files clearly tied to the current task if the user already implied committing that scope.
3. **Safety**: If `git status` shows a large or unrelated set of changes, do not commit without user confirmation.
4. **Push**: Do not run `git push` unless the user explicitly asks to push.

> Example:  
> ```
> feat(auth): add OAuth2 login flow
>  
> - Added Google and GitHub login options
> - Updated AuthContext to handle tokens
> ```  