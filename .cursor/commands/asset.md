**Main PNG:**

```bash
node scripts/generate-image.mjs -p "<MAIN_PROMPT>" -o public/speakers/name_fullbody_transparent.png
```

**Transparent PNG (background removal):**

```bash
node scripts/remove-background.mjs -i public/speakers/name.png
```

- Uses fal-ai/birefnet/v2 for high-quality background removal
- Preserves the original with background
- Transparent version can be composited on any background later
