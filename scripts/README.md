# VNTV Scripts

This directory contains utility scripts for managing the VNTV platform.

## Available Scripts

### Create Admin Author

Creates a default "VNTV Admin" author linked to the super_admin account (vnationtech7@gmail.com).

```bash
npm run setup:admin-author
```

**When to use:**
- Initial setup after database migration
- If the admin author was accidentally deleted
- When setting up a new environment

**What it does:**
1. Looks for the profile with email `vnationtech7@gmail.com`
2. Checks if an author already exists for that profile
3. Creates a new author named "VNTV Admin" if one doesn't exist
4. Links the author to the admin profile

**Output:**
- Success: Shows the created author's name, slug, and ID
- Already exists: Shows the existing author's details
- Error: Shows why the operation failed (e.g., profile not found)

## Adding New Scripts

1. Create a new `.ts` file in this directory
2. Add appropriate error handling and user feedback
3. Add an npm script in `package.json` for easy access
4. Document it in this README
