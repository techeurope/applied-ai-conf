## Speaker Image Generation

Generate consistent, professional speaker images with full body visible and transparent backgrounds.

### Full Pipeline for New Speakers

```bash
# 1. Generate square fullbody image with consistent styling
node scripts/generate-image.mjs -p "Zoom out and show the full person with complete head, shoulders and upper body. Add empty space at the top of the image above the person's head - the person should not touch the top edge. Position the person lower in the frame with padding above their head. Both shoulders must be fully visible with nothing cut off at any edge. Create a professional headshot with the person centered horizontally but positioned slightly lower with headroom above. Apply professional photo studio lighting with soft, even illumination. Apply consistent color grading: neutral to slightly warm tone (5500K), balanced contrast, natural skin tones. Keep the person exactly the same - same pose, expression, and appearance." -i public/speakers/name.jpg -o public/speakers/name_fullbody_square.png -a 1:1

# 2. Remove background
node scripts/remove-background.mjs -i public/speakers/name_fullbody_square.png -o public/speakers/name_fullbody_transparent_square.png
```

### Key Prompt Elements

The prompt must include:

1. **Zoom out**: "Zoom out and show the full person"
2. **Complete body**: "complete head, shoulders and upper body"
3. **Headroom**: "Add empty space at the top above the person's head"
4. **Both shoulders visible**: "Both shoulders must be fully visible with nothing cut off"
5. **Consistent lighting**: "professional photo studio lighting with soft, even illumination"
6. **Consistent color grading**: "neutral to slightly warm tone (5500K), balanced contrast, natural skin tones"
7. **Preserve identity**: "Keep the person exactly the same - same pose, expression, and appearance"

### Aspect Ratio

Always use `-a 1:1` for square images to ensure consistent display across the site.

### Troubleshooting

- **Shoulders cut off**: Add "The [left/right] shoulder especially must be completely visible - do not crop or cut the [left/right] side"
- **Person too tall/no headroom**: Add "Position the person lower in the frame with padding above their head"
- **Inconsistent zoom**: Add "Make the person smaller in the frame" or "Zoom out significantly"
- **Color inconsistency**: Ensure the 5500K color temperature and color grading instructions are included

### Background Removal

```bash
node scripts/remove-background.mjs -i public/speakers/name_fullbody_square.png -o public/speakers/name_fullbody_transparent_square.png
```

- Uses fal-ai/birefnet/v2 for high-quality background removal
- Outputs transparent PNG

### Update speakers.ts

After generating images, update `app/data/speakers.ts`:

```typescript
{
  name: 'Speaker Name',
  // ... other fields
  image: '/speakers/name.jpg',
  imageTransparent: '/speakers/name_fullbody_transparent_square.png',
  // ... other fields
}
```
