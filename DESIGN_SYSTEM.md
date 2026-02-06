## Design System: Modern Todo (Demo)

### Pattern
- **Name:** App Store Style Landing
- **Conversion Focus:** Show real screenshots. Include ratings (4.5+ stars). QR code for mobile. Platform-specific CTAs.
- **CTA Placement:** Download buttons prominent (App Store + Play Store) throughout
- **Color Strategy:** Dark/light matching app store feel. Star ratings in gold. Screenshots with device frames.
- **Sections:** 1. Hero with device mockup, 2. Screenshots carousel, 3. Features with icons, 4. Reviews/ratings, 5. Download CTAs

### Style
- **Name:** Flat Design
- **Keywords:** 2D, minimalist, bold colors, no shadows, clean lines, simple shapes, typography-focused, modern, icon-heavy
- **Best For:** Web apps, mobile apps, cross-platform, startup MVPs, user-friendly, SaaS, dashboards, corporate
- **Performance:** ⚡ Excellent | **Accessibility:** ✓ WCAG AAA

### Colors
| Role | Hex |
|------|-----|
| Primary | #0D9488 |
| Secondary | #14B8A6 |
| CTA | #F97316 |
| Background | #F0FDFA |
| Text | #134E4A |

*Notes: Teal focus + action orange*

### Typography
- **Heading:** Plus Jakarta Sans
- **Body:** Plus Jakarta Sans
- **Mood:** friendly, modern, saas, clean, approachable, professional
- **Best For:** SaaS products, web apps, dashboards, B2B, productivity tools
- **Google Fonts:** https://fonts.google.com/share?selection.family=Plus+Jakarta+Sans:wght@300;400;500;600;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
```

### Key Effects
No gradients/shadows, simple hover (color/opacity shift), fast loading, clean transitions (150-200ms ease), minimal icons

### Avoid (Anti-patterns)
- Complex onboarding
- Slow performance

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
